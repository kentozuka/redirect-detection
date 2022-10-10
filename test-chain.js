const data = require('./stash.json')

const example = {
  url: 'current url',
  status: 200,
  redirectType: 'client | server',
  headers: '',
  body: 'empty in case of 30x and catch',
  ip: 'ip address',
  port: 'port number'
}

const serverSideRedirect = (status) => {
  let type = ''
  if ([301, 308].includes(status)) return 'permanent'
  if ([302, 303, 307]) return 'temporary'
  return `[${status}]-unknown-serverside-redirect`
}

const clientSideRedirect = (body) => {
  const metaRefreshRex = new RegExp('http-equiv="refresh"')
  if (metaRefreshRex.test(body)) return 'meta'
  const jsRefresh = 'location'
  if (body.includes(jsRefresh)) return 'javascript' // could be wrong

  return 'unknown-clilent-side-redirect'
}

let chain = []

const ex = {
  from: '',
  to: '',
  type: ''
}

function main() {
  // ignores index 0
  for (let i = data.length - 1; i > 0; i--) {
    const pre = data[i - 1]
    const cur = data[i]

    const isClientSideRedirected = pre.status === 200
    const isServerSideRedirected = /30\d/.test(pre.status)
    const type = isServerSideRedirected
      ? serverSideRedirect(cur.status)
      : clientSideRedirect(cur.body)

    if (isClientSideRedirected) {
      const redirected = pre.body.indexOf(cur.url) !== -1
      if (redirected) chain.push(cur.url)
      else if (chain.length) chain = []
    }

    if (isServerSideRedirected) {
      const redirected = pre.headers.location === cur.url
      if (redirected) chain.push(cur.url)
      else if (chain.length) chain = []
    }
  }
}

main()

const reversed = chain.reverse()
reversed.forEach((link) => {
  console.log(link + '\n')
})
