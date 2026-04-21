import { message, storage } from '@/_helpers/browser-api'
import { Word } from '@/_helpers/record-manager'
import { isFirefox } from '@/_helpers/saladict'
import { getTitlebarOffset } from '@/_helpers/titlebar-offset'
import { getBackgroundStateSnapshot, initBackgroundState } from './state'

interface WinRect {
  width: number
  height: number
  left: number
  top: number
}

const safeUpdateWindow: typeof browser.windows.update = (...args) =>
  browser.windows.update(...args).catch(console.warn as (m: any) => undefined)

async function getAvailableScreenArea(
  reference?: browser.windows.Window | null
) {
  if (typeof window !== 'undefined' && window.screen) {
    return {
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight,
      availLeft: window.screen['availLeft'] || 0,
      availTop: window.screen['availTop'] || 0
    }
  }

  const win =
    reference ||
    (await browser.windows
      .getLastFocused({ windowTypes: ['normal'] })
      .catch(() => null))

  return {
    availWidth: win && win.width ? win.width : 1280,
    availHeight: win && win.height ? win.height : 800,
    availLeft: win && win.left ? win.left : 0,
    availTop: win && win.top ? win.top : 0
  }
}

/**
 * Manipulate main window
 */
export class MainWindowsManager {
  /** Main window snapshot */
  snapshot: browser.windows.Window | null = null

  async correctTop(originTop?: number) {
    if (!originTop) return originTop

    const offset = await getTitlebarOffset()
    if (!offset) return originTop

    return originTop - offset.main
  }

  async focus(): Promise<void> {
    if (this.snapshot && this.snapshot.id != null) {
      await safeUpdateWindow(this.snapshot.id, { focused: true })
    }
  }

  async takeSnapshot(): Promise<browser.windows.Window | null> {
    this.snapshot = null

    try {
      const win = await browser.windows.getLastFocused({
        windowTypes: ['normal']
      })
      if (win.focused && win.type === 'normal' && win.state !== 'minimized') {
        this.snapshot = win
      } else if (isFirefox) {
        // Firefox does not support windowTypes in getLastFocused
        const wins = (await browser.windows.getAll()).filter(
          win =>
            win.focused && win.type === 'normal' && win.state !== 'minimized'
        )
        if (wins.length === 1) {
          this.snapshot = wins[0]
        } else {
          const focusedWins = wins.filter(win => win.focused)
          if (focusedWins.length === 1) {
            this.snapshot = focusedWins[0]
          }
        }
      }
    } catch (e) {
      console.warn(e)
    }

    return this.snapshot
  }

  destroySnapshot(): void {
    this.snapshot = null
  }

  async makeRoomForSidebar(
    side: 'left' | 'right',
    sidebarSnapshot: browser.windows.Window | null
  ): Promise<void> {
    const mainWin = this.snapshot
    const {
      appConfig: { panelWidth }
    } = await initBackgroundState()

    if (!mainWin || mainWin.id == null) {
      return
    }

    const sidebarWidth =
      (sidebarSnapshot && sidebarSnapshot.width) || panelWidth
    const screenArea = await getAvailableScreenArea(mainWin)

    const updateInfo =
      mainWin.top != null &&
      mainWin.left != null &&
      mainWin.width != null &&
      mainWin.height != null
        ? {
            top: await this.correctTop(mainWin.top),
            left: side === 'right' ? mainWin.left : mainWin.left + sidebarWidth,
            width: mainWin.width - sidebarWidth,
            height: mainWin.height,
            state: 'normal' as 'normal'
          }
        : {
            top: 0,
            left: side === 'right' ? 0 : sidebarWidth,
            width: screenArea.availWidth - sidebarWidth,
            height: screenArea.availHeight,
            state: 'normal' as 'normal'
          }

    if (side === 'right') {
      // fix a chrome bug by moving 1 extra pixal then to 0
      await safeUpdateWindow(mainWin.id, {
        ...updateInfo,
        left: updateInfo.left + 1
      })
    }

    await safeUpdateWindow(mainWin.id, updateInfo)
  }

  async restoreSnapshot(): Promise<void> {
    if (this.snapshot && this.snapshot.id != null) {
      await safeUpdateWindow(
        this.snapshot.id,
        this.snapshot.state === 'normal'
          ? {
              top: await this.correctTop(this.snapshot.top),
              left: this.snapshot.left,
              width: this.snapshot.width,
              height: this.snapshot.height
            }
          : { state: this.snapshot.state }
      )
    }
  }
}

/**
 * Manipulate Standalone Quick Search Panel
 */
export class QsPanelManager {
  private qsPanelId: number | null = null
  private snapshot: browser.windows.Window | null = null
  private isSidebar: boolean = false
  private mainWindowsManager = new MainWindowsManager()

