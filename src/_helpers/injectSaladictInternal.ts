export function injectSaladictInternal (noInjectContentCSS?: boolean) {
  const $scriptSelection = document.createElement('script')
  $scriptSelection.src = './selection.js'
  $scriptSelection.type = 'text/javascript'

  const $scriptContent = document.createElement('script')
  $scriptContent.src = './content.js'
  $scriptContent.type = 'text/javascript'

  const $styleContent = document.createElement('link')
  $styleContent.href = './content.css'
  $styleContent.rel = 'stylesheet'

  const $stylePanel = document.createElement('link')
  $stylePanel.href = './panel-internal.css'
  $stylePanel.rel = 'stylesheet'

  document.body.appendChild($scriptSelection)
  document.body.appendChild($scriptContent)
  if (document.head) {
    if (!noInjectContentCSS) {
      document.head.appendChild($styleContent)
    }
    document.head.appendChild($stylePanel)
  }
}
