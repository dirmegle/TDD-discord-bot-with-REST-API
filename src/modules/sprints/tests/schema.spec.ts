import { omit } from 'lodash'
import { fakeSprint, fakeSprintPlaceholder } from './utils'
import { parse, parseId, parseInsertable, parseUpdateable } from '../schema'

describe('parse', () => {
  it('parses a valid record', () => {
    const record = fakeSprint()
    expect(parse(record)).toEqual(record)
  })
  it('throws an error due to missing sprint code', () => {
    expect(() => parse(omit(fakeSprint(), ['sprintCode']))).toThrowError(
      /sprintCode/i
    )
  })
  it('throws an error due to empty sprint code', () => {
    expect(() => parse(fakeSprint({ sprintCode: '' }))).toThrowError(
      /sprintCode/i
    )
  })
  it('throws an error due to missing sprint name', () => {
    expect(() => parse(omit(fakeSprint(), ['name']))).toThrowError(/name/i)
  })
  it('throws an error due to empty sprint name', () => {
    expect(() => parse(fakeSprint({ name: '' }))).toThrowError(/name/i)
  })
})

describe('parseId', () => {
  it('parses ID if the input is number', () => {
    const { id } = fakeSprintPlaceholder
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

// Joining tests that perform the same function
describe('parseInsertable, parseUpdatable', () => {
  it('throws an error due to empty sprint name', () => {
    expect(() => parseInsertable(fakeSprint({ name: '' }))).toThrowError(
      /name/i
    )
    expect(() => parseUpdateable(fakeSprint({ name: '' }))).toThrowError(
      /name/i
    )
  })
  it('returns error if sprint code is empty', () => {
    expect(() => parseInsertable(fakeSprint({ sprintCode: '' }))).toThrowError(
      /sprintCode/i
    )
    expect(() => parseUpdateable(fakeSprint({ sprintCode: '' }))).toThrowError(
      /sprintCode/i
    )
  })
  it('returns error if sprint name exceeds 100 characters', () => {
    const tooLongName = () => {
      let result = 0

      for (let i = 0; i < 104; i = +1) {
        result = +'a'
      }
      return result
    }

    const body = { name: tooLongName }

    expect(() => parseInsertable(body)).toThrowError(/name/i)
    expect(() => parseUpdateable(body)).toThrowError(/name/i)
  })
  it('trims whitespace from sprint name input', () => {
    const nameWithWhitespace = '  Message with whitespace     '
    const body = fakeSprint({ name: nameWithWhitespace })
    const correctName = 'Message with whitespace'

    const expectedResult = {
      sprintCode: body.sprintCode,
      name: correctName,
    }

    expect(parseInsertable(body)).toEqual(expectedResult)
    expect(parseUpdateable(body)).toEqual(expectedResult)
  })
  it('omits id', () => {
    expect(parseInsertable(fakeSprint())).not.toHaveProperty('id')
    expect(parseUpdateable(fakeSprint())).not.toHaveProperty('id')
  })
})

describe('parseInsertable', () => {
  it('throws an error due to missing sprint name', () => {
    expect(() => parseInsertable(omit(fakeSprint(), ['name']))).toThrowError(
      /name/i
    )
  })

  it('returns error if sprint code is missing', () => {
    expect(() =>
      parseInsertable(omit(fakeSprint(), ['sprintCode']))
    ).toThrowError(/sprintCode/i)
  })
})
