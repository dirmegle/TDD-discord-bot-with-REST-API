import createTestDatabase from '@tests/utils/createTestDatabase'
import { createFor, selectAllFor } from '@tests/utils/records'
import { expect } from 'vitest'
import buildRepository from '../repository'
import {
  fakeTemplatePartial,
  templateMatcher,
  fakeTemplateFull,
  fakeTemplatePlaceholder,
} from './utils'

const db = await createTestDatabase()
const repository = buildRepository(db)
const createTemplates = createFor(db, 'template')
const selectTemplates = selectAllFor(db, 'template')

afterAll(() => db.destroy())

afterEach(async () => {
  await db.deleteFrom('template').execute()
})

describe('findAll', () => {
  it('returns all templates', async () => {
    await createTemplates([fakeTemplateFull()])
    const templates = await repository.findAll()

    expect(templates).toHaveLength(1)
    expect(templates[0]).toEqual(templateMatcher())
  })
})

describe('findById', () => {
  it('returns one template based on ID', async () => {
    const [template] = await createTemplates([fakeTemplateFull()])
    const foundTemplate = await repository.findById(template.id)
    expect(foundTemplate).toEqual(templateMatcher(template))
  })
  it('returns undefined if the template does not exist', async () => {
    const foundTemplate = await repository.findById(99999999)
    expect(foundTemplate).toBeUndefined()
  })
})

describe('findByMessage', () => {
  it('returns one template based on message', async () => {
    const [template] = await createTemplates([fakeTemplateFull()])
    const foundTemplate = await repository.findByMessage(template.message)
    expect(foundTemplate).toEqual(templateMatcher(template))
  })
  it('returns undefined if there is no template with message', async () => {
    const foundTemplate = await repository.findByMessage(
      'Message that is not in the database'
    )
    expect(foundTemplate).toBeUndefined()
  })
})

describe('create', () => {
  it('creates a new row in template table', async () => {
    const template = await repository.create(fakeTemplatePartial())
    expect(template).toEqual(templateMatcher(template))

    const templatesInDatabase = await selectTemplates()
    expect(templatesInDatabase).toEqual([template])
  })
})

describe('update', () => {
  it('updates a line in the table based on ID', async () => {
    await createTemplates([
      fakeTemplateFull(),
      fakeTemplateFull(fakeTemplatePlaceholder),
    ])
    const partialTemplate = { message: 'Updated message' }
    const updatedTemplate = await repository.update(2, partialTemplate)

    expect(updatedTemplate).toEqual({
      id: 2,
      message: 'Updated message',
    })
  })

  it('returns the original template if no changes are made', async () => {
    const templates = await createTemplates([
      fakeTemplateFull(),
      fakeTemplateFull({ id: 3, message: 'Now that is an achievement! Nice!' }),
    ])

    const updatedTemplate = await repository.update(3, {})

    expect(templates[1].message).toEqual('Now that is an achievement! Nice!')
    expect(updatedTemplate).toEqual({
      id: 3,
      message: 'Now that is an achievement! Nice!',
    })
  })
  it('returns undefined if the template is not found', async () => {
    const updatedTemplate = await repository.update(99999, {
      message: 'Updated message',
    })
    expect(updatedTemplate).toBeUndefined()
  })
})

describe('remove', () => {
  it('removes line from table', async () => {
    await createTemplates([
      fakeTemplateFull(),
      fakeTemplateFull(fakeTemplatePlaceholder),
    ])

    const removableTemplate = await repository.remove(
      fakeTemplatePlaceholder.id
    )

    expect(removableTemplate).toEqual(templateMatcher(fakeTemplatePlaceholder))

    const templatesAfterRemoval = await selectTemplates()
    expect(templatesAfterRemoval).toHaveLength(1)
  })
  it('should return undefined if the id does not exist', async () => {
    const removableTemplate = await repository.remove(99999)
    expect(removableTemplate).toBeUndefined()
  })
})
