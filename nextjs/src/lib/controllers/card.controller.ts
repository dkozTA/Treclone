import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse, convertBigIntToString } from '@/lib/utils/api-utils'
import { CardService } from '@/lib/services/card.service'
import { createAuditLog } from '@/lib/services/audit.service'
import { handleAuthError } from '@/lib/utils/error-handler'
import prisma from '@/lib/db/prisma'

export class CardController {
    private readonly service = new CardService()

    async getCards(request: NextRequest, listId: bigint, userId: bigint) {
        try {
            const cards = await this.service.getCardsByListId(listId, userId)

            return NextResponse.json(
                successResponse({
                    message: 'Cards fetched successfully',
                    cards: convertBigIntToString(cards),
                })
            )
        } catch (error) {
            const authError = handleAuthError(error)
            return NextResponse.json(
                errorResponse(authError.message, authError.statusCode),
                { status: authError.statusCode }
            )
        }
    }

    async createCard(request: NextRequest, listId: bigint, userId: bigint) {
        try {
            const body = await request.json()
            const card = await this.service.createCard(listId, userId, body)

            // Get workspace ID through list -> board relationship
            const list = await prisma.list.findUnique({
                where: { id: listId },
                select: { board: { select: { workspaceId: true } } },
            })

            // Log the action
            await createAuditLog({
                userId,
                action: 'CREATE',
                entity: 'CARD',
                entityId: BigInt(card.id),
                workspaceId: list?.board?.workspaceId ? BigInt(list.board.workspaceId) : undefined,
                status: 'SUCCESS',
                metadata: {
                    title: card.title,
                    description: card.description,
                    listId: listId.toString(),
                    position: card.position,
                },
            })

            return NextResponse.json(
                successResponse(
                    {
                        message: 'Card created successfully',
                        card: convertBigIntToString(card),
                    },
                    201
                ),
                { status: 201 }
            )
        } catch (error) {
            // Log failure
            if (error instanceof Error) {
                const list = await prisma.list.findUnique({
                    where: { id: listId },
                    select: { board: { select: { workspaceId: true } } },
                })

                await createAuditLog({
                    userId,
                    action: 'CREATE',
                    entity: 'CARD',
                    entityId: BigInt(0),
                    workspaceId: list?.board?.workspaceId ? BigInt(list.board.workspaceId) : undefined,
                    status: 'FAILURE',
                    errorMessage: error.message,
                })
            }

            const authError = handleAuthError(error)
            return NextResponse.json(
                errorResponse(authError.message, authError.statusCode),
                { status: authError.statusCode }
            )
        }
    }

    async getCard(request: NextRequest, cardId: bigint, userId: bigint) {
        try {
            const card = await this.service.getCardById(cardId, userId)

            return NextResponse.json(
                successResponse({
                    message: 'Card fetched successfully',
                    card: convertBigIntToString(card),
                })
            )
        } catch (error) {
            const authError = handleAuthError(error)
            return NextResponse.json(
                errorResponse(authError.message, authError.statusCode),
                { status: authError.statusCode }
            )
        }
    }

    async updateCard(request: NextRequest, cardId: bigint, userId: bigint) {
        try {
            const body = await request.json()
            const beforeUpdate = await this.service.getCardById(cardId, userId)
            const card = await this.service.updateCard(cardId, userId, body)

            // Get workspace ID through card -> list -> board relationship
            const list = await prisma.list.findUnique({
                where: { id: card.listId },
                select: { board: { select: { workspaceId: true } } },
            })

            // Log the action
            await createAuditLog({
                userId,
                action: 'UPDATE',
                entity: 'CARD',
                entityId: cardId,
                workspaceId: list?.board?.workspaceId ? BigInt(list.board.workspaceId) : undefined,
                status: 'SUCCESS',
                changes: {
                    before: {
                        title: beforeUpdate.title,
                        description: beforeUpdate.description,
                        assigneeUserId: beforeUpdate.assigneeUserId?.toString() || null,
                    },
                    after: {
                        title: card.title,
                        description: card.description,
                        assigneeUserId: card.assigneeUserId?.toString() || null,
                    },
                },
                metadata: {
                    title: card.title,
                    description: card.description,
                    listId: card.listId.toString(),
                    position: card.position,
                    assigneeUserId: card.assigneeUserId?.toString() || null,
                },
            })

            return NextResponse.json(
                successResponse({
                    message: 'Card updated successfully',
                    card: convertBigIntToString(card),
                })
            )
        } catch (error) {
            // Log failure
            if (error instanceof Error) {
                await createAuditLog({
                    userId,
                    action: 'UPDATE',
                    entity: 'CARD',
                    entityId: cardId,
                    status: 'FAILURE',
                    errorMessage: error.message,
                })
            }

            const authError = handleAuthError(error)
            return NextResponse.json(
                errorResponse(authError.message, authError.statusCode),
                { status: authError.statusCode }
            )
        }
    }

