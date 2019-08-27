/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata'
import { COTL, DESCRIPTION } from '@/const'
import { Decorator } from '@/types'

export * from '@/types'
export * from '@/method'
export * from '@/schema'
export * from '@/args'
export * from '@/service'
export * from '@/tags'

export interface ControlOptions {
  prefix?: string
}

export function Control(options: string)
export function Control(options: ControlOptions)
export function Control(options: (ControlOptions | string) = '') {
  return function<T>(target: T): T {
    let meta: ControlOptions

    if (typeof options === 'string') meta = { prefix: options }
    else meta = options

    Reflect.defineMetadata(COTL, meta, target)
    return target
  }
}

export function Description(str): Decorator {
  return function(target, name) {
    const meta = Reflect.getMetadata(DESCRIPTION, target, name)
    if (meta) throw new Error(`Don't define description angin for ${name}`)
    Reflect.defineMetadata(DESCRIPTION, str, target, name)
  }
}
