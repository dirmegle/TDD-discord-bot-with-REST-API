import { Insertable, Selectable, Updateable } from 'kysely'
import type { Sprint, Database } from '@/database'

const TABLE = 'sprint'
type Row = Sprint
type RowWithoutId = Omit<Row, 'id'>
type RowInsert = Insertable<Row>
type RowUpdate = Updateable<RowWithoutId>
type RowSelect = Selectable<Row>

const keys: (keyof Sprint)[] = ['sprintCode', 'id', 'name']

export default (db: Database) => ({
  findAll(): Promise<RowSelect[]> {
    return db.selectFrom(TABLE).select(keys).execute()
  },

  findById(id: number): Promise<RowSelect | undefined> {
    return db
      .selectFrom(TABLE)
      .select(keys)
      .where('id', '=', id)
      .executeTakeFirst()
  },

  findByCode(code: string): Promise<RowSelect | undefined> {
    return db
      .selectFrom(TABLE)
      .select(keys)
      .where('sprintCode', '=', code)
      .executeTakeFirst()
  },

  create(record: RowInsert): Promise<RowInsert | undefined> {
    return db
      .insertInto(TABLE)
      .values(record)
      .returning(keys)
      .executeTakeFirst()
  },

  update(id: number, partial: RowUpdate): Promise<RowUpdate | undefined> {
    if (Object.keys(partial).length === 0) {
      return this.findById(id)
    }

    return db
      .updateTable(TABLE)
      .set(partial)
      .where('id', '=', id)
      .returning(keys)
      .executeTakeFirst()
  },

  remove(id: number) {
    return db
      .deleteFrom(TABLE)
      .where('id', '=', id)
      .returning(keys)
      .executeTakeFirst()
  },
})
