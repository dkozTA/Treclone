import { describe, test, expect } from 'vitest'
import fixtures from './fixtures'

const ts = Date.now()
const TEST_EMAIL = `qa+ws.${ts}@example.com`
const TEST_PASSWORD = 'Qa@123456'

describe('E2E Workspace Tests', () => {
    test('TC07 — Tạo mới một Không gian làm việc (Workspace) thành công', async () => {
        await fixtures.createUser(TEST_EMAIL, TEST_PASSWORD)
        const login = await fixtures.login(TEST_EMAIL, TEST_PASSWORD)
        const token = login.body?.token
        const res = await fixtures.createWorkspace(token, { name: `ws-qa-${ts}`, description: 'E2E workspace' })
        expect(res.status === 201 || res.status === 200).toBeTruthy()
    })

    test('TC08 — Tạo Workspace thất bại do bỏ trống các trường bắt buộc', async () => {
        await fixtures.createUser(`qa+ws2.${ts}@example.com`, TEST_PASSWORD)
        const login = await fixtures.login(`qa+ws2.${ts}@example.com`, TEST_PASSWORD)
        const token = login.body?.token
        const res = await fixtures.createWorkspace(token, { name: '' })
        expect(res.status).not.toBe(201)
    })

    test('TC09 — Cập nhật thông tin Workspace (Đổi tên, mô tả)', async () => {
        // create owner and login to get cookies
        await fixtures.createUser(TEST_EMAIL, TEST_PASSWORD)
        const login = await fixtures.login(TEST_EMAIL, TEST_PASSWORD)
        const setCookieRaw = login.headers && (login.headers['set-cookie'] || login.headers['Set-Cookie'])
        let cookieHeader = ''
        if (setCookieRaw) {
            cookieHeader = setCookieRaw
                .split(/,\s*/)
                .map((c: string) => c.split(';')[0].trim())
                .filter(Boolean)
                .join('; ')
        }

        // create workspace via API using cookies
        const createRes = await fixtures.api('/api/workspaces', {
            method: 'POST',
            headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
            body: JSON.stringify({ name: `ws-qa-${ts}`, description: 'Initial desc' }),
        })

        expect([200, 201]).toContain(createRes.status)
        const workspaceId = createRes.body?.workspace?.id
        expect(workspaceId).toBeTruthy()

        // update workspace
        const newName = `ws-updated-${ts}`
        const newDesc = 'Updated description'
        const updateRes = await fixtures.api(`/api/workspaces/${workspaceId}`, {
            method: 'PATCH',
            headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
            body: JSON.stringify({ name: newName, description: newDesc }),
        })

        expect([200, 201]).toContain(updateRes.status)
        expect(updateRes.body?.workspace?.name).toBe(newName)
        expect(updateRes.body?.workspace?.description).toBe(newDesc)
    })

    test('TC10 — Mời thành viên mới tham gia vào Workspace thông qua Email', async () => {
        // create owner and login
        const ownerEmail = `owner+ws.${ts}@example.com`
        const memberEmail = `member+ws.${ts}@example.com`
        await fixtures.createUser(ownerEmail, TEST_PASSWORD)
        await fixtures.createUser(memberEmail, TEST_PASSWORD)

        const login = await fixtures.login(ownerEmail, TEST_PASSWORD)
        const setCookieRaw = login.headers && (login.headers['set-cookie'] || login.headers['Set-Cookie'])
        let cookieHeader = ''
        if (setCookieRaw) {
            cookieHeader = setCookieRaw
                .split(/,\s*/)
                .map((c: string) => c.split(';')[0].trim())
                .filter(Boolean)
                .join('; ')
        }

        // create workspace
        const createRes = await fixtures.api('/api/workspaces', {
            method: 'POST',
            headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
            body: JSON.stringify({ name: `ws-invite-${ts}`, description: 'Invite test' }),
        })
        expect([200, 201]).toContain(createRes.status)
        const workspaceId = createRes.body?.workspace?.id
        expect(workspaceId).toBeTruthy()

        // invite member by email
        const inviteRes = await fixtures.api(`/api/workspaces/${workspaceId}/members`, {
            method: 'POST',
            headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
            body: JSON.stringify({ email: memberEmail, role: 'member' }),
        })

        expect([200, 201]).toContain(inviteRes.status)
        expect(inviteRes.body?.member?.user?.email).toBe(memberEmail)

        // fetch members and assert member exists
        const membersRes = await fixtures.api(`/api/workspaces/${workspaceId}/members`, {
            method: 'GET',
            headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
        })
        expect(membersRes.status).toBe(200)
        const members = membersRes.body?.members || []
        const found = members.find((m: { user?: { email?: string } }) => m.user?.email === memberEmail)
        expect(found).toBeDefined()
    })
})
