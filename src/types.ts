export type Decorator = (target, name, descriptor) => void
export type RouteTypes = 'http-all' | 'http-get' | 'http-post' | 'http-put' | 'http-del'
export interface RouteTag {
  name: 'deprecated'
}

export interface HttpHeaders {
  type: 'object'
  properties?: object
}
export interface HttpParams {
  type: 'object'
  properties?: object
}
export interface HttpQuery {
  type: 'object'
  properties?: object
}

export interface HttpRequest {
  query?: HttpQuery
  headers?: HttpHeaders
  params?: HttpParams
  body?: object
}

export interface HttpResponse {
  headers?: HttpHeaders
  body?: object
}


export type RouteRequest = HttpRequest
export type RouteResponse = HttpResponse

export interface Route {
  path: string
  description: string
  type: RouteTypes
  tags: RouteTag[]

  request: RouteRequest
  response: RouteResponse
}

export interface Schema {
  name: string
  description: string
  value: object
}

