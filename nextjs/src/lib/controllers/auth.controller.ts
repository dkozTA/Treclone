import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse } from '@/lib/utils/api-utils'
import { AuthService } from '@/lib/services/auth.service'
import {
    sendEmailVerificationEmail,
    sendPasswordResetEmail,
} from '@/lib/services/email.service'
import { handleAuthError } from '@/lib/utils/error-handler'

function getRequestAppUrl(request: NextRequest) {
    const forwardedHost = request.headers.get('x-forwarded-host')
    const host = forwardedHost || request.headers.get('host')
    const forwardedProto = request.headers.get('x-forwarded-proto')
    const proto =
        forwardedProto ||
        request.nextUrl.protocol.replace(':', '') ||
        (process.env.NODE_ENV === 'production' ? 'https' : 'http')

    if (host) {
        return `${proto}://${host}`.replace(/\/$/, '')
    }

    return request.nextUrl.origin.replace(/\/$/, '')
}

export class AuthController {
    private readonly service = new AuthService()

    async register(request: NextRequest) {
        try {
            const body = await request.json()
            const { user, verificationToken } = await this.service.register(body)

            try {
                await sendEmailVerificationEmail({
                    to: user.email,
                    verificationToken,
                    appUrl: getRequestAppUrl(request),
                })
            } catch (error) {
                console.error('Failed to send verification email:', error)
            }

            if (process.env.NODE_ENV === 'development') {
                console.log('[DEV] Email verification token:', verificationToken)
            }

            const response = NextResponse.json(
                successResponse({
                    message: 'User registered successfully. Please verify your email.',
                    user: {
                        id: user.id.toString(),
                        email: user.email,
                        fullName: user.fullName,
                        emailVerifiedAt: user.emailVerifiedAt,
                    },
                    ...(process.env.NODE_ENV === 'development' && {
                        verificationToken,
                    }),
                }, 201),
                { status: 201 }
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
                        emailVerifiedAt: user.emailVerifiedAt,
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

            if (result.userFound && result.resetToken) {
                try {
                    await sendPasswordResetEmail({
                        to: body.email,
                        resetToken: result.resetToken,
                        appUrl: getRequestAppUrl(request),
                    })
                } catch (error) {
                    console.error('Failed to send password reset email:', error)
                }
            }

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
                        emailVerifiedAt: user.emailVerifiedAt,
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

    async verifyEmail(request: NextRequest) {
        try {
            const body = await request.json()
            const user = await this.service.verifyEmail(body)

            const response = NextResponse.json(
                successResponse({
                    message: 'Email verified successfully',
                    user: {
                        id: user.id.toString(),
                        email: user.email,
                        fullName: user.fullName,
                        emailVerifiedAt: user.emailVerifiedAt,
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

    async resendVerification(request: NextRequest) {
        try {
            const body = await request.json()
            const result = await this.service.resendVerification(body)

            if (result.userFound && result.verificationToken) {
                try {
                    await sendEmailVerificationEmail({
                        to: body.email,
                        verificationToken: result.verificationToken,
                        appUrl: getRequestAppUrl(request),
                    })
                } catch (error) {
                    console.error('Failed to resend verification email:', error)
                }
            }

            if (process.env.NODE_ENV === 'development' && result.verificationToken) {
                console.log('[DEV] Email verification token:', result.verificationToken)
            }

            const response = NextResponse.json(
                successResponse({
                    message: result.alreadyVerified
                        ? 'Email is already verified'
                        : 'If the account exists, a verification email has been sent',
                    ...(process.env.NODE_ENV === 'development' &&
                        result.verificationToken && {
                        verificationToken: result.verificationToken,
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
}
