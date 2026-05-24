import { describe, it, expect, beforeAll, afterAll } from 'vitest'

describe('Settings - Profile, Security & Preferences Integration', () => {
    const baseUrl = 'http://localhost:3000'
    let authToken: string
    let userId: string

    const testUser = {
        email: `settings-test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        fullName: 'Settings Test User',
    }

    beforeAll(async () => {
        // Register test user
        const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser),
        })

        if (registerResponse.status !== 201) {
            throw new Error('Failed to register test user')
        }

        // Login to get auth token
        const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testUser.email,
                password: testUser.password,
            }),
            credentials: 'include',
        })

        const loginData = await loginResponse.json()
        authToken = loginResponse.headers.get('set-cookie') || ''
        const userData = loginData.data?.user
        userId = userData?.id

        if (!userId) {
            throw new Error('Failed to get user ID from login')
        }

        console.log('✅ Test user registered and logged in')
    })

    afterAll(async () => {
        // Cleanup: Delete test user (if delete endpoint exists)
        if (userId) {
            await fetch(`${baseUrl}/api/profile`, {
                method: 'DELETE',
                headers: { 'Cookie': authToken },
            }).catch(() => { })
        }
    })

    describe('PUT /api/profile - Update Profile', () => {
        it('should successfully update profile information', async () => {
            const updatedData = {
                fullName: 'Updated Full Name',
                email: `updated-${Date.now()}@example.com`,
            }

            const response = await fetch(`${baseUrl}/api/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': authToken,
                },
                body: JSON.stringify(updatedData),
                credentials: 'include',
            })

            expect(response.status).toBe(200)
            const data = await response.json()
            expect(data.success).toBe(true)
            expect(data.data.user.fullName).toBe(updatedData.fullName)
        })

        it('should reject update with invalid email', async () => {
            const response = await fetch(`${baseUrl}/api/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': authToken,
                },
                body: JSON.stringify({
                    fullName: 'Test User',
                    email: 'invalid-email',
                }),
                credentials: 'include',
            })

            expect(response.status).toBe(400)
        })

        it('should reject update without authentication', async () => {
            const response = await fetch(`${baseUrl}/api/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: 'Test User',
                    email: 'test@example.com',
                }),
            })

            expect(response.status).toBe(401)
        })

        it('should require fullName field', async () => {
            const response = await fetch(`${baseUrl}/api/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': authToken,
                },
                body: JSON.stringify({
                    email: 'test@example.com',
                }),
                credentials: 'include',
            })

            expect(response.status).toBe(400)
        })
    })

    describe('PUT /api/profile/password - Update Password', () => {
        it('should successfully update password', async () => {
            const newPassword = 'NewPassword456!'

            const response = await fetch(`${baseUrl}/api/profile/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': authToken,
                },
                body: JSON.stringify({
                    currentPassword: testUser.password,
                    newPassword: newPassword,
                }),
                credentials: 'include',
            })

            expect(response.status).toBe(200)
            const data = await response.json()
            expect(data.success).toBe(true)

            // Update test user password for cleanup
            testUser.password = newPassword
        })

        it('should reject with incorrect current password', async () => {
            const response = await fetch(`${baseUrl}/api/profile/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': authToken,
                },
                body: JSON.stringify({
                    currentPassword: 'WrongPassword123!',
                    newPassword: 'NewPassword789!',
                }),
                credentials: 'include',
            })

            expect(response.status).toBe(401)
            const data = await response.json()
            expect(data.error).toContain('Current password is incorrect')
        })

        it('should reject password with insufficient length', async () => {
            const response = await fetch(`${baseUrl}/api/profile/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': authToken,
                },
                body: JSON.stringify({
                    currentPassword: testUser.password,
                    newPassword: '123',
                }),
                credentials: 'include',
            })

            expect(response.status).toBe(400)
        })

        it('should require authentication', async () => {
            const response = await fetch(`${baseUrl}/api/profile/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: testUser.password,
                    newPassword: 'NewPassword456!',
                }),
            })

            expect(response.status).toBe(401)
        })
    })

    describe('GET /api/settings/preferences - Get Preferences', () => {
        it('should retrieve user preferences', async () => {
            const response = await fetch(`${baseUrl}/api/settings/preferences`, {
                headers: { 'Cookie': authToken },
                credentials: 'include',
            })

            expect(response.status).toBe(200)
            const data = await response.json()
            expect(data).toHaveProperty('emailNotifications')
            expect(data).toHaveProperty('darkMode')
        })

        it('should reject without authentication', async () => {
            const response = await fetch(`${baseUrl}/api/settings/preferences`)

            expect(response.status).toBe(401)
        })
    })

    describe('PUT /api/settings/preferences - Update Preferences', () => {
        it('should successfully update email notifications preference', async () => {
            const response = await fetch(`${baseUrl}/api/settings/preferences`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': authToken,
                },
                body: JSON.stringify({ emailNotifications: false }),
                credentials: 'include',
            })

            expect(response.status).toBe(200)
            const data = await response.json()
            expect(data.success).toBe(true)
            expect(data.data.emailNotifications).toBe(false)
        })

        it('should successfully update dark mode preference', async () => {
            const response = await fetch(`${baseUrl}/api/settings/preferences`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': authToken,
                },
                body: JSON.stringify({ darkMode: true }),
                credentials: 'include',
            })

            expect(response.status).toBe(200)
            const data = await response.json()
            expect(data.success).toBe(true)
            expect(data.data.darkMode).toBe(true)
        })

        it('should update multiple preferences at once', async () => {
            const response = await fetch(`${baseUrl}/api/settings/preferences`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': authToken,
                },
                body: JSON.stringify({
                    emailNotifications: true,
                    darkMode: false,
                }),
                credentials: 'include',
            })

            expect(response.status).toBe(200)
            const data = await response.json()
            expect(data.data.emailNotifications).toBe(true)
            expect(data.data.darkMode).toBe(false)
        })

        it('should require authentication', async () => {
            const response = await fetch(`${baseUrl}/api/settings/preferences`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emailNotifications: false }),
            })

            expect(response.status).toBe(401)
        })
    })

    describe('DELETE /api/profile - Delete Account', () => {
        it('should require authentication', async () => {
            const response = await fetch(`${baseUrl}/api/profile`, {
                method: 'DELETE',
            })

            expect(response.status).toBe(401)
        })

        it('should successfully delete account', async () => {
            // Create a separate user for deletion test
            const deleteTestUser = {
                email: `delete-test-${Date.now()}@example.com`,
                password: 'DeletePassword123!',
                fullName: 'Delete Test User',
            }

            // Register
            await fetch(`${baseUrl}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(deleteTestUser),
            })

            // Login
            const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: deleteTestUser.email,
                    password: deleteTestUser.password,
                }),
                credentials: 'include',
            })

            const deleteCookie = loginResponse.headers.get('set-cookie') || ''

            // Delete account
            const deleteResponse = await fetch(`${baseUrl}/api/profile`, {
                method: 'DELETE',
                headers: { 'Cookie': deleteCookie },
                credentials: 'include',
            })

            expect(deleteResponse.status).toBe(200)

            // Verify user can't login anymore
            const reLoginResponse = await fetch(`${baseUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: deleteTestUser.email,
                    password: deleteTestUser.password,
                }),
            })

            expect(reLoginResponse.status).toBe(401)
        })
    })
})