  async correctTop(originTop?: number) {
    if (!originTop) return originTop

    const offset = await getTitlebarOffset()
    if (!offset) return originTop

    return originTop - offset.panel
  }

  /**
   * @param preload force preload word. otherwise let the panel decide.
   */
  async create(preload?: Word): Promise<void> {
    this.isSidebar = false

    let wordString = ''
    let lastTabString = ''

    if (preload) {
      try {
        wordString = '&word=' + encodeURIComponent(JSON.stringify(preload))
      } catch (error) {
        if (process.env.DEBUG) {
          console.error(error)
        }
      }
    } else {
      const {
        appConfig: { qsPreload }
      } = await initBackgroundState()
      if (qsPreload === 'selection') {
        const tab = (
          await browser.tabs.query({
            active: true,
            lastFocusedWindow: true
          })
        )[0]
        if (tab && tab.id) {
          lastTabString = '&lastTab=' + tab.id
        }
      }
    }

    await this.mainWindowsManager.takeSnapshot()

    const {
      appConfig: { qssaSidebar, qssaRectMemo, qsFocus }
    } = getBackgroundStateSnapshot()
    const qsPanelRect = qssaSidebar
      ? await this.getSidebarRect(qssaSidebar)
      : (qssaRectMemo && (await this.getStorageRect())) ||
        (await this.getDefaultRect())

    let qsPanelWin: browser.windows.Window | undefined

    try {
      qsPanelWin = await browser.windows.create({
        ...qsPanelRect,
        type: 'popup',
        url: browser.runtime.getURL(
          `quick-search.html?sidebar=${qssaSidebar}${wordString}${lastTabString}`
        )
      })
    } catch (err) {
      browser.notifications.create({
        type: 'basic',
        iconUrl: browser.runtime.getURL(`assets/icon-128.png`),
        title: `Saladict`,
        message: err.message,
        priority: 2,
        eventTime: Date.now() + 5000
      })
    }

    if (qsPanelWin && qsPanelWin.id) {
      if (isFirefox) {
        // Firefox needs an extra push
        safeUpdateWindow(qsPanelWin.id, qsPanelRect)
      }

      this.qsPanelId = qsPanelWin.id

      if (qssaSidebar) {
        this.isSidebar = true
        await this.mainWindowsManager.makeRoomForSidebar(
          qssaSidebar,
          qsPanelWin
        )
      }

      if (!qsFocus) {
        await this.mainWindowsManager.focus()
      }

      // notify all tabs
      ;(await browser.tabs.query({})).forEach(tab => {
        if (tab.id && tab.windowId !== this.qsPanelId) {
          message.send(tab.id, {
            type: 'QS_PANEL_CHANGED',
            payload: this.qsPanelId != null
          })
        }
      })
    }
  }

  async getWin(): Promise<browser.windows.Window | null> {
    if (!this.qsPanelId) {
      return null
    }
    return browser.windows.get(this.qsPanelId).catch(() => null)
  }

  async destroy(): Promise<void> {
    ;(await browser.tabs.query({})).forEach(tab => {
      if (tab.id && tab.windowId !== this.qsPanelId) {
        message.send(tab.id, {
          type: 'QS_PANEL_CHANGED',
          payload: false
        })
      }
    })

    this.qsPanelId = null
    this.isSidebar = false
    this.destroySnapshot()
    await this.mainWindowsManager.restoreSnapshot()
    this.mainWindowsManager.destroySnapshot()
  }

  isQsPanel(winId?: number): boolean {
    return winId != null && winId === this.qsPanelId
  }

  async hasCreated(): Promise<boolean> {
    const win = await this.getWin()
    if (!win) {
      this.qsPanelId = null
    }
    return !!win
  }

  async focus(): Promise<void> {
    if (this.qsPanelId != null) {
      await safeUpdateWindow(this.qsPanelId, { focused: true })
      const [tab] = await browser.tabs.query({ windowId: this.qsPanelId })
      if (tab && tab.id) {
        await message.send(tab.id, { type: 'QS_PANEL_FOCUSED' })
      }
    }
  }

  async takeSnapshot(): Promise<void> {
    if (this.qsPanelId != null) {
      this.snapshot = await browser.windows
        .get(this.qsPanelId)
        .catch(() => null)
    }
  }

  destroySnapshot(): void {
    this.snapshot = null
  }

  async restoreSnapshot(): Promise<void> {
    // restore main window first so that it will be at the bottom
    await this.mainWindowsManager.restoreSnapshot()
    if (this.snapshot != null && this.snapshot.id != null) {
      await safeUpdateWindow(this.snapshot.id, {
        top: await this.correctTop(this.snapshot.top),
        left: this.snapshot.left,
        width: this.snapshot.width,
        height: this.snapshot.height
      })
    } else if (this.qsPanelId != null) {
      await safeUpdateWindow(this.qsPanelId, {
        focused: true,
        ...(await this.getDefaultRect())
      })
    }
    this.destroySnapshot()
  }

