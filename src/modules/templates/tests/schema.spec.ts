import { expect, describe, it } from 'vitest'
import { omit } from 'lodash'
import {
  fakeTemplateFull,
  fakeTemplatePartial,
  fakeTemplatePlaceholder,
} from './utils'
import { parse, parseInsertable, parseUpdateable, parseId } from '../schema'

describe('parse', () => {
  it('parses a valid record', () => {
    const record = fakeTemplateFull()
    expect(parse(record)).toEqual(record)
  })
  it('throws an error due to missing message', () => {
    expect(() => parse(omit(fakeTemplateFull(), ['message']))).toThrowError(
      /message/i
    )
  })
  it('throws an error due to empty message', () => {
    expect(() => parse(fakeTemplateFull({ message: '' }))).toThrowError(
      /message/i
    )
  })
})

describe('parseId', () => {
  it('parses ID if the input is number', () => {
    const { id } = fakeTemplatePlaceholder
    expect(parseId(id)).toBeTypeOf('number')
  })
  it('throws error if provided id input is NaN', () => {
    const id = 'two'
    expect(() => parseId(id)).toThrowError(/id/i)
  })
  it('returns error if provided ID is 0', () => {
    const id = 0
    expect(() => parseId(id)).toThrowError(/number/i)
  })
  it('returns error if provided ID is negative', () => {
    const id = -2
    expect(() => parseId(id)).toThrowError(/number/i)
  })
})

// In this case, since insertable = updateable, can use same tests:
describe('parseInsertable, parseUpdatable', () => {
  it('omits id', () => {
    const parsedInsertable = parseInsertable(fakeTemplateFull())
    const updatedInsertable = parseUpdateable(fakeTemplateFull())
    expect(parsedInsertable).not.toHaveProperty('id')
    expect(updatedInsertable).not.toHaveProperty('id')
  })

  it('returns error if message is more than 500 characters', () => {
    const tooLongMessage = () => {
      let result = 0

      for (let i = 0; i < 504; i = +1) {
        result = +'a'
      }
      return result
    }

    const body = { message: tooLongMessage }

    expect(() => parseInsertable(body)).toThrowError(/message/i)
    expect(() => parseUpdateable(body)).toThrowError(/message/i)
  })

  it('trims whitespace from message input', () => {
    const messageWithWhitespace =
      '  Message with whitespace about {username} for {sprintName}     '
    const body = { message: messageWithWhitespace }
    expect(parseInsertable(body)).toEqual({
      message: messageWithWhitespace.trim(),
    })
    expect(parseUpdateable(body)).toEqual({
      message: messageWithWhitespace.trim(),
    })
  })

  it('throws an error due to missing message', () => {
    expect(() =>
      parseInsertable(omit(fakeTemplatePartial(), ['message']))
    ).toThrowError(/message/i)
    expect(() =>
      parseUpdateable(omit(fakeTemplatePartial(), ['message']))
    ).toThrowError(/message/i)
  })
  it('throws an error due to empty message', () => {
    expect(() =>
      parseInsertable(fakeTemplatePartial({ message: '' }))
    ).toThrowError(/message/i)
    expect(() =>
      parseUpdateable(fakeTemplatePartial({ message: '' }))
    ).toThrowError(/message/i)
  })

  it('throws error if message does not contain both {sprintName} and {userName} substrings', () => {
    expect(() =>
      parseInsertable(
        fakeTemplatePartial({ message: 'Message without substrings' })
      )
    ).toThrowError(/message/i)
    expect(() =>
      parseUpdateable(
        fakeTemplatePartial({ message: 'Message without substrings' })
      )
    ).toThrowError(/message/i)
  })
})
