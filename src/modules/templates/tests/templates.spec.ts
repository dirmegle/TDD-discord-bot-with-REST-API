import supertest from 'supertest'
import createTestDatabase from '@tests/utils/createTestDatabase'
import { createFor, selectAllFor } from '@tests/utils/records'
import { omit } from 'lodash'
import {
  fakeTemplateFull,
  fakeTemplatePartial,
  fakeTemplatePlaceholder,
  templateMatcher,
} from './utils'
import createApp from '@/app'

const db = await createTestDatabase()
const app = createApp(db)
const createTemplates = createFor(db, 'template')
const selectTemplates = selectAllFor(db, 'template')

afterEach(async () => {
  await db.deleteFrom('template').execute()
})

afterAll(() => db.destroy())

describe('GET', () => {
  it('returns an empty array when there are no templates in the database', async () => {
    const { body } = await supertest(app).get('/templates').expect(200)
    expect(body).toEqual([])
  })

  it('returns array of existing templates', async () => {
    await createTemplates([
      fakeTemplateFull(),
      fakeTemplateFull(fakeTemplatePlaceholder),
    ])
    const { body } = await supertest(app).get('/templates').expect(200)

    expect(body).toEqual([
      templateMatcher(),
      templateMatcher(fakeTemplatePlaceholder),
    ])
  })
})

describe('POST', () => {
  it('adds a new row to table', async () => {
    const { body } = await supertest(app)
      .post('/templates')
      .send(fakeTemplatePartial())
      .expect(201)

    expect(body).toEqual(templateMatcher())
  })

  it('returns error if request body is missing message', async () => {
    const { body } = await supertest(app)
      .post('/templates')
      .send(omit(fakeTemplatePartial({}), ['message']))
      .expect(400)

    expect(body.error.message).toMatch(/message/i)
  })
  it('returns error if message is empty', async () => {
    const { body } = await supertest(app)
      .post('/templates')
      .send(fakeTemplatePartial({ message: '' }))
      .expect(400)

    expect(body.error.message).toMatch(/message/i)
  })

  // it('returns 400 error if body contains several keys named message', async () => {
  //   const jsonWithDuplicateKeys =
  //     '{"message": "Message no. 1", "message": "Message no. 2"}'
  //   const { body } = await supertest(app)
  //     .post('/templates')
  //     .send(jsonWithDuplicateKeys)
  //     .expect(400)

  //   expect(body.error.message).toMatch(/message/i)
  // })
  it('returns 400 error if message already exists in the database', async () => {
    const [template] = await createTemplates([fakeTemplateFull()])
    const { body } = await supertest(app)
      .post('/templates')
      .send({ message: template.message })
      .expect(400)
    expect(body.error.message).toMatch(/exists/i)
  })
})

describe('GET/id', () => {
  it('should return template if the template with the id exists', async () => {
    const [template] = await createTemplates([fakeTemplateFull()])
    const { body } = await supertest(app)
      .get(`/templates/${template.id}`)
      .expect(200)
    expect(body).toEqual(templateMatcher(template))
  })

  it('should return 404 if template does not exist', async () => {
    const { body } = await supertest(app).get('/templates/99999').expect(404)

    expect(body.error.message).toMatch(/exist/i)
  })
})

describe('PATCH/:id', () => {
  it('updates the row with new data if template with id exists', async () => {
    const [template] = await createTemplates([fakeTemplateFull()])

    const { body } = await supertest(app)
      .patch(`/templates/${template.id}`)
      .send({ message: 'Updated about {username} for {sprintName}!' })
      .expect(200)

    expect(body).toEqual(
      templateMatcher({
        id: template.id,
        message: 'Updated about {username} for {sprintName}!',
      })
    )
  })

  it('returns 404 error if template with id does not exist', async () => {
    const { body } = await supertest(app)
      .patch('/templates/99999')
      .send({ message: 'Updated about {username} for {sprintName}!' })
      .expect(404)
    expect(body.error.message).toMatch(/exist/i)
  })

  it('returns error if the message in request is missing', async () => {
    const [template] = await createTemplates([fakeTemplateFull()])
    const { body } = await supertest(app)
      .patch(`/templates/${template.id}`)
      .expect(400)
    expect(body.error.message).toMatch(/message/i)
  })

  it('returns error if message in request is empty', async () => {
    const [template] = await createTemplates([fakeTemplateFull()])
    const { body } = await supertest(app)
      .patch(`/templates/${template.id}`)
      .send({ message: '' })
      .expect(400)
    expect(body.error.message).toMatch(/message/i)
  })
  // it('returns 400 error if body contains several keys named message', async () => {
  //   const [template] = await createTemplates([fakeTemplateFull()])
  //   const jsonWithDuplicateKeys =
  //     '{"message": "Message no. 1", "message": "Message no. 2"}'
  //   const { body } = await supertest(app)
  //     .patch(`/templates/${template.id}`)
  //     .send(jsonWithDuplicateKeys)
  //     .expect(400)

  //   expect(body.error.message).toMatch(/message/i)
  // })
  it('returns 400 error if message already exists in the database', async () => {
    const [template] = await createTemplates([fakeTemplateFull()])
    const { body } = await supertest(app)
      .patch(`/templates/${template.id}`)
      .send({ message: template.message })
      .expect(400)
    expect(body.error.message).toMatch(/exists/i)
  })
})

describe('DELETE/:id', () => {
  it('deletes the row if template exists and sends 204', async () => {
    const templates = await createTemplates([
      fakeTemplateFull(),
      fakeTemplateFull(fakeTemplatePlaceholder),
    ])

    await supertest(app).delete(`/templates/${templates[0].id}`).expect(204)

    const templatesAfterDeletion = await selectTemplates()

    expect(templatesAfterDeletion).toHaveLength(1)
  })
  it('returns error if the template does not exist', async () => {
    const { body } = await supertest(app).delete('/templates/99999').expect(404)
    expect(body.error.message).toMatch(/exist/i)
  })
})
