import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import * as crypto from 'node:crypto'
import {
    loginSchema,
    registerSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    resendVerificationSchema,
    verifyEmailSchema,
} from '@/lib/validation/auth'
import { AuthRepository } from '@/lib/repositories/auth.repository'
import { JWT_SECRET } from '@/lib/utils/auth'
import { AuthError, AuthErrorCode } from '@/lib/utils/error-handler'

export class AuthService {
    private readonly repository = new AuthRepository();

    private createVerificationToken() {
        const token = crypto.randomBytes(32).toString('hex')
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
        return { token, hashedToken }
    }

    async register(credentials: unknown) {
        try {
            // Validate input
            const validatedData = registerSchema.parse(credentials)
            const email = validatedData.email.toLowerCase()

            // Check if user exists
            const existingUser = await this.repository.findUserByEmail(email)
            if (existingUser) {
                throw new AuthError(
                    'Email already registered',
                    409,
                    AuthErrorCode.EMAIL_ALREADY_REGISTERED
                )
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(validatedData.password, 10)
            const { token, hashedToken } = this.createVerificationToken()

            // Create user
            const user = await this.repository.createUser(
                email,
                hashedPassword,
                validatedData.fullName,
                hashedToken,
                new Date(Date.now() + 24 * 60 * 60 * 1000)
            )

            return { user, verificationToken: token }
        } catch (error) {
            if (error instanceof AuthError) throw error
            throw new AuthError(
                'Registration failed',
                400,
                AuthErrorCode.INTERNAL_ERROR
            )
        }
    }

    async login(credentials: unknown) {
        try {
            // Validate input
            const validatedData = loginSchema.parse(credentials)
            const email = validatedData.email.toLowerCase()

            // Find user
            const user = await this.repository.findUserByEmail(email)
            if (!user) {
                throw new AuthError(
                    'Invalid email or password',
                    401,
                    AuthErrorCode.INVALID_CREDENTIALS
                )
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(
                validatedData.password,
                user.passwordHash
            )
            if (!isPasswordValid) {
                throw new AuthError(
                    'Invalid email or password',
                    401,
                    AuthErrorCode.INVALID_CREDENTIALS
                )
            }

            if (!user.emailVerifiedAt) {
                throw new AuthError(
                    'Please verify your email before logging in',
                    403,
                    AuthErrorCode.EMAIL_NOT_VERIFIED
                )
            }

            return user
        } catch (error) {
            if (error instanceof AuthError) throw error
            throw new AuthError('Login failed', 400, AuthErrorCode.INTERNAL_ERROR)
        }
    }

    generateTokens(userId: bigint) {
        try {
            const accessToken = jwt.sign(
                { userId: userId.toString() },
                JWT_SECRET,
                { expiresIn: '7d' }
            )

            const refreshToken = jwt.sign(
                { userId: userId.toString() },
                JWT_SECRET,
                { expiresIn: '30d' }
            )

            return { accessToken, refreshToken }
        } catch (error) {
            console.error('Token generation failed:', error)
            throw new AuthError('Token generation failed', 500, AuthErrorCode.INTERNAL_ERROR)
        }
    }

    async storeRefreshToken(userId: bigint, refreshToken: string) {
        try {
            const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            await this.repository.createRefreshToken(userId, refreshToken, expiresAt)
        } catch (error) {
            console.error('Failed to store refresh token:', error)
            throw new AuthError(
                'Failed to store refresh token',
                500,
                AuthErrorCode.INTERNAL_ERROR
            )
        }
    }

    async refreshAccessToken(refreshToken: string) {
        try {
            // Verify token signature
            try {
                jwt.verify(refreshToken, JWT_SECRET)
            } catch (verifyError) {
                // Check error type and throw appropriate AuthError
                if (verifyError instanceof jwt.TokenExpiredError) {
                    throw new AuthError(
                        'Refresh token expired',
                        401,
                        AuthErrorCode.TOKEN_EXPIRED
                    )
                }
                if (verifyError instanceof jwt.JsonWebTokenError) {
                    throw new AuthError(
                        'Invalid refresh token',
                        401,
                        AuthErrorCode.INVALID_TOKEN
                    )
                }
                // Re-throw unknown errors for outer catch
                throw verifyError
            }

            // Check if token exists in DB
            const storedToken = await this.repository.findRefreshToken(refreshToken)
            if (!storedToken) {
                throw new AuthError(
                    'Refresh token not found or revoked',
                    401,
                    AuthErrorCode.INVALID_TOKEN
                )
            }

            // Generate new access token
            const newAccessToken = jwt.sign(
                { userId: storedToken.userId.toString() },
                JWT_SECRET,
                { expiresIn: '7d' }
            )

            return newAccessToken
        } catch (error) {
            if (error instanceof AuthError) throw error
            console.error('Token refresh failed:', error)
            throw new AuthError('Token refresh failed', 401, AuthErrorCode.INTERNAL_ERROR)
        }
    }

    async logout(refreshToken: string) {
        try {
            if (refreshToken) {
                await this.repository.revokeRefreshToken(refreshToken)
            }
        } catch (error) {
            console.error('Logout failed:', error)
            throw new AuthError('Logout failed', 500, AuthErrorCode.INTERNAL_ERROR)
        }
    }

    async getUser(userId: bigint) {
        try {
            const user = await this.repository.getUserById(userId)
            if (!user) {
                throw new AuthError('User not found', 404, AuthErrorCode.USER_NOT_FOUND)
            }
            return user
        } catch (error) {
            if (error instanceof AuthError) throw error
            throw new AuthError('Failed to fetch user', 500, AuthErrorCode.INTERNAL_ERROR)
        }
    }

    async forgotPassword(credentials: unknown) {
        try {
            // Validate input
            const validatedData = forgotPasswordSchema.parse(credentials)
            const email = validatedData.email.toLowerCase()

            // Find user by email
            const user = await this.repository.findUserByEmail(email)

            // Always return success (prevent email enumeration)
            if (!user) {
                return { userFound: false, resetToken: null }
            }

            // Generate reset token
            const resetToken = crypto.randomBytes(32).toString('hex')
            const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

            // Store token and expiry in database (1 hour)
            await this.repository.updatePasswordResetToken(
                email,
                hashedToken,
                new Date(Date.now() + 60 * 60 * 1000)
            )

            return { userFound: true, resetToken }
        } catch (error) {
            if (error instanceof AuthError) throw error
            throw new AuthError(
                'Failed to process forgot password',
                500,
                AuthErrorCode.INTERNAL_ERROR
            )
        }
    }

    async resetPassword(credentials: unknown) {
        try {
            // Validate input
            const validatedData = resetPasswordSchema.parse(credentials)

            // Hash token for lookup
            const hashedToken = crypto
                .createHash('sha256')
                .update(validatedData.token)
                .digest('hex')

            // Find user with valid reset token
            const user = await this.repository.findUserByResetToken(hashedToken)

            if (!user) {
                throw new AuthError(
                    'Invalid or expired reset token',
                    400,
                    AuthErrorCode.INVALID_RESET_TOKEN
                )
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(validatedData.password, 10)

            // Update password and clear reset token
            await this.repository.resetPassword(user.id, hashedPassword)

            return user
        } catch (error) {
            if (error instanceof AuthError) throw error
            throw new AuthError('Password reset failed', 500, AuthErrorCode.INTERNAL_ERROR)
        }
    }

    async verifyEmail(credentials: unknown) {
        try {
            const validatedData = verifyEmailSchema.parse(credentials)
            const hashedToken = crypto
                .createHash('sha256')
                .update(validatedData.token)
                .digest('hex')

            const user = await this.repository.findUserByEmailVerificationToken(hashedToken)

            if (!user) {
                throw new AuthError(
                    'Invalid or expired verification token',
                    400,
                    AuthErrorCode.INVALID_TOKEN
                )
            }

            return this.repository.verifyEmail(user.id)
        } catch (error) {
            if (error instanceof AuthError) throw error
            throw new AuthError('Email verification failed', 500, AuthErrorCode.INTERNAL_ERROR)
        }
    }

    async resendVerification(credentials: unknown) {
        try {
            const validatedData = resendVerificationSchema.parse(credentials)
            const email = validatedData.email.toLowerCase()
            const user = await this.repository.findUserByEmail(email)

            if (!user) {
                return { userFound: false, alreadyVerified: false, verificationToken: null }
            }

            if (user.emailVerifiedAt) {
                return { userFound: true, alreadyVerified: true, verificationToken: null }
            }

            const { token, hashedToken } = this.createVerificationToken()

            await this.repository.updateEmailVerificationToken(
                email,
                hashedToken,
                new Date(Date.now() + 24 * 60 * 60 * 1000)
            )

            return { userFound: true, alreadyVerified: false, verificationToken: token }
        } catch (error) {
            if (error instanceof AuthError) throw error
            throw new AuthError(
                'Failed to resend verification email',
                500,
                AuthErrorCode.INTERNAL_ERROR
            )
        }
    }
}
