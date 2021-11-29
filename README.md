# @miaooo/pika

[![version](https://img.shields.io/npm/v/@miaooo/pika.svg?style=flat-square)](https://www.npmjs.com/package/@miaooo/pika)
[![downloads](https://img.shields.io/npm/dm/@miaooo/pika.svg?style=flat-square)](https://www.npmjs.com/package/@miaooo/pika)
[![license](https://img.shields.io/npm/l/@miaooo/pika.svg?style=flat-square)](https://www.npmjs.com/package/@miaooo/pika)
[![dependencies](https://img.shields.io/david/Val-istar-Guo/pika.svg?style=flat-square)](https://www.npmjs.com/package/@miaooo/pika)
[![coveralls](https://img.shields.io/coveralls/github/Val-istar-Guo/pika.svg?style=flat-square)](https://coveralls.io/github/Val-istar-Guo/pika)



<!-- description -->
[简体中文](./doc/zh-cn/readme.md)

Easy-to-use config hierarchical configuration.
<!-- description -->

## Usage

<!-- usage -->
```typescript
import Pika from '@miaooo/pika'

const env = new Pika(process.env.NODE_ENV, {
  prod: value => value === 'prod' || value === 'production',
  test: value => value === 'test',
  dev: value => value === 'dev' || value === 'development',
  local: value => value === 'local',
})

const databaseHost = env.switch({
  priority: process.env.DB_HOST,
  prod: 'prod.mysql.com',
  test: 'test.mysql.com',
  dev: 'dev.mysql.com',
  local: 'localhost.com',
  default: 'default.mysql.com',
})
```

The meaning of the above code is:

- When `process.env.DB_HOST` is not ʻundefined`, regardless of the value of `process.env.NODE_ENV`, `databaseHost` will be set to `process.env.DB_HOST`.
- When `process.env.NODE_ENV ==='prod' || process.env.NODE_ENV ==='production`, `databaseHost` will be set to `'prod.mysql.com'`. In the same way, when the conditions such as `test`, `dev`, and `local` match, the `databaseHost` will be set to the corresponding data.
- When `process.env.NODE_ENV` does not match any of the conditions of `prod`, `test`, `dev`, and `local`, the `databaseHost` will be set to `'default.mysql.com'`'.

Through the above code interpretation, it should be easy for everyone to understand the purpose of the `Pika` library: reduce repetitive writing of ʻif` and improve the readability of configuration files.


In addition, Pika also provides some variables for use in the development:

```typescript
if (env.is.prod) console.log('In production environment')
if (env.is.test) console.log('In test environment')
if (env.is.dev) console.log('In development environment')
if (env.is.local) console.log('In local environment')

if (env.not.prod) console.log('Not in production environment')
if (env.not.test) console.log('Not in test environment')
if (env.not.dev) console.log('Not in develoption environment')
if (env.not.local) console.log('Not in local environment')
```

`Pika` can encapsulate the decision logic of `process.env.NODE_ENV`, provide a unified API interface for calls, make the code easy to read and avoid writing unsound ʻif` in multi-person development.

In addition, the names of `prod`, `test`, `dev`, and `local` can be changed arbitrarily, and any number of `key` can also be provided. As long as the judgment conditions declared in `new Pika` can be used, there are no restrictions on `Pika`:

```typescript
const env = new Pika(process.env.NODE_ENV, {
  customA: value => value === 'A',
  customB: value => value === 'B',
})

const x = env.switch({
  customA: 'abc',
  default: 'def',
})

if (env.is.customA) console.log('abc')
if (env.is.not.customB) console.log('not def')
```
The first parameter of `env.switch` is an enumeration object, `priority` is a built-in `key`, with the highest priority, as long as the data set by `priority` is not ʻundefined`, then `priority` takes precedence . Otherwise, various conditions will be judged and the final decision will be made on which value to use.
If none of the conditions are matched, the word `default`
<!-- usage -->

<!-- addition -->
## Precautions

1. `Pika` is completely developed by `Typescript`, with completeness and code hints, and the types of all enumeration values of `.switch` must be consistent.
2. The enumeration `key` of `.switch` can be filled in as many as you want, except for the field of `default`, which must be filled in. This is to prevent the conditions set during the initialization of `new Pika` from being unable to cover all conditions, resulting in code An accident occurred while running.
3. When `new Pick` is initialized, all the set judgment rules must be mutually exclusive, otherwise `.swtich` cannot guarantee which value will be returned when multiple conditions are matched at the same time.
<!-- addition -->


## Contributing & Development

If there is any doubt, it is very welcome to discuss the issue together.
Please read [Contributor Covenant Code of Conduct](.github/CODE_OF_CONDUCT.md) and [CONTRIBUTING](.github/CONTRIBUTING.md).
