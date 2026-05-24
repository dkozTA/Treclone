import { describe, test, expect } from 'vitest'
import fixtures from './fixtures'

const ts = Date.now()
const TEST_EMAIL = `qa+auth.${ts}@example.com`
const TEST_PASSWORD = 'Qa@123456'

describe('E2E Auth Tests', () => {
    test('TC01 — Đăng ký tài khoản thành công', async () => {
        const res = await fixtures.createUser(TEST_EMAIL, TEST_PASSWORD, 'QA Auth')
        expect(res).toBeDefined()
        expect([200, 201]).toContain(res.status)

        // if the API returned JSON, assert the created user's email and optional id
        if (res.body && typeof res.body === 'object' && !Array.isArray(res.body)) {
            expect(res.body).toEqual(expect.objectContaining({ email: TEST_EMAIL }))
            if ('id' in res.body) {
                const id = (res.body).id
                expect(typeof id === 'number' || typeof id === 'string').toBeTruthy()
            }
        }
    })

    test('TC02 — Đăng ký thất bại do trùng Email hoặc sai định dạng dữ liệu', async () => {
        await fixtures.createUser(TEST_EMAIL, TEST_PASSWORD, 'QA Auth')
        const res = await fixtures.createUser(TEST_EMAIL, TEST_PASSWORD, 'QA Auth')
        expect(res.status).not.toBe(201)
    })

    test('TC03 — Đăng nhập thành công vào hệ thống', async () => {
        await fixtures.createUser(TEST_EMAIL, TEST_PASSWORD, 'QA Login')
        const res = await fixtures.login(TEST_EMAIL, TEST_PASSWORD)
        expect(res.status === 200 || res.status === 201).toBeTruthy()
    })

    test('TC04 — Đăng nhập thất bại (Sai mật khẩu hoặc email không tồn tại)', async () => {
        const res = await fixtures.login('no.user.' + ts + '@example.com', 'badpass')
        expect(res.status).not.toBe(200)
    })

    test('TC05 — Yêu cầu cấp lại mật khẩu (Forgot Password) thành công', async () => {
        await fixtures.createUser(`qa+fp.${ts}@example.com`, TEST_PASSWORD)
        const res = await fixtures.api('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email: `qa+fp.${ts}@example.com` }) })
        expect(res.status === 200 || res.status === 201).toBeTruthy()
    })

    test('TC06 — Đổi mật khẩu trong trang cấu hình bảo mật (Settings)', async () => {
        // create and login to get cookies
        await fixtures.createUser(TEST_EMAIL, TEST_PASSWORD, 'QA Settings')
        const loginRes = await fixtures.login(TEST_EMAIL, TEST_PASSWORD)
        expect([200, 201]).toContain(loginRes.status)

        // extract Set-Cookie header(s) and build Cookie header for subsequent requests
        const setCookieRaw = loginRes.headers && (loginRes.headers['set-cookie'] || loginRes.headers['Set-Cookie'])
        let cookieHeader = ''
        if (setCookieRaw) {
            // join cookie name=value pairs (strip attributes)
            cookieHeader = setCookieRaw
                .split(/,\s*/)
                .map((c: string) => c.split(';')[0].trim())
                .filter(Boolean)
                .join('; ')
        }

        const NEW_PASSWORD = 'New' + TEST_PASSWORD

        const changeRes = await fixtures.api('/api/settings', {
            method: 'PATCH',
            headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
            body: JSON.stringify({ currentPassword: TEST_PASSWORD, newPassword: NEW_PASSWORD }),
        })

        expect([200, 201]).toContain(changeRes.status)

        // old password should no longer work
        const oldLogin = await fixtures.login(TEST_EMAIL, TEST_PASSWORD)
        expect(oldLogin.status).not.toBe(200)

        // new password should succeed
        const newLogin = await fixtures.login(TEST_EMAIL, NEW_PASSWORD)
        expect([200, 201]).toContain(newLogin.status)
    })
})
