import { Insertable } from 'kysely'
import type { Sprint } from '@/database'

export const fakeSprintPlaceholder = {
  id: 1,
  sprintCode: 'WD-1.1',
  name: 'Intermediate Programming with Python',
}

export const fakeSprint = (
  overrides: Partial<Insertable<Sprint>> = {}
): Insertable<Sprint> => ({
  id: 1,
  sprintCode: 'WD-1.1',
  name: 'First Steps Into Programming with Python',
  ...overrides,
})

export const sprintMatcher = (overrides: Partial<Insertable<Sprint>> = {}) => ({
  id: expect.any(Number),
  ...overrides,
  ...fakeSprint(overrides),
})