  async moveToSidebar(side: 'left' | 'right'): Promise<void> {
    if (this.qsPanelId != null) {
      await this.takeSnapshot()
      await safeUpdateWindow(this.qsPanelId, await this.getSidebarRect(side))
      await this.mainWindowsManager.makeRoomForSidebar(side, this.snapshot)
    }
  }

  async toggleSidebar(side: 'left' | 'right'): Promise<void> {
    if (!(await this.hasCreated())) {
      return
    }

    if (this.isSidebar) {
      await this.restoreSnapshot()
    } else {
      await this.moveToSidebar(side)
    }

    this.isSidebar = !this.isSidebar
  }

  async getDefaultRect(): Promise<WinRect> {
    const {
      appConfig: { qsLocation, qssaHeight, panelWidth }
    } = getBackgroundStateSnapshot()
    const screenArea = await getAvailableScreenArea(
      this.mainWindowsManager.snapshot
    )

    let qsPanelLeft = 10
    let qsPanelTop = 30
    const qsPanelWidth = panelWidth
    const qsPanelHeight = qssaHeight

    switch (qsLocation) {
      case 'CENTER':
        qsPanelLeft = (screenArea.availWidth - qsPanelWidth) / 2
        qsPanelTop = (screenArea.availHeight - qssaHeight) / 2
        break
      case 'TOP':
        qsPanelLeft = (screenArea.availWidth - qsPanelWidth) / 2
        qsPanelTop = 30
        break
      case 'RIGHT':
        qsPanelLeft = screenArea.availWidth - qsPanelWidth - 30
        qsPanelTop = (screenArea.availHeight - qssaHeight) / 2
        break
      case 'BOTTOM':
        qsPanelLeft = (screenArea.availWidth - qsPanelWidth) / 2
        qsPanelTop = screenArea.availHeight - qsPanelHeight - 10
        break
      case 'LEFT':
        qsPanelLeft = 10
        qsPanelTop = (screenArea.availHeight - qssaHeight) / 2
        break
      case 'TOP_LEFT':
        qsPanelLeft = 10
        qsPanelTop = 30
        break
      case 'TOP_RIGHT':
        qsPanelLeft = screenArea.availWidth - qsPanelWidth - 30
        qsPanelTop = 30
        break
      case 'BOTTOM_LEFT':
        qsPanelLeft = 10
        qsPanelTop = screenArea.availHeight - qsPanelHeight - 10
        break
      case 'BOTTOM_RIGHT':
        qsPanelLeft = screenArea.availWidth - qsPanelWidth - 30
        qsPanelTop = screenArea.availHeight - qsPanelHeight - 10
        break
    }

    // coords must be integer
    // plus offset of other screen
    return {
      top: Math.round(qsPanelTop + screenArea.availTop),
      left: Math.round(qsPanelLeft + screenArea.availLeft),
      width: Math.round(qsPanelWidth),
      height: Math.round(qsPanelHeight)
    }
  }

  /** get saved panel rect */
  async getStorageRect(): Promise<WinRect | null> {
    const { qssaRect } = await storage.local.get<{ qssaRect: WinRect }>(
      'qssaRect'
    )
    if (!qssaRect) return null
    return {
      ...qssaRect,
      top: (await this.correctTop(qssaRect.top)) || 0
    }
  }

  async getSidebarRect(side: 'left' | 'right'): Promise<WinRect> {
    const {
      appConfig: { panelWidth: defaultPanelWidth }
    } = await initBackgroundState()
    const panelWidth =
      (this.snapshot && this.snapshot.width) || defaultPanelWidth
    const mainWin = this.mainWindowsManager.snapshot
    const screenArea = await getAvailableScreenArea(mainWin)
    return mainWin &&
      mainWin.state === 'normal' &&
      mainWin.top != null &&
      mainWin.left != null &&
      mainWin.width != null &&
      mainWin.height != null
      ? // coords must be integer
        {
          top: Math.round(
            (await this.mainWindowsManager.correctTop(mainWin.top)) || 0
          ),
          left: Math.round(
            side === 'right'
              ? Math.max(mainWin.width - panelWidth, panelWidth)
              : mainWin.left
          ),
          width: Math.round(panelWidth),
          height: Math.round(mainWin.height)
        }
      : {
          top: 0,
          left: Math.round(
            side === 'right' ? screenArea.availWidth - panelWidth : 0
          ),
          width: Math.round(panelWidth),
          height: Math.round(screenArea.availHeight)
        }
  }
}
