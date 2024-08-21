import { Collection, GuildMember, TextChannel } from 'discord.js'
import { GiphyFetch } from '@giphy/js-fetch-api'
import { createClient } from '../discordBot/bot'
import type { Message, Sprint } from '@/database'
import { getChannelId, getRandomInt } from './utils'

const client = createClient()

export const getGuildMembers = async (guildId: string) => {
  let users
  try {
    const guild = client.guilds.cache.get(guildId)
    if (guild) {
      await guild.members.fetch()
      users = guild.members.cache
    }
  } catch (error) {
    throw new Error('Error fetching discord guild members')
  }
  return users
}

export const findGuildMember = (
  username: string,
  users: Collection<string, GuildMember>
) => users?.find((member) => member.user.displayName === username)

export const getGifUrl = async () => {
  const gf = new GiphyFetch(process.env.GIPHY_API_KEY as string)
  const { data } = await gf.search('congratulations', {
    type: 'gifs',
    offset: getRandomInt(1, 2000),
  })

  const [gif] = data

  return gif.images.original.url
}

export const createMessageContent = async (
  message: Message,
  template: string,
  sprintName: string,
  guildMember: GuildMember | undefined
) => {
  let userToMention = message.username

  if (guildMember) {
    userToMention = `<@${guildMember.user.id}>`
  }

  const content = template
    .replace('{username}', userToMention)
    .replace('{sprintName}', sprintName)

  return content
}

const postMessageToDiscord = async (
  message: Message,
  template: string,
  sprint: Sprint
) => {
  try {
    const users = await getGuildMembers(process.env.DISCORD_GUILD_ID as string)
    const guildMember = findGuildMember(message.username, users!)
    const gifUrl = await getGifUrl()
    const messageContent = await createMessageContent(
      message,
      template,
      sprint.name,
      guildMember
    )
    const channelId = getChannelId(sprint.sprintCode)

    const channel = client.channels.cache.get(channelId) as TextChannel
    channel.send(messageContent)
    channel.send({ files: [gifUrl] })
  } catch (error) {
    throw new Error('Could not send message to Discord')
  }
}

export default postMessageToDiscord
