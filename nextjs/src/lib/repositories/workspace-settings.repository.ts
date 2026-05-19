import prisma from '@/lib/prisma'

export class WorkspaceSettingsRepository {
    async getWorkspace(workspaceId: bigint) {
        return prisma.workspace.findUnique({
            where: { id: workspaceId },
            select: {
                id: true,
                ownerId: true,
                visibility: true,
                dailySummary: true,
                mentionAlerts: true,
            },
        })
    }

    async updateSettings(workspaceId: bigint, data: any) {
        return prisma.workspace.update({
            where: { id: workspaceId },
            data,
            select: {
                id: true,
                visibility: true,
                dailySummary: true,
                mentionAlerts: true,
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