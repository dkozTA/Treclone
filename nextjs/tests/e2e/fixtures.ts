/*
 * Minimal E2E fixture helpers for API-driven setup.
 * These helpers are intentionally small and synchronous-friendly; expand as needed.
 */
const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000'

async function api(path: string, opts: RequestInit = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: { 'Content-Type': 'application/json', ...(opts.headers) },
        ...opts,
    })

    const text = await res.text()

    // collect headers into a plain object for tests to inspect (e.g., Set-Cookie)
    const headers: Record<string, string | null> = {}
    res.headers.forEach((value, key) => {
        headers[key] = value
    })

    try {
        return { status: res.status, body: JSON.parse(text || '{}'), raw: text, headers }
    } catch {
        return { status: res.status, body: text, headers }
    }
}

export async function createUser(email: string, password: string, fullName = 'QA User') {
    return api('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, fullName }),
    })
}

export async function login(email: string, password: string) {
    return api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    })
}

export async function createWorkspace(token: string | undefined, data: { name: string; description?: string }) {
    return api('/api/workspaces', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: JSON.stringify(data),
    })
}

export async function createBoard(token: string | undefined, workspaceId: number | string, data: { title: string; description?: string }) {
    return api(`/api/workspaces/${workspaceId}/boards`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: JSON.stringify(data),
    })
}

export async function createList(token: string | undefined, boardId: number | string, data: { title: string }) {
    return api(`/api/boards/${boardId}/lists`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: JSON.stringify(data),
    })
}

export async function createCard(token: string | undefined, listId: number | string, data: { title: string }) {
    return api(`/api/lists/${listId}/cards`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: JSON.stringify(data),
    })
}

const fixtures = {
    BASE_URL,
    api,
    createUser,
    login,
    createWorkspace,
    createBoard,
    createList,
    createCard,
}

export default fixtures
