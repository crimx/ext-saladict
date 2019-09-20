import memoizeOne from 'memoize-one'

export const getScrollbarWidth = memoizeOne(() => {
  if (typeof document === 'undefined') {
    return 0
  }

  const strut = document.createElement('div')
  const strutStyle = strut.style

  strutStyle.position = 'fixed'
  strutStyle.left = '0'
  strutStyle.overflowY = 'scroll'
  strutStyle.visibility = 'hidden'

  document.body.appendChild(strut)

  const width = strut.getBoundingClientRect().right

  strut.remove()

  return width
})

export default getScrollbarWidth
