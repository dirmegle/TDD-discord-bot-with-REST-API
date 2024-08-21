import { omit } from 'lodash'
import {
  parseInsertable,
  parseRequested,
  parseSprintCode,
  parseUsername,
} from '../schema'
import {
  fakeMessage,
  fakeRequestedMessagePlaceholder,
  messageMatcher,
} from './utils'

describe('parseRequested', () => {
  it('parses the request', () => {
    expect(parseRequested(fakeRequestedMessagePlaceholder)).toEqual(
      fakeRequestedMessagePlaceholder
    )
  })
  it('throws an error due to missing sprintCode', () => {
    expect(() =>
      parseRequested(omit(fakeRequestedMessagePlaceholder, ['sprintCode']))
    ).toThrowError(/sprintCode/i)
  })
  it('throws an error due to missing username', () => {
    expect(() =>
      parseRequested(omit(fakeRequestedMessagePlaceholder, ['username']))
    ).toThrowError(/username/i)
  })
  it('parses request without templateId', () => {
    const messageWithoutTemplateId = omit(fakeRequestedMessagePlaceholder, [
      'templateId',
    ])
    expect(parseRequested(messageWithoutTemplateId)).toEqual(
      messageWithoutTemplateId
    )
  })
})

describe('parseInsertable', () => {
  it('parses a valid insertable record', () => {
    expect(parseInsertable(fakeMessage())).toEqual(messageMatcher())
  })
  it('throws an error due to missing sprintId', () => {
    expect(() =>
      parseInsertable(omit(fakeMessage(), ['sprintId']))
    ).toThrowError(/sprintId/i)
  })
  it('throws an error due to missing templateId', () => {
    expect(() =>
      parseInsertable(omit(fakeMessage(), ['templateId']))
    ).toThrowError(/templateId/i)
  })
  it('throws an error due to missing username', () => {
    expect(() =>
      parseInsertable(omit(fakeMessage(), ['username']))
    ).toThrowError(/username/i)
  })
  it('throws an error due to empty username', () => {
    expect(() => parseInsertable(fakeMessage({ username: '' }))).toThrowError(
      /username/i
    )
  })
  it('throws an error if username is too long', () => {
    expect(() =>
      parseInsertable(fakeMessage({ username: 'toolongusername' }))
    ).toThrowError(/username/i)
  })
})

describe('parseSprintCode', () => {
  it('parses correct sprint code', () => {
    expect(parseSprintCode(fakeRequestedMessagePlaceholder.sprintCode)).toEqual(
      fakeRequestedMessagePlaceholder.sprintCode
    )
  })

  it('throws error if sprint code is incorrect - numbers first', () => {
    expect(() => parseSprintCode('1.1-WD')).toThrowError(/invalid/i)
  })

  it('throws error if sprint code is incorrect - missing dot and dash', () => {
    expect(() => parseSprintCode('WD11')).toThrowError(/invalid/i)
  })
})

describe('parseUsername', () => {
  it('parses correct username', () => {
    expect(parseUsername(fakeRequestedMessagePlaceholder.username)).toEqual(
      fakeRequestedMessagePlaceholder.username
    )
  })
  it('throws error if username is too long', () => {
    expect(() => parseUsername('toolongusername')).toThrowError(/too_big/i)
  })
})
