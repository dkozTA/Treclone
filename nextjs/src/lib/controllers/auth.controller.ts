import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse } from '@/lib/utils/api-utils'
import { AuthService } from '@/lib/services/auth.service'
import { handleAuthError } from '@/lib/utils/error-handler'

export class AuthController {
    private readonly service = new AuthService()

    async register(request: NextRequest) {
        try {
            const body = await request.json()
            const user = await this.service.register(body)
            const { accessToken, refreshToken } = this.service.generateTokens(user.id)

            await this.service.storeRefreshToken(user.id, refreshToken)

            const response = NextResponse.json(
                successResponse({
                    message: 'User registered successfully',
                    user: {
                        id: user.id.toString(),
                        email: user.email,
                        fullName: user.fullName,
                    },
                }),
                { status: 201 }
            )

            response.cookies.set({
                name: 'accessToken',
                value: accessToken,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60,
            })

            response.cookies.set({
                name: 'refreshToken',
                value: refreshToken,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60,
            })

            return response
        } catch (error) {
            const authError = handleAuthError(error)
            return NextResponse.json(
                errorResponse(authError.message, authError.statusCode),
                { status: authError.statusCode }
            )
        }
    }

    async login(request: NextRequest) {
        try {
            const body = await request.json()
            const user = await this.service.login(body)
            const { accessToken, refreshToken } = this.service.generateTokens(user.id)

            await this.service.storeRefreshToken(user.id, refreshToken)

            const response = NextResponse.json(
                successResponse({
                    message: 'Login successful',
                    user: {
                        id: user.id.toString(),
                        email: user.email,
                        fullName: user.fullName,
                    },
                })
            )

            response.cookies.set({
                name: 'accessToken',
                value: accessToken,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60,
            })

            response.cookies.set({
                name: 'refreshToken',
                value: refreshToken,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60,
            })

            return response
        } catch (error) {
            const authError = handleAuthError(error)
            return NextResponse.json(
                errorResponse(authError.message, authError.statusCode),
                { status: authError.statusCode }
            )
        }
    }

    async refresh(request: NextRequest) {
        try {
            const refreshToken = request.cookies.get('refreshToken')?.value

            if (!refreshToken) {
                return NextResponse.json(
                    errorResponse('No refresh token provided', 401),
                    { status: 401 }
                )
            }

            const newAccessToken = await this.service.refreshAccessToken(refreshToken)

            const response = NextResponse.json(
                successResponse({
                    message: 'Access token refreshed',
                    accessToken: newAccessToken,
                })
            )

            response.cookies.set({
                name: 'accessToken',
                value: newAccessToken,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60,
            })

            return response
        } catch (error) {
            const authError = handleAuthError(error)
            return NextResponse.json(
                errorResponse(authError.message, authError.statusCode),
                { status: authError.statusCode }
            )
        }
    }

    async logout(request: NextRequest) {
        try {
            const refreshToken = request.cookies.get('refreshToken')?.value

            if (refreshToken) {
                await this.service.logout(refreshToken)
            }
        } catch (error) {
            // Log logout error but don't fail - always clear cookies
            console.error('[Auth Logout] Error revoking token:', error)
        }

        // Always return success and clear cookies, regardless of error
        const response = NextResponse.json(
            successResponse({
                message: 'Logged out successfully',
            })
        )

        response.cookies.set({ name: 'accessToken', value: '', httpOnly: true, maxAge: 0 })
        response.cookies.set({ name: 'refreshToken', value: '', httpOnly: true, maxAge: 0 })

        return response
    }

    async getMe(request: NextRequest, userId: bigint) {
        try {
            const user = await this.service.getUser(userId)

            const response = NextResponse.json(
                successResponse({
                    message: 'User data retrieved successfully',
                    user: {
                        ...user,
                        id: user.id.toString(),
                        ownedWorkspaces: user.ownedWorkspaces.map((ws) => ({
                            ...ws,
                            id: ws.id.toString(),
                        })),
                    },
                })
            )

            return response
        } catch (error) {
            const authError = handleAuthError(error)
            return NextResponse.json(
                errorResponse(authError.message, authError.statusCode),
                { status: authError.statusCode }
            )
        }
    }

    async forgotPassword(request: NextRequest) {
        try {
            const body = await request.json()
            const result = await this.service.forgotPassword(body)

            // Log if development (for testing)
            if (process.env.NODE_ENV === 'development' && result.userFound && result.resetToken) {
                console.log('[DEV] Reset token:', result.resetToken)
            }

            // Always return same message (prevent email enumeration)
            const response = NextResponse.json(
                successResponse({
                    message: 'If email exists, password reset link has been sent',
                    // Only return token in development
                    ...(process.env.NODE_ENV === 'development' &&
                        result.resetToken && {
                        resetToken: result.resetToken,
                    }),
                })
            )

            return response
        } catch (error) {
            const authError = handleAuthError(error)
            return NextResponse.json(
                errorResponse(authError.message, authError.statusCode),
                { status: authError.statusCode }
            )
        }
    }

    async resetPassword(request: NextRequest) {
        try {
            const body = await request.json()
            const user = await this.service.resetPassword(body)

            const response = NextResponse.json(
                successResponse({
                    message: 'Password reset successful',
                    user: {
                        id: user.id.toString(),
                        email: user.email,
                        fullName: user.fullName,
                    },
                })
            )

            return response
        } catch (error) {
            const authError = handleAuthError(error)
            return NextResponse.json(
                errorResponse(authError.message, authError.statusCode),
                { status: authError.statusCode }
            )
        }
    }
}