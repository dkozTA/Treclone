import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse, convertBigIntToString } from '@/lib/utils/api-utils'
import { BoardMemberService } from '@/lib/services/board-member.service'
import { handleAuthError } from '@/lib/utils/error-handler'

export class BoardMemberController {
    private readonly service = new BoardMemberService()

    async getMembers(request: NextRequest, boardId: bigint, userId: bigint) {
        try {
            const members = await this.service.getMembers(boardId, userId)

            return NextResponse.json(
                successResponse({
                    message: 'Board members fetched successfully',
                    members: convertBigIntToString(members),
                })
            )
        } catch (error) {
            const authError = handleAuthError(error)
            return NextResponse.json(
                errorResponse(authError.message, authError.statusCode),
                { status: authError.statusCode }
            )
        }
    }

    async addMember(request: NextRequest, boardId: bigint, userId: bigint) {
        try {
            const body = await request.json()
            const member = await this.service.addMember(boardId, userId, body)

            return NextResponse.json(
                successResponse(
                    {
                        message: 'Member added successfully',
                        member: convertBigIntToString(member),
                    },
                    201
                ),
                { status: 201 }
            )
        } catch (error) {
            const authError = handleAuthError(error)
            return NextResponse.json(
                errorResponse(authError.message, authError.statusCode),
                { status: authError.statusCode }
            )
        }
    }

    async removeMember(request: NextRequest, boardId: bigint, userId: bigint) {
        try {
            const body = await request.json()
            await this.service.removeMember(boardId, userId, body)

            return NextResponse.json(
                successResponse({
                    message: 'Member removed successfully',
                })
            )
        } catch (error) {
            const authError = handleAuthError(error)
            return NextResponse.json(
                errorResponse(authError.message, authError.statusCode),
                { status: authError.statusCode }
            )
        }
    }
}
