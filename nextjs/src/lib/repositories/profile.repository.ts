import prisma from '@/lib/db/prisma'

export class ProfileRepository {
    async getUserById(userId: bigint) {
        return prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                fullName: true,
                createdAt: true,
                updatedAt: true,
            },
        })
    }

    async updateUserProfile(
        userId: bigint,
        data: {
            fullName?: string
            passwordHash?: string
        }
    ) {
        const updateData: any = {}

        if (data.fullName) {
            updateData.fullName = data.fullName
        }

        if (data.passwordHash) {
            updateData.passwordHash = data.passwordHash
        }

        return prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                fullName: true,
                updatedAt: true,
            },
        })
    }
}