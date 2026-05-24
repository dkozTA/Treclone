import { PrismaClient, User, Workspace, Board, List } from './generated/client/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { faker } from '@faker-js/faker'
import * as bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const NUM_ROWS = 100

async function clearDatabase() {
    await prisma.boardMember.deleteMany()
    await prisma.workspaceMember.deleteMany()
    await prisma.card.deleteMany()
    await prisma.list.deleteMany()
    await prisma.board.deleteMany()
    await prisma.refreshToken.deleteMany()
    await prisma.workspace.deleteMany()
    await prisma.user.deleteMany()
}

async function createUsers(count: number): Promise<User[]> {
    console.log('Creating users...')
    const users: User[] = []
    for (let i = 0; i < count; i++) {
        const user = await prisma.user.create({
            data: {
                email: faker.internet.email(),
                fullName: faker.person.fullName(),
                passwordHash: await bcrypt.hash(faker.string.alphanumeric(10), 10),
                emailVerifiedAt: new Date(),
            }
        })
        users.push(user)
    }
    return users
}

async function createWorkspaces(count: number, users: User[]): Promise<Workspace[]> {
    console.log('Creating workspaces...')
    const workspaces: Workspace[] = []
    for (let i = 0; i < count; i++) {
        const workspace = await prisma.workspace.create({
            data: {
                name: faker.commerce.department(),
                description: faker.lorem.paragraph(),
                visibility: faker.helpers.arrayElement(['private', 'team', 'public']),
                dailySummary: faker.datatype.boolean(),
                mentionAlerts: faker.datatype.boolean(),
                ownerId: faker.helpers.arrayElement(users).id,
            }
        })
        workspaces.push(workspace)
    }
    return workspaces
}

async function createBoards(count: number, users: User[], workspaces: Workspace[]): Promise<Board[]> {
    console.log('Creating boards...')
    const boards: Board[] = []
    for (let i = 0; i < count; i++) {
        const board = await prisma.board.create({
            data: {
                title: faker.word.words(3),
                description: faker.lorem.sentence(),
                ownerId: faker.helpers.arrayElement(users).id,
                workspaceId: faker.helpers.arrayElement(workspaces).id,
            }
        })
        boards.push(board)
    }
    return boards
}

async function createLists(count: number, boards: Board[]): Promise<List[]> {
    console.log('Creating lists...')
    const lists: List[] = []
    for (let i = 0; i < count; i++) {
        const list = await prisma.list.create({
            data: {
                boardId: faker.helpers.arrayElement(boards).id,
                title: faker.commerce.productAdjective(),
                position: i,
            }
        })
        lists.push(list)
    }
    return lists
}

async function createCards(count: number, lists: List[], users: User[]): Promise<void> {
    console.log('Creating cards...')
    for (let i = 0; i < count; i++) {
        await prisma.card.create({
            data: {
                listId: faker.helpers.arrayElement(lists).id,
                title: faker.word.words(2),
                description: faker.lorem.sentences(2),
                assigneeUserId: Math.random() > 0.3 ? faker.helpers.arrayElement(users).id : null,
                position: i,
                createdBy: faker.helpers.arrayElement(users).id,
            }
        })
    }
}

async function createMembersWithConstraintHandling(
    count: number,
    createFn: () => Promise<void>
): Promise<void> {
    for (let i = 0; i < count; i++) {
        try {
            await createFn()
        } catch (e) {
            if (!(e instanceof Error && e.message.includes('Unique constraint'))) {
                throw e
            }
        }
    }
}

async function createWorkspaceMembers(count: number, users: User[], workspaces: Workspace[]): Promise<void> {
    console.log('Creating workspace members...')
    await createMembersWithConstraintHandling(count, async () => {
        const userId = faker.helpers.arrayElement(users).id
        const workspaceId = faker.helpers.arrayElement(workspaces).id
        await prisma.workspaceMember.create({
            data: {
                userId,
                workspaceId,
                role: faker.helpers.arrayElement(['admin', 'member', 'viewer']),
            }
        })
    })
}

async function createBoardMembers(count: number, users: User[], boards: Board[]): Promise<void> {
    console.log('Creating board members...')
    await createMembersWithConstraintHandling(count, async () => {
        const userId = faker.helpers.arrayElement(users).id
        const boardId = faker.helpers.arrayElement(boards).id
        await prisma.boardMember.create({
            data: {
                userId,
                boardId,
                role: faker.helpers.arrayElement(['admin', 'member', 'viewer']),
            }
        })
    })
}

async function createRefreshTokens(count: number, users: User[]): Promise<void> {
    console.log('Creating refresh tokens...')
    for (let i = 0; i < count; i++) {
        await prisma.refreshToken.create({
            data: {
                userId: faker.helpers.arrayElement(users).id,
                token: faker.string.uuid(),
                expiresAt: faker.date.future(),
            }
        })
    }
}

async function main() {
    try {
        await clearDatabase()
        const users = await createUsers(NUM_ROWS)
        const workspaces = await createWorkspaces(NUM_ROWS, users)
        const boards = await createBoards(NUM_ROWS, users, workspaces)
        const lists = await createLists(NUM_ROWS, boards)
        await createCards(NUM_ROWS, lists, users)
        await createWorkspaceMembers(NUM_ROWS, users, workspaces)
        await createBoardMembers(NUM_ROWS, users, boards)
        await createRefreshTokens(NUM_ROWS, users)
        console.log('✅ Seeding completed successfully!')
    } catch (error) {
        console.error('❌ Error seeding database:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

main()
