import prisma from '@/lib/db/prisma';

export class SettingsRepository {
  // User preferences
  async getUserPreferences(userId: bigint) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        emailVerifiedAt: true,
        emailNotifications: true,
        darkMode: true,
      },
    });
  }

  async updateUserPreferences(
    userId: bigint,
    data: {
      emailNotifications?: boolean;
      darkMode?: boolean;
    }
  ) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        emailVerifiedAt: true,
        emailNotifications: true,
        darkMode: true,
      },
    });
  }

  // Password
  async getUserPasswordHash(userId: bigint) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true, emailVerifiedAt: true },
    });
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
    });
  }

  // Account deletion
  async deleteUser(userId: bigint) {
    return prisma.$transaction(async (tx) => {
      await tx.card.deleteMany({
        where: { createdBy: userId },
      });

      return tx.user.delete({
        where: { id: userId },
        select: { id: true, email: true },
      });
    });
  }
}
