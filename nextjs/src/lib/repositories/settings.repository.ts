import prisma from '@/lib/prisma'

export class SettingsRepository {
    // User preferences
    async getUserPreferences(userId: bigint) {
        return prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                fullName: true,
                // Add darkMode when schema is updated
            },
        })
    }

    async updateUserPreferences(
        userId: bigint,
        data: {
            darkMode?: boolean
        }
    ) {
        return prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                email: true,
                fullName: true,
            },
        })
    }

    // Password
    async getUserPasswordHash(userId: bigint) {
        return prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, passwordHash: true },
        })
    }

    async updatePassword(userId: bigint, hashedPassword: string) {
        return prisma.user.update({
            where: { id: userId },
            data: { passwordHash: hashedPassword },
            select: {
                id: true,
                email: true,
                fullName: true,
                updatedAt: true,
            },
        })
    }

    // Account deletion
    async deleteUser(userId: bigint) {
        // This will cascade delete related records due to Prisma schema
        return prisma.user.delete({
            where: { id: userId },
            select: { id: true, email: true },
        })
    }
}