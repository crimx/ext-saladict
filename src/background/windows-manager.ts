import { message } from '@/_helpers/browser-api'

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
    try {
      return (this.snapshot = await browser.windows.getLastFocused({
        windowTypes: ['normal']
      }))
    } catch (e) {
      console.warn(e)
    }

    return (this.snapshot = null)
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

  async create(): Promise<void> {
    this.isSidebar = false

    let wordString = ''
    if (window.appConfig.tripleCtrlPreload === 'selection') {
      const tab = (await browser.tabs.query({
        active: true,
        lastFocusedWindow: true
      }))[0]
      if (tab && tab.id) {
        const word = await message.send<'PRELOAD_SELECTION'>(tab.id, {
          type: 'PRELOAD_SELECTION'
        })
        if (word) {
          try {
            wordString = '&word=' + encodeURIComponent(JSON.stringify(word))
          } catch (e) {}
        }
      }
    }

    const qsPanelWin = await browser.windows.create({
      ...(window.appConfig.tripleCtrlSidebar
        ? await this.getSidebarRect(window.appConfig.tripleCtrlSidebar)
        : this.getDefaultRect()),
      type: 'popup',
      url: browser.runtime.getURL(
        `quick-search.html?sidebar=${window.appConfig.tripleCtrlSidebar}${wordString}`
      )
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
    let qsPanelWidth = window.appConfig.panelWidth
    let qsPanelHeight = window.appConfig.tripleCtrlHeight

    switch (tripleCtrlLocation) {
      case 'CENTER':
        qsPanelLeft = (window.screen.width - qsPanelWidth) / 2
        qsPanelTop = (window.screen.height - tripleCtrlHeight) / 2
        break
      case 'TOP':
        qsPanelLeft = (window.screen.width - qsPanelWidth) / 2
        qsPanelTop = 30
        break
      case 'RIGHT':
        qsPanelLeft = window.screen.width - qsPanelWidth - 30
        qsPanelTop = (window.screen.height - tripleCtrlHeight) / 2
        break
      case 'BOTTOM':
        qsPanelLeft = (window.screen.width - qsPanelWidth) / 2
        qsPanelTop = window.screen.height - qsPanelHeight - 10
        break
      case 'LEFT':
        qsPanelLeft = 10
        qsPanelTop = (window.screen.height - tripleCtrlHeight) / 2
        break
      case 'TOP_LEFT':
        qsPanelLeft = 10
        qsPanelTop = 30
        break
      case 'TOP_RIGHT':
        qsPanelLeft = window.screen.width - qsPanelWidth - 30
        qsPanelTop = 30
        break
      case 'BOTTOM_LEFT':
        qsPanelLeft = 10
        qsPanelTop = window.screen.height - qsPanelHeight - 10
        break
      case 'BOTTOM_RIGHT':
        qsPanelLeft = window.screen.width - qsPanelWidth - 30
        qsPanelTop = window.screen.height - qsPanelHeight - 10
        break
    }

    return {
      top: qsPanelTop,
      left: qsPanelLeft,
      width: qsPanelWidth,
      height: qsPanelHeight
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
      ? {
          top: mainWin.top,
          left:
            side === 'right'
              ? Math.max(mainWin.width - panelWidth, panelWidth)
              : mainWin.left,
          width: panelWidth,
          height: mainWin.height
        }
      : {
          top: 0,
          left: side === 'right' ? window.screen.availWidth - panelWidth : 0,
          width: panelWidth,
          height: window.screen.availHeight
        }
  }
}
