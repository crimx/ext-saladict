import { openURL } from '@/_helpers/browser-api'

export async function copyTextToClipboard(text: string): Promise<void> {
  if (
    !(await browser.permissions.contains({ permissions: ['clipboardWrite'] }))
  ) {
    openURL(
      '/options.html?menuselected=Permissions&missing_permission=clipboardWrite',
      true
    )
    return
  }

  const copyFrom = document.createElement('textarea')
  copyFrom.textContent = text
  document.body.appendChild(copyFrom)
  copyFrom.select()
  document.execCommand('copy')
  copyFrom.blur()
  document.body.removeChild(copyFrom)
}

export async function getTextFromClipboard(): Promise<string> {
  if (
    !(await browser.permissions.contains({ permissions: ['clipboardRead'] }))
  ) {
    openURL(
      '/options.html?menuselected=Permissions&missing_permission=clipboardRead',
      true
    )
    return ''
  }

  if (process.env.NODE_ENV === 'development') {
    return 'clipboard content'
  } else {
    let el = document.getElementById(
      'saladict-paste'
    ) as HTMLTextAreaElement | null
    if (!el) {
      el = document.createElement('textarea')
      el.id = 'saladict-paste'
      document.body.appendChild(el)
    }
    el.value = ''
    el.focus()
    document.execCommand('paste')
    return el.value || ''
  }
}
