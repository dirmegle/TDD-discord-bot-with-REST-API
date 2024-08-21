import createTestDatabase from '@tests/utils/createTestDatabase'
import { createFor, selectAllFor } from '@tests/utils/records'
import supertest from 'supertest'
import { omit } from 'lodash'
import createApp from '@/app'
import { fakeSprint, sprintMatcher } from './utils'

const db = await createTestDatabase()
const app = createApp(db)
const createSprints = createFor(db, 'sprint')
const selectSprints = selectAllFor(db, 'sprint')

afterEach(async () => {
  await db.deleteFrom('sprint').execute()
})

afterAll(() => db.destroy())

describe('GET', () => {
  it('returns an empty array when there are no sprints in the database', async () => {
    const { body } = await supertest(app).get('/sprints').expect(200)
    expect(body).toEqual([])
  })

  it('returns array of existing sprints', async () => {
    await createSprints([fakeSprint()])
    const { body } = await supertest(app).get('/sprints').expect(200)

    expect(body).toEqual([sprintMatcher()])
  })
})

describe('POST', () => {
  it('adds a new row to the table', async () => {
    const { body } = await supertest(app)
      .post('/sprints')
      .send(fakeSprint())
      .expect(201)
    expect(body).toEqual(sprintMatcher({ id: 2 }))
  })
  it('returns error if sprint name is empty', async () => {
    const { body } = await supertest(app)
      .post('/sprints')
      .send(fakeSprint({ name: '' }))
      .expect(400)

    expect(body.error.message).toMatch(/name/i)
  })
  it('returns error if sprint code is empty', async () => {
    const { body } = await supertest(app)
      .post('/sprints')
      .send(fakeSprint({ sprintCode: '' }))
      .expect(400)

    expect(body.error.message).toMatch(/sprintCode/i)
  })
  it('returns error if sprint name is missing', async () => {
    const { body } = await supertest(app)
      .post('/sprints')
      .send(omit(fakeSprint({}), ['name']))
      .expect(400)

    expect(body.error.message).toMatch(/name/i)
  })
  it('returns error if sprint code is missing', async () => {
    const { body } = await supertest(app)
      .post('/sprints')
      .send(omit(fakeSprint({}), ['sprintCode']))
      .expect(400)

    expect(body.error.message).toMatch(/sprintCode/i)
  })
  it('returns 400 error if sprint code already exists in the database', async () => {
    const [sprint] = await createSprints([fakeSprint()])
    const { body } = await supertest(app)
      .post('/sprints')
      .send({ sprintCode: sprint.sprintCode, name: 'Some name' })
      .expect(400)
    expect(body.error.message).toMatch(/exists/i)
  })
})

describe('GET/id', () => {
  it('should return sprint if the sprint with the id exists', async () => {
    const [sprint] = await createSprints([fakeSprint()])
    const { body } = await supertest(app)
      .get(`/sprints/${sprint.id}`)
      .expect(200)
    expect(body).toEqual(sprintMatcher())
  })

  it('should return 404 if sprint does not exist', async () => {
    const { body } = await supertest(app).get('/sprints/99999').expect(404)
    expect(body.error.message).toMatch(/exist/i)
  })
})

describe('PATCH/:id', () => {
  it('updates the entire row with new data if sprint with id exists', async () => {
    const [sprint] = await createSprints([fakeSprint()])

    const { body } = await supertest(app)
      .patch(`/sprints/${sprint.id}`)
      .send({ sprintCode: 'WD-2.2', name: 'New name' })
      .expect(200)

    expect(body).toEqual(
      sprintMatcher({ sprintCode: 'WD-2.2', name: 'New name' })
    )
  })

  it('updates sprint code with new data if sprint with id exists', async () => {
    const [sprint] = await createSprints([fakeSprint()])

    const { body } = await supertest(app)
      .patch(`/sprints/${sprint.id}`)
      .send({ sprintCode: 'WD-2.2' })
      .expect(200)

    expect(body).toEqual(sprintMatcher({ sprintCode: 'WD-2.2' }))
  })

  it('updates sprint name with new data if sprint with id exists', async () => {
    const [sprint] = await createSprints([fakeSprint()])

    const { body } = await supertest(app)
      .patch(`/sprints/${sprint.id}`)
      .send({ name: 'New name' })
      .expect(200)

    expect(body).toEqual(sprintMatcher({ name: 'New name' }))
  })

  it('returns 404 error if sprint with id does not exist', async () => {
    const { body } = await supertest(app)
      .patch('/sprints/99999')
      .send({ sprintCode: 'AB-1.1', name: 'New name' })
      .expect(404)
    expect(body.error.message).toMatch(/exist/i)
  })

  it('returns error if name in request is empty', async () => {
    const [sprint] = await createSprints([fakeSprint()])
    const { body } = await supertest(app)
      .patch(`/sprints/${sprint.id}`)
      .send({ name: '' })
      .expect(400)
    expect(body.error.message).toMatch(/name/i)
  })

  it('returns error if code in request is empty', async () => {
    const [sprint] = await createSprints([fakeSprint()])
    const { body } = await supertest(app)
      .patch(`/sprints/${sprint.id}`)
      .send({ sprintCode: '' })
      .expect(400)
    expect(body.error.message).toMatch(/sprintCode/i)
  })

  it('returns 400 error if sprint code already exists in the database', async () => {
    const [sprint] = await createSprints([fakeSprint()])
    const { body } = await supertest(app)
      .patch(`/sprints/${sprint.id}`)
      .send({ sprintCode: sprint.sprintCode })
      .expect(400)
    expect(body.error.message).toMatch(/exists/i)
  })
})

describe('DELETE:id', () => {
  it('deletes the row if sprint exists and returns 204', async () => {
    const [sprint] = await createSprints([fakeSprint()])
    await supertest(app).delete(`/sprints/${sprint.id}`).expect(204)
    const sprintsAfterDeletion = await selectSprints()
    expect(sprintsAfterDeletion).toHaveLength(0)
  })
  it('returns error if the sprint does not exist', async () => {
    const { body } = await supertest(app).delete('/sprints/99999').expect(404)
    expect(body.error.message).toMatch(/exist/i)
  })
})
