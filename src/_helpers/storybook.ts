/**
 * Workaround for {@link https://github.com/storybookjs/storybook/issues/729}
 */
export function withLocalStyle(style: object | string) {
  return fn => {
    const $style = document.createElement('style')
    $style.innerHTML = style.toString()
    document.getElementById('root')!.appendChild($style)
    return fn()
  }
}
