import { Kysely, SqliteDatabase } from 'kysely'

export async function up(db: Kysely<SqliteDatabase>) {
  await db.schema
    .createTable('template')
    .ifNotExists()
    .addColumn('id', 'integer', (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn('message', 'text', (c) => c.notNull())
    .execute()

  await db.schema
    .createTable('sprint')
    .ifNotExists()
    .addColumn('id', 'integer', (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn('sprint_code', 'text', (c) => c.notNull())
    .addColumn('name', 'text', (c) => c.notNull())
    .execute()

  await db.schema
    .createTable('message')
    .ifNotExists()
    .addColumn('username', 'text', (c) => c.notNull())
    .addColumn('sprint_id', 'integer', (c) =>
      c.notNull().references('sprint.id').onDelete('cascade')
    )
    .addColumn('template_id', 'integer', (c) =>
      c.notNull().references('template.id').onDelete('cascade')
    )
    .execute()
}
