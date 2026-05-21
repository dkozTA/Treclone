import prisma from '@/lib/db/prisma'

export class ListRepository {
    async getListsByBoardId(boardId: bigint) {
        return prisma.list.findMany({
            where: { boardId },
            select: {
                id: true,
                title: true,
                position: true,
                boardId: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: { cards: true },
                },
            },
            orderBy: { position: 'asc' },
        })
    }

    async getListById(listId: bigint) {
        return prisma.list.findUnique({
            where: { id: listId },
            select: {
                id: true,
                title: true,
                position: true,
                boardId: true,
                createdAt: true,
                updatedAt: true,
            },
        })
    }

    async createList(
        boardId: bigint,
        data: {
            title: string
            position: number
        }
    ) {
        return prisma.list.create({
            data: {
                boardId,
                title: data.title,
                position: data.position,
            },
            select: {
                id: true,
                title: true,
                position: true,
                boardId: true,
                createdAt: true,
                updatedAt: true,
            },
        })
    }

    async updateList(
        listId: bigint,
        data: {
            title?: string
            position?: number
        }
    ) {
        return prisma.list.update({
            where: { id: listId },
            data,
            select: {
                id: true,
                title: true,
                position: true,
                boardId: true,
                createdAt: true,
                updatedAt: true,
            },
        })
    }

    async deleteList(listId: bigint) {
        return prisma.list.delete({
            where: { id: listId },
            select: { id: true },
        })
    }
}