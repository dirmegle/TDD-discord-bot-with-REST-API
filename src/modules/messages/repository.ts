import { Insertable, Selectable, sql } from 'kysely'
import type { Sprint, Message, Template, Database } from '@/database'

type MessageInsert = Insertable<Message>
type MessageSelect = Selectable<Message>
export type MessageToReturn = Omit<Message, 'sprintId'> &
  Omit<Sprint, 'name' | 'id'>

export default (db: Database) => ({
  findAll(): Promise<Selectable<MessageToReturn>[]> {
    return db
      .selectFrom('message')
      .innerJoin('sprint', 'message.sprintId', 'sprint.id')
      .select(['message.username', 'sprint.sprintCode', 'message.templateId'])
      .execute()
  },

  findAllBySprintCode(
    sprintCode: string
  ): Promise<Selectable<MessageToReturn>[]> {
    return db
      .selectFrom('message')
      .innerJoin('sprint', 'message.sprintId', 'sprint.id')
      .select(['message.username', 'sprint.sprintCode', 'message.templateId'])
      .where('sprint.sprintCode', '=', sprintCode)
      .execute()
  },

  findSprintIdByCode(
    sprintCode: string
  ): Promise<Selectable<Sprint> | undefined> {
    return db
      .selectFrom('sprint')
      .select(['id', 'name', 'sprintCode'])
      .where('sprintCode', '=', sprintCode)
      .executeTakeFirst()
  },

  findAllByUsername(username: string): Promise<Selectable<MessageToReturn>[]> {
    return db
      .selectFrom('message')
      .innerJoin('sprint', 'message.sprintId', 'sprint.id')
      .select(['message.username', 'sprint.sprintCode', 'message.templateId'])
      .where('message.username', '=', username)
      .execute()
  },

  findAllByUsernameAndCode(
    username: string,
    sprintCode: string
  ): Promise<Selectable<MessageToReturn>[]> {
    return db
      .selectFrom('message')
      .innerJoin('sprint', 'message.sprintId', 'sprint.id')
      .select(['message.username', 'sprint.sprintCode', 'message.templateId'])
      .where('message.username', '=', username)
      .where('sprint.sprintCode', '=', sprintCode)
      .execute()
  },

  getRandomTemplateId(): Promise<Selectable<Pick<Template, 'id'>> | undefined> {
    return db
      .selectFrom('template')
      .select('id')
      .orderBy(sql`random()`)
      .executeTakeFirst()
  },

  findTemplateById(
    id: number
  ): Promise<Selectable<Pick<Template, 'message'>> | undefined> {
    return db
      .selectFrom('template')
      .select(['id', 'message'])
      .where('id', '=', id)
      .executeTakeFirst()
  },

  findBySprintIdAndUsername(
    sprintId: number,
    username: string
  ): Promise<MessageSelect | undefined> {
    return db
      .selectFrom('message')
      .select(['sprintId', 'templateId', 'username'])
      .where('sprintId', '=', sprintId)
      .where('username', '=', username)
      .executeTakeFirst()
  },

  create(record: MessageInsert): Promise<MessageInsert | undefined> {
    return db
      .insertInto('message')
      .values(record)
      .returning(['sprintId', 'templateId', 'username'])
      .executeTakeFirst()
  },
})
