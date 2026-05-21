import prisma from '@/lib/db/prisma'

export class BoardMemberRepository {
    async getBoardMembers(boardId: bigint) {
        return prisma.boardMember.findMany({
            where: { boardId },
            select: {
                id: true,
                userId: true,
                boardId: true,
                role: true,
                joinedAt: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                    },
                },
            },
            orderBy: { joinedAt: 'desc' },
        })
    }

    async getMemberById(memberId: bigint) {
        return prisma.boardMember.findUnique({
            where: { id: memberId },
            select: {
                id: true,
                userId: true,
                boardId: true,
                role: true,
                joinedAt: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                    },
                },
            },
        })
    }

    async getUserByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, fullName: true },
        })
    }

    async checkExistingMember(boardId: bigint, userId: bigint) {
        return prisma.boardMember.findFirst({
            where: { boardId, userId },
        })
    }

    async addMember(boardId: bigint, userId: bigint, role: string) {
        return prisma.boardMember.create({
            data: {
                boardId,
                userId,
                role,
            },
            select: {
                id: true,
                userId: true,
                boardId: true,
                role: true,
                joinedAt: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                    },
                },
            },
        })
    }

    async updateMemberRole(memberId: bigint, role: string) {
        return prisma.boardMember.update({
            where: { id: memberId },
            data: { role },
            select: {
                id: true,
                userId: true,
                boardId: true,
                role: true,
                joinedAt: true,
            },
        })
    }

    async removeMember(memberId: bigint) {
        return prisma.boardMember.delete({
            where: { id: memberId },
            select: { id: true },
        })
    }
}