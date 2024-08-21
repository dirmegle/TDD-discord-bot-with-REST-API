import createTestDatabase from '@tests/utils/createTestDatabase'
import { createFor, selectAllFor } from '@tests/utils/records'
import buildRepository from '../repository'
import { fakeSprint, fakeSprintPlaceholder, sprintMatcher } from './utils'

const db = await createTestDatabase()
const repository = buildRepository(db)
const createSprints = createFor(db, 'sprint')
const selectSprints = selectAllFor(db, 'sprint')

afterAll(() => db.destroy())

afterEach(async () => {
  await db.deleteFrom('sprint').execute()
})

describe('findAll', () => {
  it('returns all sprints', async () => {
    await createSprints([fakeSprint()])
    const sprints = await repository.findAll()

    expect(sprints).toHaveLength(1)
    expect(sprints[0]).toEqual(sprintMatcher())
  })

  it('returns empty array if there are no sprints', async () => {
    const sprints = await repository.findAll()
    expect(sprints).toEqual([])
  })
})

describe('findById', () => {
  it('returns one sprint based on ID', async () => {
    const [sprint] = await createSprints([fakeSprint()])
    const foundSprint = await repository.findById(sprint.id)
    expect(foundSprint).toEqual(sprintMatcher(sprint))
  })
  it('returns undefined if the sprint does not exist', async () => {
    const foundSprint = await repository.findById(99999999)
    expect(foundSprint).toBeUndefined()
  })
})

describe('findByCode', () => {
  it('returns one sprint based on code', async () => {
    const [sprint] = await createSprints([fakeSprint()])
    const foundSprint = await repository.findByCode(sprint.sprintCode)
    expect(foundSprint).toEqual(sprintMatcher())
  })
  it('returns undefined if sprint does not exist', async () => {
    const foundSprint = await repository.findByCode('AB-1.1')
    expect(foundSprint).toBeUndefined()
  })
})

describe('create', () => {
  it('creates a new row in sprint table', async () => {
    const sprint = await repository.create(fakeSprint())
    expect(sprint).toEqual(sprintMatcher())

    const sprintsInDatabase = await selectSprints()
    expect(sprintsInDatabase).toHaveLength(1)
    expect(sprintsInDatabase).toEqual([sprint])
  })
})
describe('update', () => {
  it('updates a line - changes both name and code', async () => {
    const [sprint] = await createSprints([fakeSprint()])
    const body = {
      sprintCode: 'WD-1.2',
      name: 'Updated sprint name',
    }
    const updatedSprint = await repository.update(sprint.id, body)

    expect(updatedSprint).toEqual(sprintMatcher(body))
  })
  it('updates a line - changes name', async () => {
    const [sprint] = await createSprints([fakeSprint()])
    const body = {
      name: 'Updated sprint name',
    }
    const updatedSprint = await repository.update(sprint.id, body)

    expect(updatedSprint).toEqual(sprintMatcher(body))
  })
  it('updates a line - changes sprint code', async () => {
    const [sprint] = await createSprints([fakeSprint()])
    const body = {
      sprintCode: 'WD-1.2',
    }

    const updatedSprint = await repository.update(sprint.id, body)

    expect(updatedSprint).toEqual(sprintMatcher(body))
  })
  it('returns original sprint if no changes have been made', async () => {
    const [sprint] = await createSprints([fakeSprint()])
    const updatedSprint = await repository.update(sprint.id, {})
    expect(updatedSprint).toEqual(sprintMatcher())
  })
  it('returns undefined if sprint is not found', async () => {
    const updatedSprint = await repository.update(9999, {
      name: 'Updated name',
    })
    expect(updatedSprint).toBeUndefined()
  })
})

describe('remove', () => {
  it('removes line from table', async () => {
    await createSprints([fakeSprint()])

    const removableSprint = await repository.remove(fakeSprintPlaceholder.id)

    expect(removableSprint).toEqual(sprintMatcher())

    const sprintAfterRemoval = await selectSprints()
    expect(sprintAfterRemoval).toHaveLength(0)
  })
  it('should return undefined if the id does not exist', async () => {
    const removableSprint = await repository.remove(99999)
    expect(removableSprint).toBeUndefined()
  })
})
