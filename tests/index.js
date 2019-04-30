const Redis = require('..')

const main = async () => {
  const client = new Redis()

  console.log(client.ready)
  await client.connect()
  console.log(client.ready)

  console.log(await client.call('PING'))
  console.log(await client.callOne(['GET', 'key1']))
  console.log(
    await client.callMany([['SET', 'key1', 'val1'], ['GET', 'key1'], ['GET', 'key2']])
  )

  console.log(client.disconnected)
  await client.disconnect()
  console.log(client.disconnected)
}

main()
