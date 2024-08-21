import { z } from 'zod'

const schema = z.object({
  id: z.coerce.number().int().positive(),
  sprintCode: z
    .string()
    .min(1)
    .regex(/^[A-Z]+-\d+\.\d+$/)
    .trim(),
  name: z.string().min(1).max(100).trim(),
})

const insertable = schema.omit({ id: true })

const updateable = insertable.partial()

export const parse = (record: unknown) => schema.parse(record)
export const parseId = (id: unknown) => schema.shape.id.parse(id)
export const parseInsertable = (record: unknown) => insertable.parse(record)
export const parseUpdateable = (record: unknown) => updateable.parse(record)