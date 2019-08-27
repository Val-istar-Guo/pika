/* eslint-disable new-cap */
import { PARAM } from '@/const'
import { Decorator } from '@/types'

function Inject(fn: Function): Decorator {
  return function(target, name, descriptor) {
    const meta = Reflect.getMetadata(PARAM, target) || []
    meta.push({ name, fn, index: descriptor })
    Reflect.defineMetadata(PARAM, meta, target)
  }
}

export function Ctx(): Decorator {
  return Inject(ctx => ctx)
}

export function Body(): Decorator {
  return Inject(ctx => ctx.request.body)
}

export function Req(): Decorator {
  return Inject(ctx => ctx.req)
}

export function Res(): Decorator {
  return Inject(ctx => ctx.res)
}

export function Param(arg): Decorator {
  return Inject(ctx => ctx.params[arg])
}

export function Params(): Decorator {
  return Inject(ctx => ctx.params)
}

export function Query(arg): Decorator {
  return Inject(ctx => ctx.query[arg])
}

