import prisma from '@/lib/db/prisma'

export class WorkspaceMemberRepository {
    async getWorkspaceMembers(workspaceId: bigint) {
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
            select: {
                owner: {
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                    },
                },
                createdAt: true,
                updatedAt: true,
            },
        })

        const members = await prisma.workspaceMember.findMany({
            where: { workspaceId },
            select: {
                id: true,
                userId: true,
                workspaceId: true,
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

        if (!workspace) return members

        const nonOwnerMembers = members.filter(
            (member) => member.userId !== workspace.owner.id
        )

        return [
            {
                id: `owner-${workspace.owner.id.toString()}`,
                userId: workspace.owner.id,
                workspaceId,
                role: 'owner',
                joinedAt: workspace.createdAt,
                user: workspace.owner,
            },
            ...nonOwnerMembers,
        ]
    }

    async getMemberById(memberId: bigint) {
        return prisma.workspaceMember.findUnique({
            where: { id: memberId },
            select: {
                id: true,
                userId: true,
                workspaceId: true,
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

    async checkExistingMember(workspaceId: bigint, userId: bigint) {
        return prisma.workspaceMember.findFirst({
            where: { workspaceId, userId },
        })
    }

    async addMember(workspaceId: bigint, userId: bigint, role: string) {
        return prisma.workspaceMember.create({
            data: {
                workspaceId,
                userId,
                role,
            },
            select: {
                id: true,
                userId: true,
                workspaceId: true,
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
        return prisma.workspaceMember.update({
            where: { id: memberId },
            data: { role },
            select: {
                id: true,
                userId: true,
                workspaceId: true,
                role: true,
                joinedAt: true,
            },
        })
    }

    async removeMember(memberId: bigint) {
        return prisma.workspaceMember.delete({
            where: { id: memberId },
            select: { id: true },
        })
    }
}
