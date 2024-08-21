import createTestDatabase from '@tests/utils/createTestDatabase'
import supertest from 'supertest'
import { createFor } from '@tests/utils/records'
import {
  fakeMessage,
  fakeRequestedMessagePlaceholder,
  fakeSprintPlaceholder,
  fakeTemplatePlaceholder,
  messageMatcher,
} from './utils'
import createApp from '@/app'
import * as service from '../service'

const db = await createTestDatabase()
const app = createApp(db)
const createMessages = createFor(db, 'message')
const createSprints = createFor(db, 'sprint')
const createTemplates = createFor(db, 'template')

afterEach(async () => {
  await db.deleteFrom('message').execute()
  await db.deleteFrom('sprint').execute()
  await db.deleteFrom('template').execute()
})
afterAll(() => db.destroy())

describe('GET', () => {
  it('returns an empty array if there are no congratulatory messages', async () => {
    const { body } = await supertest(app).get('/messages').expect(200)
    expect(body).toEqual([])
  })
  it('returns an array of congratulatory messages', async () => {
    const [sprint] = await createSprints([fakeSprintPlaceholder])
    const [template] = await createTemplates([fakeTemplatePlaceholder])
    const [message] = await createMessages([
      fakeMessage({ sprintId: sprint.id, templateId: template.id }),
    ])
    const { body } = await supertest(app).get('/messages').expect(200)
    expect(body).toEqual([
      {
        sprintCode: sprint.sprintCode,
        templateId: template.id,
        username: message.username,
      },
    ])
  })
})

describe('GET?username={username}', () => {
  it('returns an array of congratulatory messages for a user', async () => {
    const [sprint] = await createSprints([fakeSprintPlaceholder])
    const [template] = await createTemplates([fakeTemplatePlaceholder])
    const [message] = await createMessages([
      fakeMessage({ sprintId: sprint.id, templateId: template.id }),
    ])
    const { body } = await supertest(app)
      .get(`/messages?username=${message.username}`)
      .expect(200)
    expect(body).toEqual([
      {
        sprintCode: sprint.sprintCode,
        templateId: template.id,
        username: message.username,
      },
    ])
  })
  it('returns an empty array if there are no messages for the user', async () => {
    const { body } = await supertest(app)
      .get('/messages?username=abcdef')
      .expect(200)
    expect(body).toEqual([])
  })
})

describe('GET?sprint={sprint}', () => {
  it('returns an array of congratulatory messages for a sprint', async () => {
    const [sprint] = await createSprints([fakeSprintPlaceholder])
    const [template] = await createTemplates([fakeTemplatePlaceholder])
    const [message] = await createMessages([
      fakeMessage({ sprintId: sprint.id, templateId: template.id }),
    ])
    const { body } = await supertest(app)
      .get(`/messages?sprint=${sprint.sprintCode}`)
      .expect(200)
    expect(body).toEqual([
      {
        sprintCode: sprint.sprintCode,
        templateId: template.id,
        username: message.username,
      },
    ])
  })
  it('returns an empty array if there are no messages for the sprint', async () => {
    const { body } = await supertest(app)
      .get('/messages?sprint=WD-2.2')
      .expect(200)
    expect(body).toEqual([])
  })
})

describe('POST', () => {
  it('adds a new row to the table', async () => {
    await createSprints([fakeSprintPlaceholder])
    await createTemplates([fakeTemplatePlaceholder])
    const { body } = await supertest(app)
      .post('/messages')
      .send(fakeRequestedMessagePlaceholder)
      .expect(201)
    expect(body).toEqual(messageMatcher())
  })
  it('throws Bad Request if sprint by code is not found', async () => {
    await createSprints([fakeSprintPlaceholder])
    const { body } = await supertest(app)
      .post('/messages')
      .send(fakeRequestedMessagePlaceholder)
      .expect(400)

    expect(body.error.message).toMatch(/exist/i)
  })
  it('throws Bad Request if template with id does not exist', async () => {
    const { body } = await supertest(app)
      .post('/messages')
      .send(fakeRequestedMessagePlaceholder)
      .expect(400)

    expect(body.error.message).toMatch(/exist/i)
  })
  it('calls postMessageToDiscord method', async () => {
    const postMessage = vi.spyOn(service, 'default')

    await createSprints([fakeSprintPlaceholder])
    await createTemplates([fakeTemplatePlaceholder])

    await supertest(app)
      .post('/messages')
      .send(fakeRequestedMessagePlaceholder)
      .expect(201)
    expect(postMessage).toHaveBeenCalled()
  })
  it('returns 400 error if sprintCode is missing', async () => {
    const { body } = await supertest(app)
      .post('/messages')
      .send({ templateId: 2, username: 'abcdef' })
      .expect(400)
    expect(body.error.message).toMatch(/sprintCode/i)
  })
  it('returns 400 error if username is missing', async () => {
    const { body } = await supertest(app)
      .post('/messages')
      .send({ sprintId: 2, templateId: 3 })
      .expect(400)
    expect(body.error.message).toMatch(/username/i)
  })
  it('returns 400 error if message for sprint and user exists in the database', async () => {
    const [sprint] = await createSprints([fakeSprintPlaceholder])
    const [template] = await createTemplates([fakeTemplatePlaceholder])
    const [existingMessage] = await createMessages([
      fakeMessage({ sprintId: sprint.id, templateId: template.id }),
    ])

    const { body } = await supertest(app)
      .post('/messages')
      .send({
        username: existingMessage.username,
        sprintCode: sprint.sprintCode,
        templateId: 4,
      })
      .expect(400)
    expect(body.error.message).toMatch(/exists/i)
  })
})
