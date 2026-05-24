import { describe, test, expect } from 'vitest'
import fixtures from './fixtures'

const ts = Date.now()
const TEST_EMAIL = `qa+board.${ts}@example.com`
const TEST_PASSWORD = 'Qa@123456'

describe('E2E Board & List Tests', () => {
    test('TC11 — Tạo mới một Bảng công việc (Board) trong một Workspace cụ thể', async () => {
        await fixtures.createUser(TEST_EMAIL, TEST_PASSWORD)
        const login = await fixtures.login(TEST_EMAIL, TEST_PASSWORD)
        const token = login.body?.token
        const ws = await fixtures.createWorkspace(token, { name: `ws-board-${ts}` })
        const wsId = ws.body?.workspace?.id || ws.body?.id || 0
        const res = await fixtures.createBoard(token, wsId, { title: `Board ${ts}` })
        expect(res.status === 201 || res.status === 200).toBeTruthy()
    })

    test('TC12 — Tạo mới một Danh sách trạng thái (List) trên bảng Kanban', async () => {
        // Create user, workspace and board, then create a list via API
        await fixtures.createUser(TEST_EMAIL, TEST_PASSWORD)
        const login = await fixtures.login(TEST_EMAIL, TEST_PASSWORD)
        const token = login.body?.token
        const ws = await fixtures.createWorkspace(token, { name: `ws-board-${ts}` })
        const wsId = ws.body?.workspace?.id || ws.body?.id || 0
        const board = await fixtures.createBoard(token, wsId, { title: `Board ${ts}` })
        const boardId = board.body?.board?.id || board.body?.id || 0

        const res = await fixtures.createList(token, boardId, { title: `List ${ts}` })
        expect([201, 200].includes(res.status)).toBeTruthy()

        const list = res.body?.list || res.body
        expect(list).toBeTruthy()
        expect(list.title || list.name).toBeDefined()
    })

    test('TC13 — Thay đổi vị trí sắp xếp của các List trên Board', async () => {
        // Create user, workspace, board and three lists. Move third list to position 0 and verify order.
        await fixtures.createUser(TEST_EMAIL, TEST_PASSWORD)
        const login = await fixtures.login(TEST_EMAIL, TEST_PASSWORD)
        const token = login.body?.token
        const ws = await fixtures.createWorkspace(token, { name: `ws-board-${ts}` })
        const wsId = ws.body?.workspace?.id || ws.body?.id || 0
        const board = await fixtures.createBoard(token, wsId, { title: `Board ${ts}` })
        const boardId = board.body?.board?.id || board.body?.id || 0

        const l1 = await fixtures.createList(token, boardId, { title: `L1 ${ts}` })
        const l2 = await fixtures.createList(token, boardId, { title: `L2 ${ts}` })
        const l3 = await fixtures.createList(token, boardId, { title: `L3 ${ts}` })

        expect([201, 200].includes(l1.status)).toBeTruthy()
        expect([201, 200].includes(l2.status)).toBeTruthy()
        expect([201, 200].includes(l3.status)).toBeTruthy()

        const l1Id = l1.body?.list?.id || l1.body?.id
        const l2Id = l2.body?.list?.id || l2.body?.id
        const l3Id = l3.body?.list?.id || l3.body?.id

        // Move L3 to position 0
        const moveRes = await fixtures.api(
            `/api/workspaces/${wsId}/boards/${boardId}/lists/${l3Id}`,
            {
                method: 'PATCH',
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                body: JSON.stringify({ position: 0 }),
            }
        )

        expect([200].includes(moveRes.status)).toBeTruthy()

        // Fetch lists and verify new order: L3,L1,L2
        const listsRes = await fixtures.api(`/api/workspaces/${wsId}/boards/${boardId}/lists`, {
            method: 'GET',
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })

        expect([200].includes(listsRes.status)).toBeTruthy()
        const lists = listsRes.body?.lists || listsRes.body
        expect(Array.isArray(lists)).toBeTruthy()
        expect(lists.length).toBeGreaterThanOrEqual(3)
        const orderIds = lists
            .slice(0, 3)
            .map((l: { id?: string | number | bigint }) => (l.id?.toString ? l.id.toString() : l.id))
        expect(orderIds[0].toString()).toBe(l3Id?.toString())
        expect(orderIds[1].toString()).toBe(l1Id?.toString())
        expect(orderIds[2].toString()).toBe(l2Id?.toString())
    })
})
