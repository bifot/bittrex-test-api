const api = require('node.bittrex.api')
const { key, secret } = require('./config')

api.options({
  apikey: key,
  apisecret: secret
})

api.getbalances((body, err) => {
  if (err || !body.success) {
    return console.error(err)
  }

  const items = body.result
    .filter(item => item.Balance)
    .map((item) => {
      return new Promise((resolve, reject) => {
        return api.getticker({
          market: `BTC-${item.Currency}`
        }, (body, err) => {
          if (!err && body) {
            resolve({
              currency: item.Currency,
              balance: item.Balance,
              balanceBTC: item.Balance * body.result.Bid
            })
          } else {
            reject(err)
          }
        })
      })
    })
    // Deleting catch of promises for get the resolved data
    .map(item => item.catch(() => undefined))

  return Promise.all(items)
    .then((body) => {
      const items = body.filter(item => item !== undefined)
      const allCurrencies = items
        .map(item => item.balanceBTC)
        .reduce((a, b) => a + b)

      console.log(`You have a ${allCurrencies} BTC.`)
    })
})
