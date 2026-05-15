import { PrismaClient, User, Workspace, Board, List } from './generated/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { faker } from '@faker-js/faker'
import * as bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const NUM_ROWS = 100

async function main() {
    try {
        await prisma.boardMember.deleteMany()
        await prisma.workspaceMember.deleteMany()
        await prisma.card.deleteMany()
        await prisma.list.deleteMany()
        await prisma.board.deleteMany()
        await prisma.refreshToken.deleteMany()
        await prisma.workspace.deleteMany()
        await prisma.user.deleteMany()

        console.log('Creating users...')
        const users: User[] = []
        for (let i = 0; i < NUM_ROWS; i++) {
            const user = await prisma.user.create({
                data: {
                    email: faker.internet.email(),
                    fullName: faker.person.fullName(),
                    passwordHash: await bcrypt.hash(faker.string.alphanumeric(10), 10),
                }
            })
            users.push(user)
        }

        console.log('Creating workspaces...')
        const workspaces: Workspace[] = []
        for (let i = 0; i < NUM_ROWS; i++) {
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

        console.log('Creating boards...')
        const boards: Board[] = []
        for (let i = 0; i < NUM_ROWS; i++) {
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

        console.log('Creating lists...')
        const lists: List[] = []
        for (let i = 0; i < NUM_ROWS; i++) {
            const list = await prisma.list.create({
                data: {
                    boardId: faker.helpers.arrayElement(boards).id,
                    title: faker.commerce.productAdjective(),
                    position: i,
                }
            })
            lists.push(list)
        }

        console.log('Creating cards...')
        for (let i = 0; i < NUM_ROWS; i++) {
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

        console.log('Creating workspace members...')
        for (let i = 0; i < NUM_ROWS; i++) {
            const userId = faker.helpers.arrayElement(users).id
            const workspaceId = faker.helpers.arrayElement(workspaces).id

            // Avoid duplicate unique constraints
            try {
                await prisma.workspaceMember.create({
                    data: {
                        userId,
                        workspaceId,
                        role: faker.helpers.arrayElement(['admin', 'member', 'viewer']),
                    }
                })
            } catch (e) {
                // Skip if unique constraint violated
            }
        }

        console.log('Creating board members...')
        for (let i = 0; i < NUM_ROWS; i++) {
            const userId = faker.helpers.arrayElement(users).id
            const boardId = faker.helpers.arrayElement(boards).id

            try {
                await prisma.boardMember.create({
                    data: {
                        userId,
                        boardId,
                        role: faker.helpers.arrayElement(['admin', 'member', 'viewer']),
                    }
                })
            } catch (e) {
                // Skip if unique constraint violated
            }
        }

        console.log('Creating refresh tokens...')
        for (let i = 0; i < NUM_ROWS; i++) {
            await prisma.refreshToken.create({
                data: {
                    userId: faker.helpers.arrayElement(users).id,
                    token: faker.string.uuid(),
                    expiresAt: faker.date.future(),
                }
            })
        }

        console.log('✅ Seeding completed successfully!')
    } catch (error) {
        console.error('❌ Error seeding database:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

main()