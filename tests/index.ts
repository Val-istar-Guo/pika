import Pika from '../index'
import anyTest, { TestInterface } from 'ava'


const test = anyTest as TestInterface<{
  env: Pika<{
    prod: (value) => boolean
    test: (value) => boolean
    dev: (value) => boolean
    local: (value) => boolean
  }>
}>

test.beforeEach(t => {
  t.context.env = new Pika('production', {
    prod: value => value === 'prod' || value === 'production',
    test: value => value === 'test',
    dev: value => value === 'dev' || value === 'development',
    local: value => value === 'local',
  })
})

test('switch priority', t => {
  const databaseHost = t.context.env.switch({
    priority: 'priority.mysql.com',
    prod: 'prod.mysql.com',
    test: 'test.mysql.com',
    dev: 'dev.mysql.com',
    local: 'localhost.com',
    default: 'default.mysql.com',
  })

  t.is(databaseHost, 'priority.mysql.com')
})

test('switch hit condition', t => {
  const databaseHost = t.context.env.switch({
    prod: 'prod.mysql.com',
    test: 'test.mysql.com',
    dev: 'dev.mysql.com',
    local: 'localhost.com',
    default: 'default.mysql.com',
  })

  t.is(databaseHost, 'prod.mysql.com')
})

test('switch miss condition', t => {
  const databaseHost = t.context.env.switch({
    test: 'test.mysql.com',
    dev: 'dev.mysql.com',
    local: 'localhost.com',
    default: 'default.mysql.com',
  })

  t.is(databaseHost, 'default.mysql.com')
})

test('switch not set defualt', t => {
  t.throws(() => {
    t.context.env.switch({
      prod: 'prod.mysql.com',
      test: 'test.mysql.com',
      dev: 'dev.mysql.com',
      local: 'localhost.com',
    })
  })
})

test('assertion', t => {
  t.true(t.context.env.is.prod)
  t.false(t.context.env.is.test)
  t.false(t.context.env.is.dev)
  t.false(t.context.env.is.local)

  t.false(t.context.env.not.prod)
  t.true(t.context.env.not.test)
  t.true(t.context.env.not.dev)
  t.true(t.context.env.not.local)
})
