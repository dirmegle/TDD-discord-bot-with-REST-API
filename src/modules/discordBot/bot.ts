import { Client, GatewayIntentBits } from 'discord.js'

export const createClient = () => {
  const localClient = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
    ],
  })

  try {
    localClient.login(process.env.DISCORD_BOT_ID)
  } catch (error) {
    throw new Error('Could not connect to Discord server')
  }

  return localClient
}
