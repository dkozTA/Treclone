import prisma from '@/lib/db/prisma'

export class WorkspaceRepository {
    async getWorkspacesByUserId(userId: bigint) {
        return prisma.workspace.findMany({
            where: {
                OR: [
                    { ownerId: userId },
                    {
                        members: {
                            some: { userId },
                        },
                    },
                ],
            },
            select: {
                id: true,
                name: true,
                description: true,
                ownerId: true,
                visibility: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: { boards: true, members: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        })
    }

    async getWorkspaceById(workspaceId: bigint) {
        return prisma.workspace.findUnique({
            where: { id: workspaceId },
            select: {
                id: true,
                name: true,
                description: true,
                ownerId: true,
                visibility: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: { boards: true, members: true },
                },
            },
        })
    }

    async createWorkspace(
        userId: bigint,
        data: {
            name: string
            description?: string
        }
    ) {
        return prisma.workspace.create({
            data: {
                name: data.name,
                description: data.description,
                ownerId: userId,
            },
            select: {
                id: true,
                name: true,
                description: true,
                ownerId: true,
                visibility: true,
                createdAt: true,
                updatedAt: true,
            },
        })
    }

    async updateWorkspace(
        workspaceId: bigint,
        data: {
            name?: string
            description?: string
        }
    ) {
        return prisma.workspace.update({
            where: { id: workspaceId },
            data,
            select: {
                id: true,
                name: true,
                description: true,
                ownerId: true,
                visibility: true,
                createdAt: true,
                updatedAt: true,
            },
        })
    }

    async deleteWorkspace(workspaceId: bigint) {
        return prisma.workspace.delete({
            where: { id: workspaceId },
            select: { id: true },
        })
    }
}
