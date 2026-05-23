import { BoardMemberRepository } from '@/lib/repositories/board-member.repository'
import { addMemberSchema, removeMemberSchema } from '@/lib/validation/membership'
import { AuthError, AuthErrorCode } from '@/lib/utils/error-handler'
import prisma from '@/lib/db/prisma'

export class BoardMemberService {
    private readonly repository = new BoardMemberRepository()

    async getMembers(boardId: bigint, userId: bigint) {
        try {
            // Verify board exists and user owns it
            const board = await prisma.board.findUnique({
                where: { id: boardId },
                select: { id: true, ownerId: true },
            })

            if (!board) {
                throw new AuthError('Board not found', 404, AuthErrorCode.USER_NOT_FOUND)
            }

            if (board.ownerId !== userId) {
                throw new AuthError(
                    'Forbidden - you do not own this board',
                    403,
                    AuthErrorCode.INVALID_CREDENTIALS
                )
            }

            const members = await this.repository.getBoardMembers(boardId)
            return members
        } catch (error) {
            if (error instanceof AuthError) throw error
            throw new AuthError(
                'Failed to fetch members',
                500,
                AuthErrorCode.INTERNAL_ERROR
            )
        }
    }

    async addMember(boardId: bigint, userId: bigint, credentials: unknown) {
        try {
            // Verify board exists and user owns it
            const board = await prisma.board.findUnique({
                where: { id: boardId },
                select: { id: true, ownerId: true },
            })

            if (!board) {
                throw new AuthError('Board not found', 404, AuthErrorCode.USER_NOT_FOUND)
            }

            if (board.ownerId !== userId) {
                throw new AuthError(
                    'Forbidden - you do not own this board',
                    403,
                    AuthErrorCode.INVALID_CREDENTIALS
                )
            }

            const validatedData = addMemberSchema.parse(credentials)

            // Check if user with email exists
            const targetUser = await this.repository.getUserByEmail(validatedData.email)

            if (!targetUser) {
                throw new AuthError(
                    'User with this email not found',
                    404,
                    AuthErrorCode.USER_NOT_FOUND
                )
            }

            // Check if user is already a member
            const existingMember = await this.repository.checkExistingMember(
                boardId,
                targetUser.id
            )

            if (existingMember) {
                throw new AuthError(
                    'User is already a member of this board',
                    409,
                    AuthErrorCode.INVALID_CREDENTIALS
                )
            }

            const member = await this.repository.addMember(
                boardId,
                targetUser.id,
                validatedData.role
            )

            return member
        } catch (error) {
            if (error instanceof AuthError) throw error
            throw new AuthError(
                'Failed to add member',
                500,
                AuthErrorCode.INTERNAL_ERROR
            )
        }
    }

    async removeMember(boardId: bigint, userId: bigint, credentials: unknown) {
        try {
            // Verify board exists and user owns it
            const board = await prisma.board.findUnique({
                where: { id: boardId },
                select: { id: true, ownerId: true },
            })

            if (!board) {
                throw new AuthError('Board not found', 404, AuthErrorCode.USER_NOT_FOUND)
            }

            if (board.ownerId !== userId) {
                throw new AuthError(
                    'Forbidden - you do not own this board',
                    403,
                    AuthErrorCode.INVALID_CREDENTIALS
                )
            }

            const validatedData = removeMemberSchema.parse(credentials)

            // Verify member exists and belongs to board
            const member = await this.repository.getMemberById(validatedData.memberId)

            if (member?.boardId !== boardId) {
                throw new AuthError(
                    'Member not found in this board',
                    404,
                    AuthErrorCode.USER_NOT_FOUND
                )
            }

            await this.repository.removeMember(validatedData.memberId)
        } catch (error) {
            if (error instanceof AuthError) throw error
            throw new AuthError(
                'Failed to remove member',
                500,
                AuthErrorCode.INTERNAL_ERROR
            )
        }
    }
}