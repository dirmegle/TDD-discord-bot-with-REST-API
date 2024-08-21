import { z } from 'zod'

const requiredSubstrings = ['{username}', '{sprintName}']

const schema = z.object({
  id: z.coerce.number().int().positive(),
  message: z
    .string()
    .min(1)
    .max(500)
    .trim()
    .refine(
      (str) => requiredSubstrings.every((substring) => str.includes(substring)),
      {
        message:
          'Message string must contain {username} and {sprintTitle} substrings',
      }
    ),
})

const insertable = schema.omit({
  id: true,
})

const updateable = insertable

export const parse = (record: unknown) => schema.parse(record)
export const parseId = (id: unknown) => schema.shape.id.parse(id)
export const parseInsertable = (record: unknown) => insertable.parse(record)
export const parseUpdateable = (record: unknown) => updateable.parse(record)
