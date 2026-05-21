import { WorkspaceMemberRepository } from '@/lib/repositories/workspace-member.repository'
import { addMemberSchema, removeMemberSchema } from '@/lib/validation/members'
import { AuthError, AuthErrorCode } from '@/lib/utils/error-handler'
import prisma from '@/lib/db/prisma'

export class WorkspaceMemberService {
    private readonly repository = new WorkspaceMemberRepository()

    async getMembers(workspaceId: bigint, userId: bigint) {
        try {
            // Verify workspace exists and user is owner
            const workspace = await prisma.workspace.findUnique({
                where: { id: workspaceId },
                select: { id: true, ownerId: true },
            })

            if (!workspace) {
                throw new AuthError(
                    'Workspace not found',
                    404,
                    AuthErrorCode.USER_NOT_FOUND
                )
            }

            if (workspace.ownerId !== userId) {
                throw new AuthError(
                    'Forbidden - not the workspace owner',
                    403,
                    AuthErrorCode.INVALID_CREDENTIALS
                )
            }

            const members = await this.repository.getWorkspaceMembers(workspaceId)
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

    async addMember(workspaceId: bigint, userId: bigint, credentials: unknown) {
        try {
            // Verify workspace exists and user is owner
            const workspace = await prisma.workspace.findUnique({
                where: { id: workspaceId },
                select: { id: true, ownerId: true },
            })

            if (!workspace) {
                throw new AuthError(
                    'Workspace not found',
                    404,
                    AuthErrorCode.USER_NOT_FOUND
                )
            }

            if (workspace.ownerId !== userId) {
                throw new AuthError(
                    'Forbidden - not the workspace owner',
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
                workspaceId,
                targetUser.id
            )

            if (existingMember) {
                throw new AuthError(
                    'User is already a member of this workspace',
                    409,
                    AuthErrorCode.INVALID_CREDENTIALS
                )
            }

            const member = await this.repository.addMember(
                workspaceId,
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

    async removeMember(workspaceId: bigint, userId: bigint, credentials: unknown) {
        try {
            // Verify workspace exists and user is owner
            const workspace = await prisma.workspace.findUnique({
                where: { id: workspaceId },
                select: { id: true, ownerId: true },
            })

            if (!workspace) {
                throw new AuthError(
                    'Workspace not found',
                    404,
                    AuthErrorCode.USER_NOT_FOUND
                )
            }

            if (workspace.ownerId !== userId) {
                throw new AuthError(
                    'Forbidden - not the workspace owner',
                    403,
                    AuthErrorCode.INVALID_CREDENTIALS
                )
            }

            const validatedData = removeMemberSchema.parse(credentials)

            // Verify member exists and belongs to workspace
            const member = await this.repository.getMemberById(validatedData.memberId)

            if (member?.workspaceId !== workspaceId) {
                throw new AuthError(
                    'Member not found in this workspace',
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