import { Insertable } from 'kysely'
import type { Message } from '@/database'

export const fakeTemplatePlaceholder = {
  id: 1,
  message: 'Congrats! You are doing great!',
}

export const fakeSprintPlaceholder = {
  id: 1,
  sprintCode: 'WD-1.1',
  name: 'Intermediate Programming with Python',
}

export const fakeRequestedMessagePlaceholder = {
  sprintCode: 'WD-1.1',
  username: 'namsur',
  templateId: 1,
}

export const fakeMessage = (
  overrides: Partial<Insertable<Message>> = {}
): Insertable<Message> => ({
  sprintId: 1,
  templateId: 1,
  username: 'namsur',
  ...overrides,
})

export const messageMatcher = (
  overrides: Partial<Insertable<Message>> = {}
) => ({
  ...overrides,
  ...fakeMessage(overrides),
})
