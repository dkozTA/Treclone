import { describe, it, expect, beforeAll, afterAll } from 'vitest'

describe('Auth - Login Flow Integration', () => {
    const baseUrl = 'http://localhost:3000'
    const testUser = {
        email: `integration-test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        fullName: 'Test User',
    }

    beforeAll(async () => {
        const response = await fetch(`${baseUrl}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser),
        })

        const data = await response.json()
        console.log('📝 Register Status:', response.status)
        console.log('📝 Register Response:', data)

        if (![200, 201, 409].includes(response.status)) {
            throw new Error(`Registration failed with status ${response.status}`)
        }

        const verificationToken = data?.data?.verificationToken
        if (verificationToken) {
            const verifyResponse = await fetch(`${baseUrl}/api/auth/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: verificationToken }),
            })

            if (!verifyResponse.ok) {
                throw new Error(`Email verification failed with status ${verifyResponse.status}`)
            }
        }
    })

    afterAll(async () => {
        // Cleanup if needed
    })

    describe('POST /api/auth/login', () => {
        it('should successfully login with valid credentials', async () => {
            const response = await fetch(`${baseUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: testUser.email,
                    password: testUser.password,
                }),
                credentials: 'include',  // Include cookies
            })



            const data = await response.json()
            console.log('📝 Login Status:', response.status)
            console.log('📝 Login Response:', data)  // Add this to see error

            expect(response.status).toBe(200)
            expect(data.success).toBe(true)
            expect(data.data.user).toBeDefined()
            expect(data.data.user.email).toBe(testUser.email)
        })

        it('should reject login with invalid email', async () => {
            const response = await fetch(`${baseUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'invalid-email',
                    password: testUser.password,
                }),
            })

            expect(response.status).toBe(400)
        })

        it('should reject login with incorrect password', async () => {
            const response = await fetch(`${baseUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: testUser.email,
                    password: 'WrongPassword123!',
                }),
            })

            expect(response.status).toBe(401)
            const data = await response.json()
            expect(data.error).toContain('Invalid email or password')
        })

        it('should reject login with non-existent user', async () => {
            const response = await fetch(`${baseUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'nonexistent@example.com',
                    password: testUser.password,
                }),
            })

            expect(response.status).toBe(401)
        })

        it('should require both email and password', async () => {
            const response = await fetch(`${baseUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: testUser.email }),
            })

            expect(response.status).toBe(400)
        })

        it('should return valid response format', async () => {
            const response = await fetch(`${baseUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testUser),
                credentials: 'include',
            })

            expect(response.status).toBe(200)
            const data = await response.json()
            expect(data.success).toBe(true)
            expect(data.data.user).toBeDefined()
            expect(data.data.user).toHaveProperty('email')
            expect(data.data.user).toHaveProperty('fullName')
            expect(data.data.user).toHaveProperty('id')
        })
    })

    describe('GET /api/auth/me (After Login)', () => {
        let cookieJar: string

        beforeAll(async () => {
            const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testUser),
                credentials: 'include',
            })

            // Extract cookies from Set-Cookie header
            const setCookieHeader = loginResponse.headers.get('set-cookie')
            cookieJar = setCookieHeader || ''
            console.log('🍪 Cookies set:', cookieJar)
        })

        it('should return user info with valid token', async () => {
            const response = await fetch(`${baseUrl}/api/auth/me`, {
                headers: {
                    'Cookie': cookieJar,
                },
                credentials: 'include',
            })

            expect(response.status).toBe(200)
            const data = await response.json()
            console.log('📝 Me Response:', data)  // See actual format

            // Update assertions based on actual response format
            if (data.success) {
                // Wrapped response
                expect(data.data.user).toHaveProperty('email')
                expect(data.data.user.email).toBe(testUser.email)
            } else {
                // Direct response
                expect(data).toHaveProperty('email')
                expect(data.email).toBe(testUser.email)
            }
        })

        it('should reject request without token', async () => {
            const response = await fetch(`${baseUrl}/api/auth/me`)
            expect(response.status).toBe(401)
        })

        it('should reject request with invalid token', async () => {
            const response = await fetch(`${baseUrl}/api/auth/me`, {
                headers: {
                    'Authorization': 'Bearer invalid-token',
                },
            })
            expect(response.status).toBe(401)
        })
    })

    describe('POST /api/auth/logout', () => {
        it('should successfully logout', async () => {
            const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testUser),
                credentials: 'include',
            })

            const setCookieHeader = loginResponse.headers.get('set-cookie') || ''

            const logoutResponse = await fetch(`${baseUrl}/api/auth/logout`, {
                method: 'POST',
                headers: {
                    'Cookie': setCookieHeader,
                },
                credentials: 'include',
            })

            expect(logoutResponse.status).toBe(200)
        })
    })
})
