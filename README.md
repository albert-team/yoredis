[![](https://img.shields.io/github/license/albert-team/red.svg?style=flat-square)](https://github.com/albert-team/red)
[![](https://img.shields.io/npm/v/@albert-team/red.svg?style=flat-square)](https://www.npmjs.com/package/@albert-team/red)

# RED

> Minimalistic Redis client for Node.js

## Credits

Red is a fork of [djanowski/yoredis](https://github.com/djanowski/yoredis). Many thanks to Damian Janowski and his great work.

## Installation

### Requirements

- Node.js >= 8.0.0
- Redis

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

### Quick Start

```js
const Red = require('@albert-team/red')

const main = async () => {
  const client = new Red('127.0.0.1', 6379)

  console.log(client.ready) // false
  await client.connect()
  console.log(client.ready) // true

  console.log(await client.call('PING')) // PONG
  console.log(await client.callOne(['GET', 'key1'])) // null
  console.log(
    await client.callMany([['SET', 'key1', 'val1'], ['GET', 'key1'], ['GET', 'key2']])
  ) // [ 'OK', 'val1', null ]

  console.log(client.disconnected) // false
  await client.disconnect()
  console.log(client.disconnected) // true
}

main()
```

### Authentication

You can either pass the password to the constructor

```js
const client = new Red('127.0.0.1', 6379, { password: 'scrtpassword' })
```

or call this method manually

```js
client.authenticate('scrtpassword')
```

## Changelog

Read more [here](https://github.com/albert-team/red/blob/master/CHANGELOG.md).
