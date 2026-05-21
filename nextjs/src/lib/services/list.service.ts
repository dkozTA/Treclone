import { ListRepository } from '@/lib/repositories/list.repository'
import { createListSchema, updateListSchema } from '@/lib/validation/list'
import { AuthError, AuthErrorCode } from '@/lib/utils/error-handler'
import prisma from '@/lib/db/prisma'

export class ListService {
    private readonly repository = new ListRepository()

    async getListsByBoardId(boardId: bigint, userId: bigint) {
        try {
            // Verify board exists and user owns it
            const board = await prisma.board.findUnique({
                where: { id: boardId },
                select: { id: true, ownerId: true },
            })

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

            const lists = await this.repository.getListsByBoardId(boardId)
            return lists
        } catch (error) {
            if (error instanceof AuthError) throw error
            throw new AuthError(
                'Failed to fetch lists',
                500,
                AuthErrorCode.INTERNAL_ERROR
            )
        }
    }

    async getListById(listId: bigint, userId: bigint) {
        try {
            const list = await this.repository.getListById(listId)

            if (!list) {
                throw new AuthError('List not found', 404, AuthErrorCode.USER_NOT_FOUND)
            }

            // Verify user owns the board
            const board = await prisma.board.findUnique({
                where: { id: list.boardId },
                select: { id: true, ownerId: true },
            })

            if (board?.ownerId !== userId) {
                throw new AuthError(
                    'Forbidden - you do not own this board',
                    403,
                    AuthErrorCode.INVALID_CREDENTIALS
                )
            }

            return list
        } catch (error) {
            if (error instanceof AuthError) throw error
            throw new AuthError(
                'Failed to fetch list',
                500,
                AuthErrorCode.INTERNAL_ERROR
            )
        }
    }

    async createList(boardId: bigint, userId: bigint, credentials: unknown) {
        try {
            // Verify board exists and user owns it
            const board = await prisma.board.findUnique({
                where: { id: boardId },
                select: { id: true, ownerId: true },
            })

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

            const validatedData = createListSchema.parse(credentials)

            // If position not provided, calculate it based on existing lists
            let position = validatedData.position
            if (position === undefined) {
                const lastList = await prisma.list.findFirst({
                    where: { boardId },
                    orderBy: { position: 'desc' },
                    select: { position: true }
                })
                position = (lastList?.position ?? -1) + 1
            }

            const list = await this.repository.createList(boardId, {
                title: validatedData.title,
                position,
            })

            return list
        } catch (error) {
            if (error instanceof AuthError) throw error
            throw new AuthError(
                'Failed to create list',
                500,
                AuthErrorCode.INTERNAL_ERROR
            )
        }
    }

    async updateList(listId: bigint, userId: bigint, credentials: unknown) {
        try {
            const list = await this.repository.getListById(listId)

            if (!list) {
                throw new AuthError('List not found', 404, AuthErrorCode.USER_NOT_FOUND)
            }

            // Verify user owns the board
            const board = await prisma.board.findUnique({
                where: { id: list.boardId },
                select: { id: true, ownerId: true },
            })

            if (board?.ownerId !== userId) {
                throw new AuthError(
                    'Forbidden - you do not own this board',
                    403,
                    AuthErrorCode.INVALID_CREDENTIALS
                )
            }

            const validatedData = updateListSchema.parse(credentials)

            const updateData: any = {}

            if (validatedData.title) {
                updateData.title = validatedData.title
            }

            if (validatedData.position !== undefined) {
                updateData.position = validatedData.position
            }

            const updated = await this.repository.updateList(listId, updateData)
            return updated
        } catch (error) {
            if (error instanceof AuthError) throw error
            throw new AuthError(
                'Failed to update list',
                500,
                AuthErrorCode.INTERNAL_ERROR
            )
        }
    }

    async deleteList(listId: bigint, userId: bigint) {
        try {
            const list = await this.repository.getListById(listId)

            if (!list) {
                throw new AuthError('List not found', 404, AuthErrorCode.USER_NOT_FOUND)
            }

            // Verify user owns the board
            const board = await prisma.board.findUnique({
                where: { id: list.boardId },
                select: { id: true, ownerId: true },
            })

            if (board?.ownerId !== userId) {
                throw new AuthError(
                    'Forbidden - you do not own this board',
                    403,
                    AuthErrorCode.INVALID_CREDENTIALS
                )
            }

            await this.repository.deleteList(listId)
        } catch (error) {
            if (error instanceof AuthError) throw error
            throw new AuthError(
                'Failed to delete list',
                500,
                AuthErrorCode.INTERNAL_ERROR
            )
        }
    }
}