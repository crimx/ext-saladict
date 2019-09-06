export function injectSaladictInternal() {
  if (process.env.NODE_ENV !== 'production') {
    return
  }

  const $scriptSelection = document.createElement('script')
  $scriptSelection.src = './selection.js'
  $scriptSelection.type = 'text/javascript'

  const $scriptContent = document.createElement('script')
  $scriptContent.src = './content.js'
  $scriptContent.type = 'text/javascript'

  document.body.appendChild($scriptSelection)
  document.body.appendChild($scriptContent)
}
