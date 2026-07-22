const POEM_API_ORIGIN = 'https://billy-unflowery-eliana.ngrok-free.dev'

export async function onRequestGet({ request }) {
  const requestUrl = new URL(request.url)
  const apiPath = requestUrl.pathname.replace(/^\/poem-api\/?/, '')
  const apiUrl = new URL(`/api/v1/${apiPath}`, POEM_API_ORIGIN)
  apiUrl.search = requestUrl.search

  return fetch(apiUrl, {
    headers: {
      Accept: request.headers.get('Accept') || 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
  })
}
