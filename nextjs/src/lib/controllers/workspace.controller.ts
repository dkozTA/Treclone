import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse, convertBigIntToString } from '@/lib/utils/api-utils'
import { WorkspaceService } from '@/lib/services/workspace.service'
import { createAuditLog } from '@/lib/services/audit.service'
import { handleAuthError } from '@/lib/utils/error-handler'

export class WorkspaceController {
    private readonly service = new WorkspaceService()

    async getWorkspaces(request: NextRequest, userId: bigint) {
        try {
            const workspaces = await this.service.getWorkspacesByUserId(userId)

            return NextResponse.json(
                successResponse({
                    message: 'Workspaces fetched successfully',
                    workspaces: convertBigIntToString(workspaces),
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

    async createWorkspace(request: NextRequest, userId: bigint) {
        try {
            const body = await request.json()
            const workspace = await this.service.createWorkspace(userId, body)

            // Log the action
            await createAuditLog({
                userId,
                action: 'CREATE',
                entity: 'WORKSPACE',
                entityId: BigInt(workspace.id),
                workspaceId: BigInt(workspace.id),
                status: 'SUCCESS',
                metadata: {
                    name: workspace.name,
                    description: workspace.description,
                },
            })

            return NextResponse.json(
                successResponse(
                    {
                        message: 'Workspace created successfully',
                        workspace: convertBigIntToString(workspace),
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
                    entity: 'WORKSPACE',
                    entityId: BigInt(0),
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

    async getWorkspace(request: NextRequest, workspaceId: bigint, userId: bigint) {
        try {
            const workspace = await this.service.getWorkspaceById(workspaceId, userId)

            return NextResponse.json(
                successResponse({
                    message: 'Workspace fetched successfully',
                    workspace: convertBigIntToString(workspace),
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

    async updateWorkspace(
        request: NextRequest,
        workspaceId: bigint,
        userId: bigint
    ) {
        try {
            const body = await request.json()
            const beforeUpdate = await this.service.getWorkspaceById(workspaceId, userId)
            const workspace = await this.service.updateWorkspace(workspaceId, userId, body)

            // Log the action
            await createAuditLog({
                userId,
                action: 'UPDATE',
                entity: 'WORKSPACE',
                entityId: workspaceId,
                workspaceId,
                status: 'SUCCESS',
                changes: {
                    before: {
                        name: beforeUpdate.name,
                        description: beforeUpdate.description,
                    },
                    after: {
                        name: workspace.name,
                        description: workspace.description,
                    },
                },
                metadata: {
                    name: workspace.name,
                    description: workspace.description,
                },
            })

            return NextResponse.json(
                successResponse({
                    message: 'Workspace updated successfully',
                    workspace: convertBigIntToString(workspace),
                })
            )
        } catch (error) {
            // Log failure
            if (error instanceof Error) {
                await createAuditLog({
                    userId,
                    action: 'UPDATE',
                    entity: 'WORKSPACE',
                    entityId: workspaceId,
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

    async deleteWorkspace(
        request: NextRequest,
        workspaceId: bigint,
        userId: bigint
    ) {
        try {
            // Get workspace info before deletion
            const workspace = await this.service.getWorkspaceById(workspaceId, userId)

            await this.service.deleteWorkspace(workspaceId, userId)

            // Log the action
            await createAuditLog({
                userId,
                action: 'DELETE',
                entity: 'WORKSPACE',
                entityId: workspaceId,
                workspaceId,
                status: 'SUCCESS',
                metadata: {
                    name: workspace.name,
                    description: workspace.description,
                },
            })

            return NextResponse.json(
                successResponse({
                    message: 'Workspace deleted successfully',
                })
            )
        } catch (error) {
            // Log failure
            if (error instanceof Error) {
                await createAuditLog({
                    userId,
                    action: 'DELETE',
                    entity: 'WORKSPACE',
                    entityId: workspaceId,
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
}