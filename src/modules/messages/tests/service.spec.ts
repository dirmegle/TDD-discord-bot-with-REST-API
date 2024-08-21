import { Collection, GuildMember } from 'discord.js'
import {
  createMessageContent,
  findGuildMember,
  getGuildMembers,
} from '../service'

const guildMembersCacheMock = new Map([
  ['123', { id: '123', username: 'User1' }],
  ['456', { id: '456', username: 'User2' }],
])

const mocks = vi.hoisted(() => {
  const fetchMock = vi.fn()

  return {
    fetch: fetchMock,
    getGuilds: vi.fn((guildId: string) => {
      if (guildId === 'guildId') {
        return {
          members: {
            fetch: fetchMock,
            cache: guildMembersCacheMock,
          },
        }
      }
      return undefined
    }),
  }
})

vi.mock('@/modules/discordBot/bot', () => ({
  createClient: vitest.fn().mockReturnValue({
    guilds: {
      cache: {
        get: mocks.getGuilds,
      },
    },
  }),
}))

afterAll(() => {
  vi.clearAllMocks()
})

describe('getGuildMembers', () => {
  it('if id is provided, tries to fetch guild members', async () => {
    await getGuildMembers('guildId')
    expect(mocks.fetch).toHaveBeenCalledOnce()
  })

  it('returns an array of guild members', async () => {
    const users = await getGuildMembers('guildId')
    expect(users).toEqual(guildMembersCacheMock)
  })
  it('returns undefined if guild is not found', async () => {
    const users = await getGuildMembers('invalidGuildId')
    expect(users).toBeUndefined()
  })

  it('throws error if could not fetch guild members', async () => {
    mocks.getGuilds.mockImplementation(() => {
      throw new Error('Error fetching discord guild members')
    })
    const guildIdWithError = 'errorGuildId'

    await expect(getGuildMembers(guildIdWithError)).rejects.toThrow(
      'Error fetching discord guild members'
    )
  })
})

describe('findGuildMember', () => {
  const guildMembersMock = new Collection<string, GuildMember>([
    [
      '123',
      {
        user: { id: '123', displayName: 'User1' },
        roles: { cache: new Map() },
        bannable: false,
      } as GuildMember,
    ],
  ])
  it('should return the correct guild member by username', () => {
    const username = 'User1'
    const member = findGuildMember(username, guildMembersMock)
    expect(member).toBeDefined()
    expect(member?.user.id).toBe('123')
  })

  it('should return undefined if no guild member with the provided username is found', () => {
    const username = 'NonExistentUser'
    const member = findGuildMember(username, guildMembersMock)
    expect(member).toBeUndefined()
  })

  it('should return the correct guild member by username case-sensitively', () => {
    const username = 'user1'
    const member = findGuildMember(username, guildMembersMock)
    expect(member).toBeUndefined()
  })
})

describe('createMessage', () => {
  const message = {
    sprintId: 1,
    templateId: 1,
    username: 'abcdef',
  }

  const template = 'You did great, {username}, and completed {sprintName}!'

  const sprintName = 'Sprint name'

  it('returns correct message if user is guildMember', async () => {
    const guildMember = {
      user: { id: '123', displayName: message.username },
      roles: { cache: new Map() },
      bannable: false,
    } as GuildMember

    const content = await createMessageContent(
      message,
      template,
      sprintName,
      guildMember
    )

    expect(content).toEqual(
      `You did great, <@${guildMember.user.id}>, and completed ${sprintName}!`
    )
  })
  it('returns correct message if user is not a guild member', async () => {
    const guildMember = undefined

    const content = await createMessageContent(
      message,
      template,
      sprintName,
      guildMember
    )

    expect(content).toEqual(
      `You did great, ${message.username}, and completed ${sprintName}!`
    )
  })
})
