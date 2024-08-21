import { Selectable } from 'kysely'
import type { Template } from '@/database'
import BadRequest from '@/utils/errors/BadRequest'

type RequestBody = {
  username: string
  sprintCode: string
  templateId?: number | undefined
}

export const getTemplateId = async (
  body: RequestBody,
  getRandomTemplateId: Promise<Selectable<Pick<Template, 'id'>> | undefined>
) => {
  if (body.templateId) {
    return body.templateId
  }

  const result = await getRandomTemplateId

  if (!result) {
    throw new BadRequest('No template available')
  }
  return result?.id as number
}

export const getChannelId = (code: string): string => {
  const programID = code.slice(0, 2)
  let channelId
  switch (programID) {
    case 'WD':
      channelId = process.env.WD_CHANNEL_ID
      break
    case 'DA':
      channelId = process.env.DA_CHANNEL_ID
      break
    case 'DS':
      channelId = process.env.DS_CHANNEL_ID
      break
    case 'DE':
      channelId = process.env.DE_CHANNEL_ID
      break
    default:
      channelId = process.env.GENERAL_CHANNEL_ID
  }

  return channelId as string
}

export const getRandomInt = (min: number, max: number) => {
  const minCeiled = Math.ceil(min)
  const maxFloored = Math.floor(max)
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled)
}
