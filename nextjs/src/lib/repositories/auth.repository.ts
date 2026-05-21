import prisma from '@/lib/db/prisma'

export class AuthRepository {
    async findUserByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email },
        })
    }

    async createUser(email: string, passwordHash: string, fullName: string) {
        return prisma.user.create({
            data: { email, passwordHash, fullName },
        })
    }

    async createRefreshToken(userId: bigint, token: string, expiresAt: Date) {
        return prisma.refreshToken.create({
            data: { userId, token, expiresAt },
        })
    }

    async findRefreshToken(token: string) {
        return prisma.refreshToken.findFirst({
            where: {
                token,
                revokedAt: null,
                expiresAt: { gt: new Date() },
            },
        })
    }

    async revokeRefreshToken(token: string) {
        return prisma.refreshToken.updateMany({
            where: { token },
            data: { revokedAt: new Date() },
        })
    }

    async getUserById(userId: bigint) {
        return prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                fullName: true,
                createdAt: true,
                ownedWorkspaces: {
                    select: { id: true, name: true },
                },
            },
        })
    }

    async updatePasswordResetToken(email: string, hashedToken: string, expiresAt: Date) {
        return prisma.user.update({
            where: { email },
            data: {
                passwordResetToken: hashedToken,
                passwordResetExpires: expiresAt,
            },
        })
    }

    async findUserByResetToken(hashedToken: string) {
        return prisma.user.findFirst({
            where: {
                passwordResetToken: hashedToken,
                passwordResetExpires: {
                    gt: new Date(),
                },
            },
        })
    }

    async resetPassword(userId: bigint, hashedPassword: string) {
        return prisma.user.update({
            where: { id: userId },
            data: {
                passwordHash: hashedPassword,
                passwordResetToken: null,
                passwordResetExpires: null,
            },
        })
    }
}