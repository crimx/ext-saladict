const manifest = browser.runtime.getManifest()
if (manifest.content_scripts) {
  for (const script of manifest.content_scripts) {
    if (script.js) {
      for (const js of script.js) {
        const $script = document.createElement('script')
        $script.type = 'text/javascript'
        $script.src = js[0] === '/' ? js : `/${js}`
        document.body.appendChild($script)
      }
    }
    if (script.css) {
      for (const css of script.css) {
        const $link = document.createElement('link')
        $link.rel = 'stylesheet'
        $link.href = css[0] === '/' ? css : `/${css}`
        document.head.appendChild($link)
      }
    }
  }
}
