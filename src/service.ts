/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable new-cap */
import Koa from 'koa'
import koaBody from 'koa-body'
import Router from 'koa-router'
import { PATH, COTL, PARAM, DESCRIPTION, SCHEMA, TAG } from '@/const'
import { join } from 'path'
import Ajv from 'ajv'
import { SchemaPart } from './schema'
import request from 'superagent'
import { Schema, Route } from '@/types'
import { METHODS } from '@/method'

export interface ServiceRoutesOptions {
  validate?: boolean
}

export type Environment = 'production' | 'development' | 'local'

function getEnv(): Environment {
  switch (process.env.NODE_ENV) {
    case 'development':
      return 'development'
    case 'local':
      return 'local'
    default:
      return 'production'
  }
}

export class Service {
  controllers: any[] = []

  private manual: boolean = false

  private service: any = { schemas: [] }

  private environment: Environment = getEnv()

  constructor(controllers: any[]) {
    this.controllers = controllers
  }

  public key(serviceKey: string): Service {
    this.service.key = serviceKey
    return this
  }

  public appKey(appKey: string): Service {
    this.service.appKey = appKey
    return this
  }

  public version(version: string): Service {
    this.service.version = version
    return this
  }

  public hosts(hosts: object): Service {
    this.service.hosts = hosts
    return this
  }

  public manualRegist(value: boolean = true): Service {
    this.manual = value
    return this
  }

  public description(str: string): Service {
    this.service.description = str
    return this
  }

  public compatibility(value: boolean = true): Service {
    this.service.compatibility = value
    return this
  }

  public env(value: Environment): Service {
    this.environment = value
    return this
  }

  public schemas(schemas: (object[] | object)): Service {
    const wrap = (schema): Schema => {
      if (typeof schema.title !== 'string') throw new Error('Schema of service must have a title')
      return { name: schema.title, description: schema.description || '', value: schema }
    }
    if (Array.isArray(schemas)) this.service.schemas = schemas.map(wrap)
    else this.service.schemas = [schemas].map(wrap)

    return this
  }

  public routes(options: ServiceRoutesOptions = {}): Koa.Middleware {
    const { controllers, schemas } = this

    const koaRouter = new Router()
    koaRouter.use(koaBody())
    const ajv = new Ajv({ schemas, useDefaults: true })

    for (const ctrl of controllers) {
      const cotlMeta = Reflect.getMetadata(COTL, ctrl) || {}
      let pathMeta = Reflect.getMetadata(PATH, ctrl.prototype) || []
      const argsMeta = Reflect.getMetadata(PARAM, ctrl.prototype) || []
      pathMeta = pathMeta.filter(item => item.path && item.verb)

      const { prefix = '' } = cotlMeta
      const instance = new ctrl()

      for (const item of pathMeta) {
        const { path, verb, name } = item
        const uri = join(prefix, path)
        const schema = Reflect.getMetadata(SCHEMA, ctrl.prototype, name) || {}

        console.log(`bind route: ${verb.toUpperCase()} ${uri} ${Reflect.getMetadata(DESCRIPTION, ctrl.prototype, name)}`)
        koaRouter[verb](uri, async(ctx: Koa.Context) => {
          if (options.validate) {
            const requestBodySchema = schema[SchemaPart.requestBody]
            const requestHeadersSchema = schema[SchemaPart.requestHeaders]
            const requestParamsSchema = schema[SchemaPart.requestParams]

            if (requestBodySchema) {
              const validate = ajv.compile(requestBodySchema)
              const valid = validate(ctx.request.body)
              if (!valid) ctx.throw(500, ajv.errorsText(validate.errors, { dataVar: 'requestBody' }))
            }
            if (requestHeadersSchema) {
              const validate = ajv.compile(requestHeadersSchema)
              const valid = validate(ctx.headers)
              if (!valid) ctx.throw(500, ajv.errorsText(validate.errors, { dataVar: 'requestHeaders' }))
            }

            if (requestParamsSchema) {
              const validate = ajv.compile(requestParamsSchema)
              const valid = validate(ctx.params)
              if (!valid) ctx.throw(500, ajv.errorsText(validate.errors, { dataVar: 'requestParams' }))
            }
          }

          const args = argsMeta.filter(i => i.name === name).sort((a, b) => a.index - b.index).map(i => i.fn(ctx))
          const result = await instance[name](...args, ctx)
          if (result) ctx.body = result
          else ctx.status = 200

          if (options.validate) {
            const responseHeadersSchema = schema[SchemaPart.responseHeaders]
            const responseBodySchema = schema[SchemaPart.responseBody]

            if (responseHeadersSchema) {
              const validate = ajv.compile(responseHeadersSchema)
              const valid = validate(ctx.response.headers)
              if (!valid) ctx.throw(500, ajv.errorsText(validate.errors, { dataVar: 'responseHeaders' }))
            }

            if (responseBodySchema) {
              const validate = ajv.compile(responseBodySchema)
              const valid = validate(ctx.body)
              if (!valid) ctx.throw(500, ajv.errorsText(validate.errors, { dataVar: 'responseBody' }))
            }
          }
        })
      }
    }

    return koaRouter.routes()
  }

  public async regist(): Promise<void> {
    const isProd = this.environment === 'production'
    const { service } = this

    const host = isProd ? `http://service.miaooo.me/services/${service.key}` : `http://localhost:8080/services/${service.key}`

    const { controllers } = this
    const routes: Route[] = []

    for (const ctrl of controllers) {
      const cotlMeta = Reflect.getMetadata(COTL, ctrl) || {}
      let pathMeta = Reflect.getMetadata(PATH, ctrl.prototype) || []
      const argsMeta = Reflect.getMetadata(PARAM, ctrl.prototype) || []
      console.log('ARG META => ', argsMeta)
      pathMeta = pathMeta.filter(item => item.path && item.verb)

      const { prefix = '' } = cotlMeta

      for (const item of pathMeta) {
        const { path, verb, name } = item
        const description = Reflect.getMetadata(DESCRIPTION, ctrl.prototype, name) || ''
        const tags = Reflect.getMetadata(TAG, ctrl.prototype, name) || []

        let type

        console.log('VERB => ', verb)
        if (verb === METHODS.GET) type = 'http-get'
        else if (verb === METHODS.PUT) type = 'http-put'
        else if (verb === METHODS.POST) type = 'http-post'
        else if (verb === METHODS.DEL) type = 'http-delete'
        else type = 'http-all'

        const schema = Reflect.getMetadata(SCHEMA, ctrl.prototype, name) || {}

        const route: Route = {
          path: join(prefix, path),
          description,
          type,
          tags,
          request: {},
          response: {},
        }

        if (schema[SchemaPart.requestHeaders]) route.request.headers = schema[SchemaPart.requestHeaders]
        if (schema[SchemaPart.requestBody]) route.request.body = schema[SchemaPart.requestBody]
        if (schema[SchemaPart.requestParams]) route.request.params = schema[SchemaPart.requestParams]
        if (schema[SchemaPart.requestQuery]) route.request.query = schema[SchemaPart.requestQuery]

        if (schema[SchemaPart.responseBody]) route.response.body = schema[SchemaPart.responseBody]
        if (schema[SchemaPart.responseHeaders]) route.response.headers = schema[SchemaPart.responseHeaders]

        routes.push(route)
      }
    }

    const res = await request
      .put(host)
      .ok(res => res.status < 500)
      .send({ ...this.service, routes })

    if (res.status !== 200) console.error(`Unable regist service: ${res.text}`)
  }
}
