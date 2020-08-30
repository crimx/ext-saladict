export function setupCaiyunTrsBackend() {
  browser.runtime.onMessage.addListener(msg => {
    if (msg.contentScriptQuery === 'fetchUrl') {
      const requestInit: RequestInit = {
        method: msg.method || 'GET',
        credentials: 'include',
        headers: {
          ...(msg.headers || {}),
          'content-type': 'application/json'
        }
      }

      if (msg.data) {
        try {
          requestInit.body = JSON.stringify(msg.data)
        } catch (error) {
          if (process.env.DEBUG) {
            console.error('Caiyun trs message data error:', error)
          }
        }
      }

      return fetch(msg.url, requestInit)
        .then(response => response.text())
        .then(text => ({ status: 'ok', data: text }))
        .catch(error => {
          if (process.env.DEBUG) {
            console.error('Caiyun trs requestAuthURL error:', error)
          }
          return { status: 'error', error: error }
        })
    }
  })
}
