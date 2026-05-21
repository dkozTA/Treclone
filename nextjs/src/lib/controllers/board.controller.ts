import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse, convertBigIntToString } from '@/lib/utils/api-utils'
import { BoardService } from '@/lib/services/board.service'
import { createAuditLog } from '@/lib/services/audit.service'
import { handleAuthError } from '@/lib/utils/error-handler'

export class BoardController {
    private readonly service = new BoardService()

    async getBoards(
        request: NextRequest,
        workspaceId: bigint,
        userId: bigint
    ) {
        try {
            const boards = await this.service.getBoardsByWorkspaceId(workspaceId, userId)

            return NextResponse.json(
                successResponse({
                    message: 'Boards fetched successfully',
                    boards: convertBigIntToString(boards),
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

    async createBoard(
        request: NextRequest,
        workspaceId: bigint,
        userId: bigint
    ) {
        try {
            const body = await request.json()
            const board = await this.service.createBoard(workspaceId, userId, body)

            // Log the action
            await createAuditLog({
                userId,
                action: 'CREATE',
                entity: 'BOARD',
                entityId: BigInt(board.id),
                workspaceId: BigInt(board.workspaceId || workspaceId),
                status: 'SUCCESS',
                metadata: {
                    title: board.title,
                    description: board.description,
                },
            })

            return NextResponse.json(
                successResponse(
                    {
                        message: 'Board created successfully',
                        board: convertBigIntToString(board),
                    }
                ),
                { status: 201 }
            )
        } catch (error) {
            // Log failure
            if (error instanceof Error) {
                await createAuditLog({
                    userId,
                    action: 'CREATE',
                    entity: 'BOARD',
                    entityId: BigInt(0),
                    workspaceId,
                    status: 'FAILURE',
                    errorMessage: error.message,
                })
            }

            const authError = handleAuthError(error)
            return NextResponse.json(
                errorResponse(authError.message, authError.statusCode),
                { status: authError.statusCode }
            )
        }
    }

    async getBoard(request: NextRequest, boardId: bigint, userId: bigint) {
        try {
            const board = await this.service.getBoardById(boardId, userId)

            return NextResponse.json(
                successResponse({
                    message: 'Board fetched successfully',
                    board: convertBigIntToString(board),
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

    async updateBoard(request: NextRequest, boardId: bigint, userId: bigint) {
        try {
            const body = await request.json()
            const beforeUpdate = await this.service.getBoardById(boardId, userId)
            const board = await this.service.updateBoard(boardId, userId, body)

            // Log the action
            await createAuditLog({
                userId,
                action: 'UPDATE',
                entity: 'BOARD',
                entityId: boardId,
                workspaceId: BigInt(board.workspaceId || 0),
                status: 'SUCCESS',
                changes: {
                    before: {
                        title: beforeUpdate.title,
                        description: beforeUpdate.description,
                    },
                    after: {
                        title: board.title,
                        description: board.description,
                    },
                },
                metadata: {
                    title: board.title,
                    description: board.description,
                },
            })

            return NextResponse.json(
                successResponse({
                    message: 'Board updated successfully',
                    board: convertBigIntToString(board),
                })
            )
        } catch (error) {
            // Log failure
            if (error instanceof Error) {
                await createAuditLog({
                    userId,
                    action: 'UPDATE',
                    entity: 'BOARD',
                    entityId: boardId,
                    status: 'FAILURE',
                    errorMessage: error.message,
                })
            }

            const authError = handleAuthError(error)
            return NextResponse.json(
                errorResponse(authError.message, authError.statusCode),
                { status: authError.statusCode }
            )
        }
    }

    async deleteBoard(request: NextRequest, boardId: bigint, userId: bigint) {
        try {
            // Get board info before deletion
            const board = await this.service.getBoardById(boardId, userId)

            await this.service.deleteBoard(boardId, userId)

            // Log the action
            await createAuditLog({
                userId,
                action: 'DELETE',
                entity: 'BOARD',
                entityId: boardId,
                workspaceId: BigInt(board.workspaceId || 0),
                status: 'SUCCESS',
                metadata: {
                    title: board.title,
                    description: board.description,
                },
            })

            return NextResponse.json(
                successResponse({
                    message: 'Board deleted successfully',
                })
            )
        } catch (error) {
            // Log failure
            if (error instanceof Error) {
                await createAuditLog({
                    userId,
                    action: 'DELETE',
                    entity: 'BOARD',
                    entityId: boardId,
                    status: 'FAILURE',
                    errorMessage: error.message,
                })
            }

            const authError = handleAuthError(error)
            return NextResponse.json(
                errorResponse(authError.message, authError.statusCode),
                { status: authError.statusCode }
            )
        }
    }
}