import React, { PropsWithChildren, useMemo, useState } from 'react'
import { useIsomorphicLayoutEffect } from 'react-use'

export type StrElmProps<
  T extends keyof JSX.IntrinsicElements = keyof JSX.IntrinsicElements
> = {
  tag?: T
  html: string
} & JSX.IntrinsicElements[T]

export const StrElm = <
  T extends keyof JSX.IntrinsicElements = keyof JSX.IntrinsicElements
>(
  props: PropsWithChildren<StrElmProps<T>>
) => {
  const { tag = 'div', html, ...restProps } = props
  const child = useMemo<DocumentFragment | null>(() => {
    try {
      const fragment = document.createDocumentFragment()
      const doc = new DOMParser().parseFromString(html, 'text/html')
      Array.from(doc.body.childNodes).forEach(el => {
        fragment.appendChild(el)
      })
      return fragment
    } catch (e) {
      if (process.env.DEBUG) {
        console.error(e)
      }
    }
    return null
  }, [html])

  const [node, setNode] = useState<HTMLElement | null>(null)

  useIsomorphicLayoutEffect(() => {
    if (child && node) {
      while (node.childNodes.length > 0) {
        node.childNodes[0].remove()
      }
      node.appendChild(child)
    }
  }, [child, node])

  return React.createElement(tag, { ...restProps, ref: setNode })
}
