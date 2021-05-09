function fromEntries<T>(iterable: Iterable<[string, T]>): Record<string, T> {
  return [...iterable].reduce((obj, [key, val]) => {
    obj[key] = val
    return obj
  }, {})
}

interface PossibleValues {
  [key: string]: (value) => boolean
}

export default class Pika<T extends PossibleValues> {
  private variable: any
  private possibleValues: T

  constructor(variable: any, possibleValues: T) {
    this.variable = variable
    this.possibleValues = possibleValues
  }

  get is(): Record<keyof T, boolean> {
    const value = this.variable

    const pairs = Object.entries(this.possibleValues)
      .map(([key, fn]): [string, any] => ([key, fn(value)]))

    return fromEntries(pairs) as Record<keyof T, boolean>
  }

  get not(): Record<keyof T, boolean> {
    const value = this.variable

    const pairs = Object.entries(this.possibleValues)
      .map(([key, fn]): [string, any] => ([key, !fn(value)]))

    return fromEntries(pairs) as Record<keyof T, boolean>
  }

  public switch<U>(mapping: Partial<Record<keyof T | 'default' | 'priority', U>>): U {
    if (!mapping.default) throw new TypeError('Must set default value.')
    if (mapping.priority !== undefined && !(typeof mapping.priority === 'number' && isNaN(mapping.priority))) return mapping.priority

    const keys = Object.keys(mapping).filter(key => key !== 'default' && key !== 'priority')

    const value = this.variable
    for (const key of keys) {
      const match = this.possibleValues[key]
      if (match(value)) return mapping[key] as U
    }

    return mapping.default
  }
}
