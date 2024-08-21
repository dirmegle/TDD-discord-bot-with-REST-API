import { Insertable } from 'kysely'
import { expect } from 'vitest'
import type { Template } from '@/database'

export const fakeTemplatePlaceholder = {
  id: 2,
  message: 'Congrats! You are doing great!',
}

export const fakeTemplatePartial = (
  overrides: Partial<Insertable<Template>> = {}
): Insertable<Template> => ({
  message: 'You did it, {username}! I knew you could finish {sprintName}. 🤗',
  ...overrides,
})

export const fakeTemplateFull = (
  overrides: Partial<Insertable<Template>> = {}
) => ({
  id: 1,
  ...fakeTemplatePartial(overrides),
})

export const templateMatcher = (
  overrides: Partial<Insertable<Template>> = {}
) => ({
  id: expect.any(Number),
  ...overrides,
  ...fakeTemplatePartial(overrides),
})
