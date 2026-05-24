import { describe, test, expect } from 'vitest'
import fixtures from './fixtures'

const ts = Date.now()
const TEST_EMAIL = `qa+card.${ts}@example.com`
const TEST_PASSWORD = 'Qa@123456'

describe('E2E Card Tests', () => {
    test('TC15 — Thêm mới một Thẻ công việc (Card) vào một Danh sách (List) bất kỳ', async () => {
        await fixtures.createUser(TEST_EMAIL, TEST_PASSWORD)
        const login = await fixtures.login(TEST_EMAIL, TEST_PASSWORD)
        const token = login.body?.token
        const ws = await fixtures.createWorkspace(token, { name: `ws-card-${ts}` })
        const wsId = ws.body?.workspace?.id || ws.body?.id || 0
        const board = await fixtures.createBoard(token, wsId, { title: `Board Card ${ts}` })
        const boardId = board.body?.board?.id || board.body?.id || 0
        const list = await fixtures.createList(token, boardId, { title: 'To Do' })
        const listId = list.body?.list?.id || list.body?.id || 0
        const res = await fixtures.createCard(token, listId, { title: 'E2E Card 1' })
        expect(res.status === 201 || res.status === 200).toBeTruthy()
    })

    test('TC16 — Kéo - Thả (Drag and Drop) dịch chuyển một Thẻ công việc (Card) sang cột khác', async () => {
        // Create workspace, board and two lists, then move a card between lists
        await fixtures.createUser(TEST_EMAIL, TEST_PASSWORD)
        const login = await fixtures.login(TEST_EMAIL, TEST_PASSWORD)
        const token = login.body?.token
        const ws = await fixtures.createWorkspace(token, { name: `ws-card-move-${ts}` })
        const wsId = ws.body?.workspace?.id || ws.body?.id || 0
        const board = await fixtures.createBoard(token, wsId, { title: `Board Move ${ts}` })
        const boardId = board.body?.board?.id || board.body?.id || 0

        const listA = await fixtures.createList(token, boardId, { title: `List A ${ts}` })
        const listAId = listA.body?.list?.id || listA.body?.id || 0
        const listB = await fixtures.createList(token, boardId, { title: `List B ${ts}` })
        const listBId = listB.body?.list?.id || listB.body?.id || 0

        const c1 = await fixtures.createCard(token, listAId, { title: `Card A1 ${ts}` })
        const c2 = await fixtures.createCard(token, listAId, { title: `Card A2 ${ts}` })
        const c3 = await fixtures.createCard(token, listAId, { title: `Card A3 ${ts}` })

        expect([201, 200].includes(c1.status)).toBeTruthy()
        expect([201, 200].includes(c2.status)).toBeTruthy()
        expect([201, 200].includes(c3.status)).toBeTruthy()

        const c3Id = c3.body?.card?.id || c3.body?.id

        // Call the move endpoint for the card (server accepts board/workspace path)
        const moveRes = await fixtures.api(
            `/api/workspaces/${wsId}/boards/${boardId}/lists/${listAId}/cards/${c3Id}/move`,
            {
                method: 'PATCH',
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                body: JSON.stringify({ listId: listBId, position: 0 }),
            }
        )

        expect([200].includes(moveRes.status)).toBeTruthy()

        // Verify card appears in target list at position 0
        const listBCards = await fixtures.api(
            `/api/workspaces/${wsId}/boards/${boardId}/lists/${listBId}/cards`,
            {
                method: 'GET',
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            }
        )

        expect([200].includes(listBCards.status)).toBeTruthy()
        const cards = listBCards.body?.cards || listBCards.body
        expect(Array.isArray(cards)).toBeTruthy()
        const firstCardId = cards[0]?.id || cards[0]?.id?.toString()
        expect(firstCardId?.toString()).toBe(c3Id?.toString())
    })

    test('TC19 — Chỉ định (Assign) thành viên chịu trách nhiệm xử lý một Thẻ công việc (Card) cụ thể', async () => {
        // Create owner + assignee user, then assign the assignee to a card
        const ownerEmail = `qa+card.owner.${ts}@example.com`
        const assigneeEmail = `qa+card.assignee.${ts}@example.com`

        await fixtures.createUser(ownerEmail, TEST_PASSWORD)
        await fixtures.createUser(assigneeEmail, TEST_PASSWORD)

        const login = await fixtures.login(ownerEmail, TEST_PASSWORD)
        const token = login.body?.token

        const ws = await fixtures.createWorkspace(token, { name: `ws-card-assign-${ts}` })
        const wsId = ws.body?.workspace?.id || ws.body?.id || 0
        const board = await fixtures.createBoard(token, wsId, { title: `Board Assign ${ts}` })
        const boardId = board.body?.board?.id || board.body?.id || 0
        const list = await fixtures.createList(token, boardId, { title: `List Assign ${ts}` })
        const listId = list.body?.list?.id || list.body?.id || 0

        const cardRes = await fixtures.createCard(token, listId, { title: `Card Assign ${ts}` })
        expect([201, 200].includes(cardRes.status)).toBeTruthy()
        const cardId = cardRes.body?.card?.id || cardRes.body?.id

        // Extract assignee id from registration response by creating user and reading body
        const assigneeReg = await fixtures.api('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email: assigneeEmail, password: TEST_PASSWORD, fullName: 'Assignee' }),
        })
        // If register returned existing user, check body.user
        const assigneeId = assigneeReg.body?.user?.id || assigneeReg.body?.id || undefined

        // For safety, coerce to string
        const assigneeIdStr = assigneeId?.toString ? assigneeId.toString() : assigneeId

        // Patch the card to set assigneeUserId
        const patchRes = await fixtures.api(
            `/api/workspaces/${wsId}/boards/${boardId}/lists/${listId}/cards/${cardId}`,
            {
                method: 'PATCH',
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                body: JSON.stringify({ assigneeUserId: assigneeIdStr }),
            }
        )

        expect([200].includes(patchRes.status)).toBeTruthy()
        const updatedCard = patchRes.body?.card || patchRes.body
        expect(updatedCard).toBeTruthy()
        // The API returns assigneeUserId as string or bigint-converted string
        expect(updatedCard.assigneeUserId?.toString()).toBe(assigneeIdStr?.toString())
    })
})
