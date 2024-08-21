import { createFor, selectAllFor } from '@tests/utils/records'
import createTestDatabase from '@tests/utils/createTestDatabase'
import {
  fakeMessage,
  fakeSprintPlaceholder,
  fakeTemplatePlaceholder,
  messageMatcher,
} from './utils'
import buildRepository from '../repository'

const db = await createTestDatabase()
const repository = buildRepository(db)
const createMessages = createFor(db, 'message')
const createSprints = createFor(db, 'sprint')
const createTemplates = createFor(db, 'template')
const selectMessages = selectAllFor(db, 'message')

afterAll(() => db.destroy())

afterEach(async () => {
  await db.deleteFrom('message').execute()
  await db.deleteFrom('sprint').execute()
  await db.deleteFrom('template').execute()
})

describe('findAll', async () => {
  it('returns an array of messages', async () => {
    const [sprint] = await createSprints([fakeSprintPlaceholder])
    const [template] = await createTemplates([fakeTemplatePlaceholder])
    const [message] = await createMessages([
      fakeMessage({ sprintId: sprint.id, templateId: template.id }),
    ])
    expect(await repository.findAll()).toEqual([
      {
        username: message.username,
        sprintCode: sprint.sprintCode,
        templateId: template.id,
      },
    ])
  })

  it('returns empty array if there are no messages', async () => {
    const messages = await repository.findAll()
    expect(messages).toEqual([])
  })
})

describe('findAllBySprintCode', () => {
  it('returns an array of messages by code', async () => {
    const [sprint] = await createSprints([fakeSprintPlaceholder])
    const [template] = await createTemplates([fakeTemplatePlaceholder])
    const [message] = await createMessages([
      fakeMessage({ sprintId: sprint.id, templateId: template.id }),
    ])

    expect(await repository.findAllBySprintCode(sprint.sprintCode)).toEqual([
      {
        username: message.username,
        sprintCode: sprint.sprintCode,
        templateId: template.id,
      },
    ])
  })
  it('returns empty array if there are no messages', async () => {
    const messages = await repository.findAllBySprintCode('WD-1.1')
    expect(messages).toEqual([])
  })
})

describe('findAllByUsername', () => {
  it('returns an array of messages by username', async () => {
    const [sprint] = await createSprints([fakeSprintPlaceholder])
    const [template] = await createTemplates([fakeTemplatePlaceholder])
    const [message] = await createMessages([
      fakeMessage({ sprintId: sprint.id, templateId: template.id }),
    ])

    expect(await repository.findAllByUsername(message.username)).toEqual([
      {
        username: message.username,
        sprintCode: sprint.sprintCode,
        templateId: template.id,
      },
    ])
  })
  it('returns empty array if there are no messages', async () => {
    const messages = await repository.findAllByUsername('abcdef')
    expect(messages).toEqual([])
  })
})

describe('findSprintIdByCode', () => {
  it('returns sprint id if sprint exists', async () => {
    const [sprint] = await createSprints([fakeSprintPlaceholder])
    const sprintId = await repository.findSprintIdByCode(sprint.sprintCode)
    expect(sprintId?.id).toEqual(sprint.id)
  })
  it('returns undefined if sprint does not exist', async () => {
    expect(await repository.findSprintIdByCode('AB-1.1')).toBeUndefined()
  })
})

describe('findTemplateById', () => {
  it('returns template message if template exists', async () => {
    const [template] = await createTemplates([fakeTemplatePlaceholder])
    const templateMessage = await repository.findTemplateById(template.id)
    expect(templateMessage?.message).toEqual(template.message)
  })
  it('returns undefined if message does not exist', async () => {
    expect(await repository.findSprintIdByCode('AB-1.1')).toBeUndefined()
  })
})

describe('getRandomTemplateId', () => {
  it('returns a random selection from template table', async () => {
    await createTemplates([
      fakeTemplatePlaceholder,
      { id: 2, message: 'Congrats, {username}! You finished {sprintTitle}' },
    ])

    const result = await repository.getRandomTemplateId()

    if (result) {
      const { id } = result
      expect(id).toBeTypeOf('number')
    }
  })
})

describe('findBySprintIdAndUsername', () => {
  it('returns message if both sprintId and username match', async () => {
    const [sprint] = await createSprints([fakeSprintPlaceholder])
    const [template] = await createTemplates([fakeTemplatePlaceholder])
    const [message] = await createMessages([
      fakeMessage({ sprintId: sprint.id, templateId: template.id }),
    ])
    expect(
      await repository.findBySprintIdAndUsername(
        message.sprintId,
        message.username
      )
    ).toEqual(message)
  })
  it('returns undefined if there are no messages', async () => {
    expect(
      await repository.findBySprintIdAndUsername(3, 'abcdef')
    ).toBeUndefined()
  })
})

describe('create', () => {
  it('creates a new row in message table', async () => {
    const [sprint] = await createSprints([fakeSprintPlaceholder])
    const [template] = await createTemplates([fakeTemplatePlaceholder])
    const message = await repository.create(
      fakeMessage({ sprintId: sprint.id, templateId: template.id })
    )
    expect(message).toEqual(
      messageMatcher({ sprintId: sprint.id, templateId: template.id })
    )

    const sprintsInDatabase = await selectMessages()
    expect(sprintsInDatabase).toHaveLength(1)
    expect(sprintsInDatabase).toEqual([message])
  })
})
