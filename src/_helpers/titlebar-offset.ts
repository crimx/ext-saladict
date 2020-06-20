/**
 * Extension API is inconsistent with the window top.
 * Sometimes the titlebar height is included, sometimes not.
 */

import { storage } from './browser-api'
import { timer } from './promise-more'

export interface TitlebarOffset {
  // main window title bar height
  main: number
  // panel window title bar height
  panel: number
}

export async function getTitlebarOffset(): Promise<TitlebarOffset | undefined> {
  return (
    await storage.local.get<{ titlebarOffset?: TitlebarOffset }>(
      'titlebarOffset'
    )
  ).titlebarOffset
}

export function setTitlebarOffset(offset: TitlebarOffset): Promise<void> {
  return storage.local.set({ titlebarOffset: offset })
}

export async function calibrateTitlebarOffset(): Promise<
  TitlebarOffset | undefined
> {
  try {
    const curWin = await browser.windows.getCurrent()
    if (curWin.id == null) return

    const mainWin = await browser.windows.create({ state: 'maximized' })
    const panelWin = await browser.windows.create({
      state: 'maximized',
      type: 'panel'
    })

    if (mainWin?.id == null || panelWin?.id == null) return

    await browser.windows.update(curWin.id, { focused: true })

    await timer(0)

    const main = (await browser.windows.get(mainWin.id)).top
    const panel = (await browser.windows.get(panelWin.id)).top

    browser.windows.remove(mainWin.id)
    browser.windows.remove(panelWin.id)

    if (main == null || panel == null) return

    return { main, panel }
  } catch (e) {
    if (process.env.DEBUG) {
      console.error(e)
    }
  }
}
