import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse, convertBigIntToString } from '@/lib/api-utils'
import { WorkspaceSettingsService } from '@/lib/services/workspace-settings.service'
import { handleAuthError } from '@/lib/utils/error-handler'

export class WorkspaceSettingsController {
    private readonly service = new WorkspaceSettingsService()

    async getSettings(request: NextRequest, workspaceId: bigint, userId: bigint) {
        try {
            const settings = await this.service.getSettings(workspaceId, userId)

            return NextResponse.json(
                successResponse({
                    message: 'Workspace settings retrieved successfully',
                    settings: convertBigIntToString(settings),
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

    async updateSettings(request: NextRequest, workspaceId: bigint, userId: bigint) {
        try {
            const body = await request.json()
            const updated = await this.service.updateSettings(workspaceId, userId, body)

            return NextResponse.json(
                successResponse({
                    message: 'Workspace settings updated successfully',
                    settings: convertBigIntToString(updated),
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

    async deleteWorkspace(request: NextRequest, workspaceId: bigint, userId: bigint) {
        try {
            await this.service.deleteWorkspace(workspaceId, userId)

            return NextResponse.json(
                successResponse({
                    message: 'Workspace deleted successfully',
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