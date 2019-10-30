const Redis = require('..')

const main = async () => {
  const client = new Redis()

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
