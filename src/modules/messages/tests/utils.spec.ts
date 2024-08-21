import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest'
import createTestDatabase from '@tests/utils/createTestDatabase'
import { createFor } from '@tests/utils/records'
import { getChannelId, getRandomInt, getTemplateId } from '../utils'
import BadRequest from '@/utils/errors/BadRequest'

describe('getTemplateId', async () => {
  const db = await createTestDatabase()
  const createTemplates = createFor(db, 'template')

  afterEach(async () => {
    await db.deleteFrom('template').execute()
  })
  afterAll(() => db.destroy())

  it('returns id if provided in the body', async () => {
    const body = {
      sprintCode: 'WD-1.1',
      username: 'abcdef',
      templateId: 1,
    }
    const getRandomTemplateId = Promise.resolve(undefined)
    const result = await getTemplateId(body, getRandomTemplateId)
    expect(result).toBe(body.templateId)
  })

  it('returns a random id from existing templates if templateId in body is undefined', async () => {
    await createTemplates([
      {
        id: 1,
        message: "Hey {username}, you've completed {sprintName}. Good job!",
      },
      {
        id: 2,
        message:
          "Nice one, {username}, you've finished {sprintName}. Good job!",
      },
    ])
    const body = {
      sprintCode: 'WD-1.1',
      username: 'abcdef',
    }
    const getRandomTemplateId = Promise.resolve({ id: 2 })
    const result = await getTemplateId(body, getRandomTemplateId)
    expect(result).toBe(2)
  })

  it('throws error if no template is found', async () => {
    const body = {
      sprintCode: 'WD-1.1',
      username: 'abcdef',
    }
    const getRandomTemplateId = Promise.resolve(undefined)
    await expect(getTemplateId(body, getRandomTemplateId)).rejects.toThrow(
      BadRequest
    )
  })
})

describe('getChannelId', () => {
  const ORIGINAL_ENV = process.env
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  afterEach(() => {
    process.env = ORIGINAL_ENV
  })

  it('returns default channel id if none of the program codes match', () => {
    process.env.GENERAL_CHANNEL_ID = '123'
    const channelId = getChannelId('AB-1.1')
    expect(channelId).toEqual('123')
  })

  it('returns id for web development channel if sprint matches WD code', () => {
    process.env.WD_CHANNEL_ID = '123'
    const channelId = getChannelId('WD-1.1')
    expect(channelId).toEqual('123')
  })

  it('returns id for data analytics channel if sprint matches DA code', () => {
    process.env.DA_CHANNEL_ID = '123'
    const channelId = getChannelId('DA-1.1')
    expect(channelId).toEqual('123')
  })
  it('returns id for data science channel if sprint matches DS code', () => {
    process.env.DS_CHANNEL_ID = '123'
    const channelId = getChannelId('DS-1.1')
    expect(channelId).toEqual('123')
  })
  it('returns id for data engineering channel if sprint matches DE code', () => {
    process.env.DE_CHANNEL_ID = '123'
    const channelId = getChannelId('DE-1.1')
    expect(channelId).toEqual('123')
  })
})

describe('getRandomInt', () => {
  it('returns integer in the specified range', () => {
    const randomInt = getRandomInt(1, 10)

    expect(randomInt).toBeLessThanOrEqual(10)
    expect(randomInt).toBeGreaterThanOrEqual(1)
  })
})
