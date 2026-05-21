import prisma from '@/lib/db/prisma'

export class CardRepository {
    async getCardsByListId(listId: bigint) {
        return prisma.card.findMany({
            where: { listId },
            select: {
                id: true,
                title: true,
                description: true,
                position: true,
                listId: true,
                assigneeUserId: true,
                createdBy: true,
                createdAt: true,
                updatedAt: true,
                assignee: {
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                    },
                },
                creator: {
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                    },
                },
            },
            orderBy: { position: 'asc' },
        })
    }

    async getCardById(cardId: bigint) {
        return prisma.card.findUnique({
            where: { id: cardId },
            select: {
                id: true,
                title: true,
                description: true,
                position: true,
                listId: true,
                assigneeUserId: true,
                createdBy: true,
                createdAt: true,
                updatedAt: true,
                list: {
                    select: { id: true, boardId: true },
                },
                assignee: {
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                    },
                },
                creator: {
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                    },
                },
            },
        })
    }

    async createCard(
        listId: bigint,
        userId: bigint,
        data: {
            title: string
            description?: string
            position: number
            assigneeUserId?: bigint
        }
    ) {
        return prisma.card.create({
            data: {
                listId,
                title: data.title,
                description: data.description,
                position: data.position,
                createdBy: userId,
                assigneeUserId: data.assigneeUserId,
            },
            select: {
                id: true,
                title: true,
                description: true,
                position: true,
                listId: true,
                assigneeUserId: true,
                createdBy: true,
                createdAt: true,
                updatedAt: true,
            },
        })
    }

    async updateCard(
        cardId: bigint,
        data: {
            title?: string
            description?: string
            assigneeUserId?: bigint
        }
    ) {
        return prisma.card.update({
            where: { id: cardId },
            data,
            select: {
                id: true,
                title: true,
                description: true,
                position: true,
                listId: true,
                assigneeUserId: true,
                createdBy: true,
                createdAt: true,
                updatedAt: true,
            },
        })
    }

    async moveCard(
        cardId: bigint,
        listId: bigint,
        position: number
    ) {
        return prisma.$transaction(async (tx) => {
            const card = await tx.card.findUnique({
                where: { id: cardId },
                select: { id: true, listId: true },
            })

            if (!card) {
                throw new Error('Card not found')
            }

            const sourceListId = card.listId

            if (sourceListId === listId) {
                const cards = await tx.card.findMany({
                    where: { listId },
                    orderBy: { position: 'asc' },
                    select: { id: true },
                })
                const reorderedCards = cards.filter((item) => item.id !== cardId)
                const targetPosition = Math.min(position, reorderedCards.length)
                reorderedCards.splice(targetPosition, 0, { id: cardId })

                for (const [index, item] of reorderedCards.entries()) {
                    await tx.card.update({
                        where: { id: item.id },
                        data: { position: -1000000 - index },
                    })
                }

                for (const [index, item] of reorderedCards.entries()) {
                    await tx.card.update({
                        where: { id: item.id },
                        data: { position: index },
                    })
                }
            } else {
                const sourceCards = await tx.card.findMany({
                    where: {
                        listId: sourceListId,
                        id: { not: cardId },
                    },
                    orderBy: { position: 'asc' },
                    select: { id: true },
                })
                const targetCards = await tx.card.findMany({
                    where: { listId },
                    orderBy: { position: 'asc' },
                    select: { id: true },
                })
                const targetPosition = Math.min(position, targetCards.length)
                targetCards.splice(targetPosition, 0, { id: cardId })

                await tx.card.update({
                    where: { id: cardId },
                    data: {
                        listId,
                        position: -3000000,
                    },
                })

                for (const [index, item] of sourceCards.entries()) {
                    await tx.card.update({
                        where: { id: item.id },
                        data: { position: -1000000 - index },
                    })
                }

                for (const [index, item] of targetCards.entries()) {
                    await tx.card.update({
                        where: { id: item.id },
                        data: { position: -2000000 - index },
                    })
                }

                for (const [index, item] of sourceCards.entries()) {
                    await tx.card.update({
                        where: { id: item.id },
                        data: { position: index },
                    })
                }

                for (const [index, item] of targetCards.entries()) {
                    await tx.card.update({
                        where: { id: item.id },
                        data: { position: index },
                    })
                }
            }

            return tx.card.findUnique({
                where: { id: cardId },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    position: true,
                    listId: true,
                    assigneeUserId: true,
                    createdBy: true,
                    createdAt: true,
                    updatedAt: true,
                },
            })
        })
    }

    async deleteCard(cardId: bigint) {
        return prisma.card.delete({
            where: { id: cardId },
            select: { id: true },
        })
    }
}
