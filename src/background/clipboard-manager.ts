export function copyTextToClipboard(text: string): void {
  const copyFrom = document.createElement('textarea')
  copyFrom.textContent = text
  document.body.appendChild(copyFrom)
  copyFrom.select()
  document.execCommand('copy')
  copyFrom.blur()
  document.body.removeChild(copyFrom)
}

export function getTextFromClipboard(): string {
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
