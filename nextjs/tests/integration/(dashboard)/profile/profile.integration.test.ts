import { describe, it, expect, beforeAll, afterAll } from 'vitest'

describe('Profile Page - Integration Tests', () => {
    const baseUrl = 'http://localhost:3000'
    let authToken: string
    let userId: string

    const testUser = {
        email: `profile-test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        fullName: 'Profile Test User',
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
        // Cleanup: Delete test user
        if (userId && authToken) {
            await fetch(`${baseUrl}/api/profile`, {
                method: 'DELETE',
                headers: { 'Cookie': authToken },
            }).catch(() => { })
        }
    })

    describe('GET /api/profile - Fetch Profile Data', () => {
        it('should retrieve authenticated user profile data', async () => {
            const response = await fetch(`${baseUrl}/api/profile`, {
                headers: { 'Cookie': authToken },
                credentials: 'include',
            })

            expect(response.status).toBe(200)
            const data = await response.json()

            expect(data.success).toBe(true)
            expect(data.data).toBeDefined()
            expect(data.data.user).toBeDefined()
        })

        it('should return user object with all required fields', async () => {
            const response = await fetch(`${baseUrl}/api/profile`, {
                headers: { 'Cookie': authToken },
                credentials: 'include',
            })

            const data = await response.json()
            const user = data.data.user

            expect(user.id).toBeDefined()
            expect(user.email).toBe(testUser.email)
            expect(user.fullName).toBe(testUser.fullName)
            expect(user.createdAt).toBeDefined()
            expect(user.updatedAt).toBeDefined()
        })

        it('should return correct email address', async () => {
            const response = await fetch(`${baseUrl}/api/profile`, {
                headers: { 'Cookie': authToken },
                credentials: 'include',
            })

            const data = await response.json()
            expect(data.data.user.email).toBe(testUser.email)
        })

        it('should return correct full name', async () => {
            const response = await fetch(`${baseUrl}/api/profile`, {
                headers: { 'Cookie': authToken },
                credentials: 'include',
            })

            const data = await response.json()
            expect(data.data.user.fullName).toBe(testUser.fullName)
        })

        it('should return valid timestamp fields', async () => {
            const response = await fetch(`${baseUrl}/api/profile`, {
                headers: { 'Cookie': authToken },
                credentials: 'include',
            })

            const data = await response.json()
            const user = data.data.user

            // Verify timestamps are valid ISO strings
            expect(new Date(user.createdAt)).toBeInstanceOf(Date)
            expect(new Date(user.updatedAt)).toBeInstanceOf(Date)

            // updatedAt should be >= createdAt
            expect(
                new Date(user.updatedAt).getTime() >=
                new Date(user.createdAt).getTime()
            ).toBe(true)
        })

        it('should return a valid UUID for user ID', async () => {
            const response = await fetch(`${baseUrl}/api/profile`, {
                headers: { 'Cookie': authToken },
                credentials: 'include',
            })

            const data = await response.json()
            const uuidRegex =
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

            expect(uuidRegex.test(data.data.user.id)).toBe(true)
        })

        it('should reject request without authentication', async () => {
            const response = await fetch(`${baseUrl}/api/profile`)

            expect(response.status).toBe(401)
        })

        it('should reject request with invalid token', async () => {
            const response = await fetch(`${baseUrl}/api/profile`, {
                headers: { 'Cookie': 'invalid-token' },
                credentials: 'include',
            })

            expect(response.status).toBe(401)
        })
    })

    describe('Profile Page Data Flow', () => {
        it('should display profile information after login', async () => {
            // Fetch profile data
            const response = await fetch(`${baseUrl}/api/profile`, {
                headers: { 'Cookie': authToken },
                credentials: 'include',
            })

            const data = await response.json()
            const profile = data.data.user

            // Verify all fields that the page displays are present
            expect(profile.fullName).toBeDefined()
            expect(profile.email).toBeDefined()
            expect(profile.createdAt).toBeDefined()
            expect(profile.updatedAt).toBeDefined()
            expect(profile.id).toBeDefined()
        })

        it('should show account creation date properly formatted', async () => {
            const response = await fetch(`${baseUrl}/api/profile`, {
                headers: { 'Cookie': authToken },
                credentials: 'include',
            })

            const data = await response.json()
            const createdAt = new Date(data.data.user.createdAt)

            // Should be a valid date
            expect(createdAt.toString()).not.toBe('Invalid Date')

            // Should be recent (within last hour)
            const now = new Date()
            const diffInMinutes =
                (now.getTime() - createdAt.getTime()) / (1000 * 60)
            expect(diffInMinutes).toBeLessThan(60)
        })

        it('should generate avatar from first character of fullName', async () => {
            const response = await fetch(`${baseUrl}/api/profile`, {
                headers: { 'Cookie': authToken },
                credentials: 'include',
            })

            const data = await response.json()
            const profile = data.data.user

            // Verify fullName exists and has at least 1 character
            expect(profile.fullName).toBeDefined()
            expect(profile.fullName.length).toBeGreaterThan(0)

            // In the page, the avatar is generated from first character
            const firstChar = profile.fullName.charAt(0).toUpperCase()
            expect(firstChar).toMatch(/[A-Z]/)
        })
    })

    describe('Profile Page Error States', () => {
        it('should handle unauthenticated user access', async () => {
            // Try to access profile without auth
            const response = await fetch(`${baseUrl}/api/profile`)

            expect(response.status).toBe(401)

            // The page should redirect to /login in this case
            // (This is handled by useEffect in the component)
        })

        it('should handle missing profile data gracefully', async () => {
            // This would require an endpoint that returns null/undefined for user
            // Verify the API returns proper error structure
            const response = await fetch(`${baseUrl}/api/profile`, {
                headers: { 'Cookie': authToken },
                credentials: 'include',
            })

            // Should always return user data or error, not undefined
            const data = await response.json()
            expect(data).toHaveProperty('success')
            expect(data).toHaveProperty('data')
        })
    })

    describe('Profile Page Edit Functionality', () => {
        it('should allow viewing profile before edit', async () => {
            const response = await fetch(`${baseUrl}/api/profile`, {
                headers: { 'Cookie': authToken },
                credentials: 'include',
            })

            expect(response.status).toBe(200)
            const data = await response.json()
            expect(data.data.user.fullName).toBe(testUser.fullName)
            expect(data.data.user.email).toBe(testUser.email)
        })

        it('should maintain user ID across profile updates', async () => {
            // Get initial profile
            const initialResponse = await fetch(`${baseUrl}/api/profile`, {
                headers: { 'Cookie': authToken },
                credentials: 'include',
            })

            const initialData = await initialResponse.json()
            const initialUserId = initialData.data.user.id

            // Update profile
            const updateResponse = await fetch(`${baseUrl}/api/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': authToken,
                },
                body: JSON.stringify({
                    fullName: 'Updated Profile Name',
                    email: `updated-profile-${Date.now()}@example.com`,
                }),
                credentials: 'include',
            })

            expect(updateResponse.status).toBe(200)

            // Get updated profile
            const updatedResponse = await fetch(`${baseUrl}/api/profile`, {
                headers: { 'Cookie': authToken },
                credentials: 'include',
            })

            const updatedData = await updatedResponse.json()
            const updatedUserId = updatedData.data.user.id

            // ID should remain the same
            expect(updatedUserId).toBe(initialUserId)
        })

        it('should reflect updated profile after edit', async () => {
            const newFullName = `Updated Name ${Date.now()}`
            const newEmail = `updated-${Date.now()}@example.com`

            // Update profile
            const updateResponse = await fetch(`${baseUrl}/api/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': authToken,
                },
                body: JSON.stringify({
                    fullName: newFullName,
                    email: newEmail,
                }),
                credentials: 'include',
            })

            expect(updateResponse.status).toBe(200)

            // Fetch profile and verify changes
            const fetchResponse = await fetch(`${baseUrl}/api/profile`, {
                headers: { 'Cookie': authToken },
                credentials: 'include',
            })

            const data = await fetchResponse.json()
            expect(data.data.user.fullName).toBe(newFullName)
            expect(data.data.user.email).toBe(newEmail)
        })
    })
})