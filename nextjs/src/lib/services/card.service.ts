import { CardRepository } from '@/lib/repositories/card.repository'
import { createCardSchema, updateCardSchema, moveCardSchema } from '@/lib/validation/card'
import { AuthError, AuthErrorCode } from '@/lib/utils/error-handler'
import prisma from '@/lib/db/prisma'

export class CardService {
    private readonly repository = new CardRepository()

    async getCardsByListId(listId: bigint, userId: bigint) {
        try {
            // Verify list exists and board is owned by user
            const list = await prisma.list.findUnique({
                where: { id: listId },
                select: { id: true, boardId: true },
            })

            if (!list) {
                throw new AuthError('List not found', 404, AuthErrorCode.USER_NOT_FOUND)
            }

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

            const cards = await this.repository.getCardsByListId(listId)
            return cards
        } catch (error) {
            if (error instanceof AuthError) throw error
            throw new AuthError(
                'Failed to fetch cards',
                500,
                AuthErrorCode.INTERNAL_ERROR
            )
        }
    }

    async getCardById(cardId: bigint, userId: bigint) {
        try {
            const card = await this.repository.getCardById(cardId)

            if (!card) {
                throw new AuthError('Card not found', 404, AuthErrorCode.USER_NOT_FOUND)
            }

            // Verify user owns the board
            const board = await prisma.board.findUnique({
                where: { id: card.list.boardId },
                select: { id: true, ownerId: true },
            })

            if (board?.ownerId !== userId) {
                throw new AuthError(
                    'Forbidden - you do not own this board',
                    403,
                    AuthErrorCode.INVALID_CREDENTIALS
                )
            }

            return card
        } catch (error) {
            if (error instanceof AuthError) throw error
            throw new AuthError(
                'Failed to fetch card',
                500,
                AuthErrorCode.INTERNAL_ERROR
            )
        }
    }

    async createCard(listId: bigint, userId: bigint, credentials: unknown) {
        try {
            // Verify list exists and board is owned by user
            const list = await prisma.list.findUnique({
                where: { id: listId },
                select: { id: true, boardId: true },
            })

            if (!list) {
                throw new AuthError('List not found', 404, AuthErrorCode.USER_NOT_FOUND)
            }

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

            const validatedData = createCardSchema.parse(credentials)

            let position = validatedData.position
            if (position === undefined) {
                const lastCard = await prisma.card.findFirst({
                    where: { listId },
                    orderBy: { position: 'desc' },
                    select: { position: true },
                })
                position = (lastCard?.position ?? -1) + 1
            }

            const card = await this.repository.createCard(listId, userId, {
                title: validatedData.title,
                description: validatedData.description,
                position,
                assigneeUserId: validatedData.assigneeUserId,
            })

            return card
        } catch (error) {
            if (error instanceof AuthError) throw error
            throw new AuthError(
                'Failed to create card',
                500,
                AuthErrorCode.INTERNAL_ERROR
            )
        }
    }

    async updateCard(cardId: bigint, userId: bigint, credentials: unknown) {
        try {
            const card = await this.repository.getCardById(cardId)

            if (!card) {
                throw new AuthError('Card not found', 404, AuthErrorCode.USER_NOT_FOUND)
            }

            // Verify user owns the board
            const board = await prisma.board.findUnique({
                where: { id: card.list.boardId },
                select: { id: true, ownerId: true },
            })

            if (board?.ownerId !== userId) {
                throw new AuthError(
                    'Forbidden - you do not own this board',
                    403,
                    AuthErrorCode.INVALID_CREDENTIALS
                )
            }

            const validatedData = updateCardSchema.parse(credentials)

            const updateData: any = {}

            if (validatedData.title) {
                updateData.title = validatedData.title
            }

            if (validatedData.description !== undefined) {
                updateData.description = validatedData.description
            }

            if (validatedData.assigneeUserId !== undefined) {
                updateData.assigneeUserId = validatedData.assigneeUserId
            }

            const updated = await this.repository.updateCard(cardId, updateData)
            return updated
        } catch (error) {
            if (error instanceof AuthError) throw error
            throw new AuthError(
                'Failed to update card',
                500,
                AuthErrorCode.INTERNAL_ERROR
            )
        }
    }

    async moveCard(cardId: bigint, userId: bigint, credentials: unknown) {
        try {
            const card = await this.repository.getCardById(cardId)

            if (!card) {
                throw new AuthError('Card not found', 404, AuthErrorCode.USER_NOT_FOUND)
            }

            // Verify user owns the board
            const board = await prisma.board.findUnique({
                where: { id: card.list.boardId },
                select: { id: true, ownerId: true },
            })

            if (board?.ownerId !== userId) {
                throw new AuthError(
                    'Forbidden - you do not own this board',
                    403,
                    AuthErrorCode.INVALID_CREDENTIALS
                )
            }

            const validatedData = moveCardSchema.parse(credentials)

            // Verify target list exists in the same board
            const targetList = await prisma.list.findUnique({
                where: { id: validatedData.listId },
                select: { id: true, boardId: true },
            })

            if (targetList?.boardId !== board.id) {
                throw new AuthError(
                    'Target list does not belong to this board',
                    400,
                    AuthErrorCode.INVALID_CREDENTIALS
                )
            }

            const moved = await this.repository.moveCard(
                cardId,
                validatedData.listId,
                validatedData.position
            )

            return moved
        } catch (error) {
            if (error instanceof AuthError) throw error
            throw new AuthError(
                'Failed to move card',
                500,
                AuthErrorCode.INTERNAL_ERROR
            )
        }
    }

    async deleteCard(cardId: bigint, userId: bigint) {
        try {
            const card = await this.repository.getCardById(cardId)

            if (!card) {
                throw new AuthError('Card not found', 404, AuthErrorCode.USER_NOT_FOUND)
            }

            // Verify user owns the board
            const board = await prisma.board.findUnique({
                where: { id: card.list.boardId },
                select: { id: true, ownerId: true },
            })

            if (board?.ownerId !== userId) {
                throw new AuthError(
                    'Forbidden - you do not own this board',
                    403,
                    AuthErrorCode.INVALID_CREDENTIALS
                )
            }

            await this.repository.deleteCard(cardId)
        } catch (error) {
            if (error instanceof AuthError) throw error
            throw new AuthError(
                'Failed to delete card',
                500,
                AuthErrorCode.INTERNAL_ERROR
            )
        }
    }
}
