import assert from 'node:assert/strict'
import test from 'node:test'

import { onRequestGet } from '../functions/poem-api/[[path]].js'

test('Cloudflare Pages function proxies poem requests through the ngrok backend', async t => {
  const originalFetch = globalThis.fetch
  t.after(() => {
    globalThis.fetch = originalFetch
  })

  let forwardedUrl
  let forwardedHeaders
  globalThis.fetch = async (url, options) => {
    forwardedUrl = url
    forwardedHeaders = options.headers
    return new Response('{"id":1}', {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const request = new Request(
    'https://shuangpin.devtian.xyz/poem-api/poems/random?type=五言绝句',
    { headers: { Accept: 'application/json' } },
  )
  const response = await onRequestGet({ request })

  assert.equal(
    forwardedUrl.href,
    'https://billy-unflowery-eliana.ngrok-free.dev/api/v1/poems/random?type=%E4%BA%94%E8%A8%80%E7%BB%9D%E5%8F%A5',
  )
  assert.equal(forwardedHeaders.Accept, 'application/json')
  assert.equal(forwardedHeaders['ngrok-skip-browser-warning'], 'true')
  assert.deepEqual(await response.json(), { id: 1 })
})
