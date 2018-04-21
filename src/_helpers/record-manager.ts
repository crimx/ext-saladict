/**
 * Abstracted layer for storing large amount of word records.
 */

import { SelectionInfo } from '@/_helpers/selection'

/** TODO */
export function isInNotebook (info: SelectionInfo): Promise<boolean> {
  return Promise.resolve(true)
}

/** TODO */
export function addToNotebook (info: SelectionInfo): Promise<any> {
  return Promise.resolve()
}

/** TODO */
export function removeFromNotebook (info: SelectionInfo): Promise<any> {
  return Promise.resolve()
}
