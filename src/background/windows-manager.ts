import { message } from '@/_helpers/browser-api'
import { Word } from '@/_helpers/record-manager'

interface WinRect {
  width: number
  height: number
  left: number
  top: number
}

const safeUpdateWindow: typeof browser.windows.update = (...args) =>
  browser.windows.update(...args).catch(console.warn as (m: any) => undefined)

/**
 * Manipulate main window
 */
export class MainWindowsManager {
  /** Main window snapshot */
  private snapshot: browser.windows.Window | null = null

  async takeSnapshot(): Promise<browser.windows.Window | null> {
    this.snapshot = null

    try {
      const win = await browser.windows.getLastFocused({
        windowTypes: ['normal']
      })
      if (win.state !== 'minimized') {
        this.snapshot = win
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

    if (!mainWin || mainWin.id == null) {
      return
    }

    const sidebarWidth =
      (sidebarSnapshot && sidebarSnapshot.width) || window.appConfig.panelWidth

    const updateInfo =
      mainWin.top != null &&
      mainWin.left != null &&
      mainWin.width != null &&
      mainWin.height != null
        ? {
            top: mainWin.top,
            left: side === 'right' ? mainWin.left : mainWin.left + sidebarWidth,
            width: mainWin.width - sidebarWidth,
            height: mainWin.height
          }
        : {
            top: 0,
            left: side === 'right' ? 0 : sidebarWidth,
            width: window.screen.availWidth - sidebarWidth,
            height: window.screen.availHeight
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
      await safeUpdateWindow(this.snapshot.id, {
        top: this.snapshot.top,
        left: this.snapshot.left,
        width: this.snapshot.width,
        height: this.snapshot.height
      })
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

  async create(preload?: Word): Promise<void> {
    this.isSidebar = false

    let wordString = ''
    try {
      if (!preload) {
        if (window.appConfig.tripleCtrlPreload === 'selection') {
          const tab = (
            await browser.tabs.query({
              active: true,
              lastFocusedWindow: true
            })
          )[0]
          if (tab && tab.id) {
            preload = await message.send<'PRELOAD_SELECTION'>(tab.id, {
              type: 'PRELOAD_SELECTION'
            })
          }
        }
      }
      if (preload) {
        wordString = '&word=' + encodeURIComponent(JSON.stringify(preload))
      }
    } catch (e) {}

    const qsPanelWin = await browser.windows
      .create({
        ...(window.appConfig.tripleCtrlSidebar
          ? await this.getSidebarRect(window.appConfig.tripleCtrlSidebar)
          : this.getDefaultRect()),
        type: 'popup',
        url: browser.runtime.getURL(
          `quick-search.html?sidebar=${window.appConfig.tripleCtrlSidebar}${wordString}`
        )
      })
      .catch((err: Error) => {
        browser.notifications.create({
          type: 'basic',
          iconUrl: browser.runtime.getURL(`assets/icon-128.png`),
          title: `Saladict`,
          message: err.message,
          priority: 2,
          eventTime: Date.now() + 5000
        })
      })

    if (qsPanelWin && qsPanelWin.id) {
      this.qsPanelId = qsPanelWin.id

      if (window.appConfig.tripleCtrlSidebar) {
        this.isSidebar = true
        await this.mainWindowsManager.makeRoomForSidebar(
          window.appConfig.tripleCtrlSidebar,
          qsPanelWin
        )
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
        top: this.snapshot.top,
        left: this.snapshot.left,
        width: this.snapshot.width,
        height: this.snapshot.height
      })
    } else if (this.qsPanelId != null) {
      await safeUpdateWindow(this.qsPanelId, {
        focused: true,
        ...this.getDefaultRect()
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

  getDefaultRect(): WinRect {
    const { tripleCtrlLocation, tripleCtrlHeight } = window.appConfig

    let qsPanelLeft = 10
    let qsPanelTop = 30
    const qsPanelWidth = window.appConfig.panelWidth
    const qsPanelHeight = window.appConfig.tripleCtrlHeight

    switch (tripleCtrlLocation) {
      case 'CENTER':
        qsPanelLeft = (window.screen.availWidth - qsPanelWidth) / 2
        qsPanelTop = (window.screen.availHeight - tripleCtrlHeight) / 2
        break
      case 'TOP':
        qsPanelLeft = (window.screen.availWidth - qsPanelWidth) / 2
        qsPanelTop = 30
        break
      case 'RIGHT':
        qsPanelLeft = window.screen.availWidth - qsPanelWidth - 30
        qsPanelTop = (window.screen.availHeight - tripleCtrlHeight) / 2
        break
      case 'BOTTOM':
        qsPanelLeft = (window.screen.availWidth - qsPanelWidth) / 2
        qsPanelTop = window.screen.availHeight - qsPanelHeight - 10
        break
      case 'LEFT':
        qsPanelLeft = 10
        qsPanelTop = (window.screen.availHeight - tripleCtrlHeight) / 2
        break
      case 'TOP_LEFT':
        qsPanelLeft = 10
        qsPanelTop = 30
        break
      case 'TOP_RIGHT':
        qsPanelLeft = window.screen.availWidth - qsPanelWidth - 30
        qsPanelTop = 30
        break
      case 'BOTTOM_LEFT':
        qsPanelLeft = 10
        qsPanelTop = window.screen.availHeight - qsPanelHeight - 10
        break
      case 'BOTTOM_RIGHT':
        qsPanelLeft = window.screen.availWidth - qsPanelWidth - 30
        qsPanelTop = window.screen.availHeight - qsPanelHeight - 10
        break
    }

    // coords must be integer
    // plus offset of other screen
    return {
      top: Math.round(qsPanelTop + (window.screen['availTop'] || 0)),
      left: Math.round(qsPanelLeft + (window.screen['availLeft'] || 0)),
      width: Math.round(qsPanelWidth),
      height: Math.round(qsPanelHeight)
    }
  }

  async getSidebarRect(side: 'left' | 'right'): Promise<WinRect> {
    const panelWidth =
      (this.snapshot && this.snapshot.width) || window.appConfig.panelWidth
    const mainWin = await this.mainWindowsManager.takeSnapshot()
    return mainWin &&
      mainWin.top != null &&
      mainWin.left != null &&
      mainWin.width != null &&
      mainWin.height != null
      ? // coords must be integer
        {
          top: Math.round(mainWin.top),
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
            side === 'right' ? window.screen.availWidth - panelWidth : 0
          ),
          width: Math.round(panelWidth),
          height: Math.round(window.screen.availHeight)
        }
  }
}
