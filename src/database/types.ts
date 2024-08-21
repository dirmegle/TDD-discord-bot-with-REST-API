import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export interface Message {
  sprintId: number;
  templateId: number;
  username: string;
}

export interface Sprint {
  id: Generated<number>;
  name: string;
  sprintCode: string;
}

export interface Template {
  id: Generated<number>;
  message: string;
}

export interface DB {
  message: Message;
  sprint: Sprint;
  template: Template;
}
