import { z } from 'zod'

const schema = z.object({
  sprintId: z.coerce.number().int().positive(),
  sprintCode: z
    .string()
    .min(1)
    .regex(/^[A-Z]+-\d+\.\d+$/)
    .trim(),
  templateId: z.coerce.number().int().positive(),
  username: z.string().min(1).max(6),
})

const requested = schema.omit({ sprintId: true }).partial({ templateId: true })
const insertable = schema.omit({ sprintCode: true })

export const parseRequested = (record: unknown) => requested.parse(record)
export const parseInsertable = (record: unknown) => insertable.parse(record)
export const parseSprintCode = (sprintCode: unknown) =>
  schema.shape.sprintCode.parse(sprintCode)
export const parseUsername = (username: unknown) =>
  schema.shape.username.parse(username)
