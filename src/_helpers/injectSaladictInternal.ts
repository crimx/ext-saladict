import { createActiveProfileStream } from './profile-manager'

export function injectSaladictInternal (noInjectContentCSS?: boolean) {
  if (process.env.NODE_ENV === 'development') {
    return
  }

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

  const selectedDicts = new Set()
  createActiveProfileStream().subscribe(profile => {
    profile.dicts.selected.forEach(dict => {
      if (!selectedDicts.has(dict)) {
        const $styleDict = document.createElement('link')
        $styleDict.href = `./dicts/internal/${dict}.css`
        $styleDict.rel = 'stylesheet'
        if (document.head) {
          document.head.appendChild($styleDict)
        } else {
          document.body.appendChild($styleDict)
        }

        selectedDicts.add(dict)
      }
    })
  })
}
