import { BoardRepository } from '@/lib/repositories/board.repository'
import { createBoardSchema, updateBoardSchema } from '@/lib/validation/board'
import { AuthError, AuthErrorCode } from '@/lib/utils/error-handler'
import prisma from '@/lib/db/prisma'

export class BoardService {
    private readonly repository = new BoardRepository()

    async getBoardsByWorkspaceId(workspaceId: bigint, userId: bigint) {
        try {
            const workspace = await prisma.workspace.findUnique({
                where: { id: workspaceId },
                select: { id: true, ownerId: true },
            })

            if (!workspace) {
                throw new AuthError(
                    'Workspace not found',
                    404,
                    AuthErrorCode.USER_NOT_FOUND
                )
            }

            const member = await prisma.workspaceMember.findFirst({
                where: { workspaceId, userId },
                select: { id: true },
            })

            if (workspace.ownerId !== userId && !member) {
                throw new AuthError(
                    'Forbidden - you do not have access to this workspace',
                    403,
                    AuthErrorCode.FORBIDDEN
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

            const member = board.workspaceId
                ? await prisma.workspaceMember.findFirst({
                    where: { workspaceId: board.workspaceId, userId },
                    select: { id: true },
                })
                : null

            if (board.ownerId !== userId && !member) {
                throw new AuthError(
                    'Forbidden - you do not have access to this board',
                    403,
                    AuthErrorCode.FORBIDDEN
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
            const workspace = await prisma.workspace.findUnique({
                where: { id: workspaceId },
                select: { id: true, ownerId: true },
            })

            if (!workspace) {
                throw new AuthError(
                    'Workspace not found',
                    404,
                    AuthErrorCode.USER_NOT_FOUND
                )
            }

            if (workspace.ownerId !== userId) {
                throw new AuthError(
                    'Forbidden - not the workspace owner',
                    403,
                    AuthErrorCode.FORBIDDEN
                )
            }

            const validatedData = createBoardSchema.parse(credentials)
            const title = validatedData.title.trim()

            const existingBoard = await prisma.board.findFirst({
                where: {
                    workspaceId,
                    title,
                },
                select: { id: true },
            })

            if (existingBoard) {
                throw new AuthError(
                    'Board title already exists in this workspace',
                    409,
                    AuthErrorCode.VALIDATION_ERROR
                )
            }

            const board = await this.repository.createBoard(workspaceId, userId, {
                title,
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
                    AuthErrorCode.FORBIDDEN
                )
            }

            const validatedData = updateBoardSchema.parse(credentials)

            const updateData: {
                title?: string
                description?: string
            } = {}

            if (validatedData.title !== undefined) {
                const nextTitle = validatedData.title.trim()

                const existingBoard = await prisma.board.findFirst({
                    where: {
                        workspaceId: board.workspaceId,
                        title: nextTitle,
                        id: { not: boardId },
                    },
                    select: { id: true },
                })

                if (existingBoard) {
                    throw new AuthError(
                        'Board title already exists in this workspace',
                        409,
                        AuthErrorCode.VALIDATION_ERROR
                    )
                }

                updateData.title = nextTitle
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
                    AuthErrorCode.FORBIDDEN
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
