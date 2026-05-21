import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse, convertBigIntToString } from '@/lib/utils/api-utils'
import { ListService } from '@/lib/services/list.service'
import { createAuditLog } from '@/lib/services/audit.service'
import { handleAuthError } from '@/lib/utils/error-handler'
import prisma from '@/lib/db/prisma'

export class ListController {
    private readonly service = new ListService()

    async getLists(request: NextRequest, boardId: bigint, userId: bigint) {
        try {
            const lists = await this.service.getListsByBoardId(boardId, userId)

            return NextResponse.json(
                successResponse({
                    message: 'Lists fetched successfully',
                    lists: convertBigIntToString(lists),
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

    async createList(request: NextRequest, boardId: bigint, userId: bigint) {
        try {
            const body = await request.json()
            const list = await this.service.createList(boardId, userId, body)

            // Get workspace ID from board
            const board = await prisma.board.findUnique({
                where: { id: boardId },
                select: { workspaceId: true },
            })

            // Log the action
            await createAuditLog({
                userId,
                action: 'CREATE',
                entity: 'LIST',
                entityId: BigInt(list.id),
                workspaceId: board?.workspaceId ? BigInt(board.workspaceId) : undefined,
                status: 'SUCCESS',
                metadata: {
                    title: list.title,
                    boardId: boardId.toString(),
                    position: list.position,
                },
            })

            return NextResponse.json(
                successResponse(
                    {
                        message: 'List created successfully',
                        list: convertBigIntToString(list),
                    }
                ),
                { status: 201 }
            )
        } catch (error) {
            // Log failure
            if (error instanceof Error) {
                const board = await prisma.board.findUnique({
                    where: { id: boardId },
                    select: { workspaceId: true },
                })

                await createAuditLog({
                    userId,
                    action: 'CREATE',
                    entity: 'LIST',
                    entityId: BigInt(0),
                    workspaceId: board?.workspaceId ? BigInt(board.workspaceId) : undefined,
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

    async getList(request: NextRequest, listId: bigint, userId: bigint) {
        try {
            const list = await this.service.getListById(listId, userId)

            return NextResponse.json(
                successResponse({
                    message: 'List fetched successfully',
                    list: convertBigIntToString(list),
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

    async updateList(request: NextRequest, listId: bigint, userId: bigint) {
        try {
            const body = await request.json()
            const beforeUpdate = await this.service.getListById(listId, userId)
            const list = await this.service.updateList(listId, userId, body)

            // Get workspace ID from board
            const board = await prisma.board.findUnique({
                where: { id: beforeUpdate.boardId },
                select: { workspaceId: true },
            })

            // Log the action
            await createAuditLog({
                userId,
                action: 'UPDATE',
                entity: 'LIST',
                entityId: listId,
                workspaceId: board?.workspaceId ? BigInt(board.workspaceId) : undefined,
                status: 'SUCCESS',
                changes: {
                    before: {
                        title: beforeUpdate.title,
                        position: beforeUpdate.position,
                    },
                    after: {
                        title: list.title,
                        position: list.position,
                    },
                },
                metadata: {
                    title: list.title,
                    boardId: list.boardId.toString(),
                    position: list.position,
                },
            })

            return NextResponse.json(
                successResponse({
                    message: 'List updated successfully',
                    list: convertBigIntToString(list),
                })
            )
        } catch (error) {
            // Log failure
            if (error instanceof Error) {
                await createAuditLog({
                    userId,
                    action: 'UPDATE',
                    entity: 'LIST',
                    entityId: listId,
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

    async deleteList(request: NextRequest, listId: bigint, userId: bigint) {
        try {
            // Get list info before deletion
            const list = await this.service.getListById(listId, userId)

            // Get workspace ID from board
            const board = await prisma.board.findUnique({
                where: { id: list.boardId },
                select: { workspaceId: true },
            })

            await this.service.deleteList(listId, userId)

            // Log the action
            await createAuditLog({
                userId,
                action: 'DELETE',
                entity: 'LIST',
                entityId: listId,
                workspaceId: board?.workspaceId ? BigInt(board.workspaceId) : undefined,
                status: 'SUCCESS',
                metadata: {
                    title: list.title,
                    boardId: list.boardId.toString(),
                    position: list.position,
                },
            })

            return NextResponse.json(
                successResponse({
                    message: 'List deleted successfully',
                })
            )
        } catch (error) {
            // Log failure
            if (error instanceof Error) {
                await createAuditLog({
                    userId,
                    action: 'DELETE',
                    entity: 'LIST',
                    entityId: listId,
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