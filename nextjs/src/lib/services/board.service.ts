import { BoardRepository } from '@/lib/repositories/board.repository'
import { createBoardSchema, updateBoardSchema } from '@/lib/validation/board'
import { AuthError, AuthErrorCode } from '@/lib/utils/error-handler'
import prisma from '@/lib/db/prisma'

export class BoardService {
    private readonly repository = new BoardRepository()

    async getBoardsByWorkspaceId(workspaceId: bigint, userId: bigint) {
        try {
            // Verify workspace exists and user owns it
            const workspace = await prisma.workspace.findUnique({
                where: { id: workspaceId },
                select: { id: true, ownerId: true },
            })

            if (!workspace) {
                throw new AuthError('Workspace not found', 404, AuthErrorCode.USER_NOT_FOUND)
            }

            if (workspace.ownerId !== userId) {
                throw new AuthError(
                    'Forbidden - not the workspace owner',
                    403,
                    AuthErrorCode.INVALID_CREDENTIALS
                )
            }

            const boards = await this.repository.getBoardsByWorkspaceId(workspaceId)
            return boards
        } catch (error) {
            if (error instanceof AuthError) throw error
            throw new AuthError(
                'Failed to fetch boards',
                500,
                AuthErrorCode.INTERNAL_ERROR
            )
        }
    }

    async getBoardById(boardId: bigint, userId: bigint) {
        try {
            const board = await this.repository.getBoardById(boardId)

            if (!board) {
                throw new AuthError('Board not found', 404, AuthErrorCode.USER_NOT_FOUND)
            }

            if (board.ownerId !== userId) {
                throw new AuthError(
                    'Forbidden - you do not own this board',
                    403,
                    AuthErrorCode.INVALID_CREDENTIALS
                )
            }

            return board
        } catch (error) {
            if (error instanceof AuthError) throw error
            throw new AuthError(
                'Failed to fetch board',
                500,
                AuthErrorCode.INTERNAL_ERROR
            )
        }
    }

    async createBoard(workspaceId: bigint, userId: bigint, credentials: unknown) {
        try {
            // Verify workspace exists and user owns it
            const workspace = await prisma.workspace.findUnique({
                where: { id: workspaceId },
                select: { id: true, ownerId: true },
            })

            if (!workspace) {
                throw new AuthError('Workspace not found', 404, AuthErrorCode.USER_NOT_FOUND)
            }

            if (workspace.ownerId !== userId) {
                throw new AuthError(
                    'Forbidden - not the workspace owner',
                    403,
                    AuthErrorCode.INVALID_CREDENTIALS
                )
            }

            const validatedData = createBoardSchema.parse(credentials)

            const board = await this.repository.createBoard(workspaceId, userId, {
                title: validatedData.title,
                description: validatedData.description,
            })

            return board
        } catch (error) {
            if (error instanceof AuthError) throw error
            throw new AuthError(
                'Failed to create board',
                500,
                AuthErrorCode.INTERNAL_ERROR
            )
        }
    }

    async updateBoard(boardId: bigint, userId: bigint, credentials: unknown) {
        try {
            const board = await this.repository.getBoardById(boardId)

            if (!board) {
                throw new AuthError('Board not found', 404, AuthErrorCode.USER_NOT_FOUND)
            }

            if (board.ownerId !== userId) {
                throw new AuthError(
                    'Forbidden - you do not own this board',
                    403,
                    AuthErrorCode.INVALID_CREDENTIALS
                )
            }

            const validatedData = updateBoardSchema.parse(credentials)

            const updateData: any = {}

            if (validatedData.title) {
                updateData.title = validatedData.title
            }

            if (validatedData.description !== undefined) {
                updateData.description = validatedData.description
            }

            const updated = await this.repository.updateBoard(boardId, updateData)
            return updated
        } catch (error) {
            if (error instanceof AuthError) throw error
            throw new AuthError(
                'Failed to update board',
                500,
                AuthErrorCode.INTERNAL_ERROR
            )
        }
    }

    async deleteBoard(boardId: bigint, userId: bigint) {
        try {
            const board = await this.repository.getBoardById(boardId)

            if (!board) {
                throw new AuthError('Board not found', 404, AuthErrorCode.USER_NOT_FOUND)
            }

            if (board.ownerId !== userId) {
                throw new AuthError(
                    'Forbidden - you do not own this board',
                    403,
                    AuthErrorCode.INVALID_CREDENTIALS
                )
            }

            await this.repository.deleteBoard(boardId)
        } catch (error) {
            if (error instanceof AuthError) throw error
            throw new AuthError(
                'Failed to delete board',
                500,
                AuthErrorCode.INTERNAL_ERROR
            )
        }
    }
}