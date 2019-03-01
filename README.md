[![](https://img.shields.io/github/license/albert-team/red.svg?style=flat-square)](https://github.com/albert-team/red)
[![](https://img.shields.io/npm/v/@albert-team/red/latest.svg?style=flat-square)](https://www.npmjs.com/package/@albert-team/red)
[![](https://img.shields.io/npm/v/@albert-team/red/beta.svg?style=flat-square)](https://www.npmjs.com/package/@albert-team/red)
[![](https://img.shields.io/npm/v/@albert-team/red/canary.svg?style=flat-square)](https://www.npmjs.com/package/@albert-team/red)

# RED

> Minimal Redis client for Node.js

## Credits

Red is a fork of [djanowski/yoredis](https://github.com/djanowski/yoredis). Many thanks to Damian Janowski and his great work.

## Installation

### Requirements

- Node.js >= 8.0.0
- Redis (server)

### Instructions

- With npm:

```bash
npm i @albert-team/red
```

- With yarn:

```bash
yarn add @albert-team/red
```

## Usage

```js
const Red = require('@albert-team/red')

const main = async () => {
  const client = new Red()
  await client.connect()

  console.log(await client.call('ping'))
  const result = await client.callMany([
    ['set', 'testkey', 'testvalue'],
    ['get', 'testkey']
  ])
  console.log(result)

  await client.disconnect()
}

main()
```

## Changelog

Read more [here](https://github.com/albert-team/red/blob/master/CHANGELOG.md).
