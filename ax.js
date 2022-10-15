const axios = require('axios')

!(async () => {
  const s = await axios.get(
    'https://ad.mobadme.jp/cl/click.php?c_id=45484&m_id=3767&t_id=t1&did=&guid=ON&lp_id=1&kwd_id=SEO_PC'
  )
  console.log(s)
})() // datsumo.ameba.jp - official - ginza - calla - cv.html.json

// AXIOSのリクエストが送れるのを直さないと！！
