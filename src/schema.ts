/* eslint-disable new-cap */
import { Decorator } from '@/types'
import { SCHEMA } from '@/const'

export enum SchemaPart {
  requestBody = 'request-body',
  requestHeaders = 'request-headers',
  requestParams = 'request-params',
  requestQuery = 'request-query',
  responseHeaders = 'response-headers',
  responseBody = 'response-body',
}
function Schema(part: SchemaPart, schema): Decorator {
  return function(target, name) {
    const meta = Reflect.getMetadata(SCHEMA, target, name) || {}
    if (part in meta) throw new Error(`Don't set schema again for ${name}`)
    meta[part] = schema
    Reflect.defineMetadata(SCHEMA, meta, target, name)
  }
}

export function RequestBody(schema): Decorator {
  return Schema(SchemaPart.requestBody, schema)
}
export function RequestHeaders(schema): Decorator {
  return Schema(SchemaPart.requestHeaders, schema)
}
export function RequestParams(schema): Decorator {
  return Schema(SchemaPart.requestParams, schema)
}
export function ResponseBody(schema): Decorator {
  return Schema(SchemaPart.responseBody, schema)
}
export function ResponseHeaders(schema): Decorator {
  return Schema(SchemaPart.responseHeaders, schema)
}
