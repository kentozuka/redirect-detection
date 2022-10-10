const axios = require('axios')

!(async () => {
  const res = await axios.get(
    'https://t.felmat.net/fmcl?ak=Y4062W.1.Z102783N.U84117N'
  )
  console.log(res)
})()