    async moveCard(request: NextRequest, cardId: bigint, userId: bigint) {
        try {
            const body = await request.json()
            const beforeMove = await this.service.getCardById(cardId, userId)
            const card = await this.service.moveCard(cardId, userId, body)

            if (!card) {
                return NextResponse.json(
                    errorResponse('Card not found', 404),
                    { status: 404 }
                )
            }
            // Get workspace ID through card -> list -> board relationship
            const list = await prisma.list.findUnique({
                where: { id: card.listId },
                select: { board: { select: { workspaceId: true } } },
            })

            // Log the action
            await createAuditLog({
                userId,
                action: 'UPDATE',
                entity: 'CARD',
                entityId: cardId,
                workspaceId: list?.board?.workspaceId ? BigInt(list.board.workspaceId) : undefined,
                status: 'SUCCESS',
                changes: {
                    before: {
                        listId: beforeMove.listId.toString(),
                        position: beforeMove.position,
                    },
                    after: {
                        listId: card.listId.toString(),
                        position: card.position,
                    },
                },
                metadata: {
                    title: card.title,
                    listId: card.listId.toString(),
                    position: card.position,
                    action: 'moved',
                },
            })

            return NextResponse.json(
                successResponse({
                    message: 'Card moved successfully',
                    card: convertBigIntToString(card),
                })
            )
        } catch (error) {
            // Log failure
            if (error instanceof Error) {
                await createAuditLog({
                    userId,
                    action: 'UPDATE',
                    entity: 'CARD',
                    entityId: cardId,
                    status: 'FAILURE',
                    errorMessage: error.message,
                })
            }

            const authError = handleAuthError(error)
            return NextResponse.json(
                errorResponse(authError.message, authError.statusCode),
                { status: authError.statusCode }
            )
        }
    }

    async deleteCard(request: NextRequest, cardId: bigint, userId: bigint) {
        try {
            // Get card info before deletion
            const card = await this.service.getCardById(cardId, userId)

            // Get workspace ID through card -> list -> board relationship
            const list = await prisma.list.findUnique({
                where: { id: card.listId },
                select: { board: { select: { workspaceId: true } } },
            })

            await this.service.deleteCard(cardId, userId)

            // Log the action
            await createAuditLog({
                userId,
                action: 'DELETE',
                entity: 'CARD',
                entityId: cardId,
                workspaceId: list?.board?.workspaceId ? BigInt(list.board.workspaceId) : undefined,
                status: 'SUCCESS',
                metadata: {
                    title: card.title,
                    description: card.description,
                    listId: card.listId.toString(),
                    position: card.position,
                },
            })

            return NextResponse.json(
                successResponse({
                    message: 'Card deleted successfully',
                })
            )
        } catch (error) {
            // Log failure
            if (error instanceof Error) {
                await createAuditLog({
                    userId,
                    action: 'DELETE',
                    entity: 'CARD',
                    entityId: cardId,
                    status: 'FAILURE',
                    errorMessage: error.message,
                })
            }

            const authError = handleAuthError(error)
            return NextResponse.json(
                errorResponse(authError.message, authError.statusCode),
                { status: authError.statusCode }
            )
        }
    }
}
