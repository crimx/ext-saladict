/**
 * xhtml returns small case
 */
export function isTagName(node: Node, tagName: string): boolean {
  return (
    ((node as HTMLElement).tagName || '').toLowerCase() ===
    tagName.toLowerCase()
  )
}
