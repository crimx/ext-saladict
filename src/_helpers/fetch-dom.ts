type Options = {
  method?: string
  body?: null | Document | Blob | BufferSource | FormData | URLSearchParams | ReadableStream | USVString
}

export default function fetchDom (url: string, options?: Options): Promise<Document> {
  url = encodeURI(url.replace('\n', ' '))

  const method = (options && options.method && options.method.toLowerCase() === 'post') ? 'POST' : 'GET'
  const body = options && options.body

  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest()
    xhr.onload = () => {
      if (!xhr.responseXML) {
        return reject(new Error('Empty body, Response code ' + xhr.status))
      }
      resolve(xhr.responseXML)
    }
    xhr.onerror = reject
    xhr.open(method, url)
    xhr.responseType = 'document'
    return body ? xhr.send(body) : xhr.send()
  })
}
