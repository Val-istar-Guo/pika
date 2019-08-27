/* eslint-disable new-cap */
import { Decorator } from '@/types'
import { PATH } from '@/const'

export enum METHODS {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DEL = 'del',
  ALL = 'all'
}

function Route(path: string, verb: METHODS): Decorator {
  return function(target, name) {
    const meta = Reflect.getMetadata(PATH, target) || []
    meta.push({ name, verb, path })
    Reflect.defineMetadata(PATH, meta, target)
  }
}

export function ALL(path: string): Decorator {
  return Route(path, METHODS.ALL)
}

export function GET(path: string): Decorator {
  return Route(path, METHODS.GET)
}

export function POST(path: string): Decorator {
  return Route(path, METHODS.POST)
}

export function PUT(path: string): Decorator {
  return Route(path, METHODS.PUT)
}

export function DEL(path: string): Decorator {
  return Route(path, METHODS.DEL)
}
