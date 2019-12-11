import { message } from '@/_helpers/browser-api'

interface WinRect {
  width: number
  height: number
  left: number
  top: number
}

/**
 * Manipulate main window
 */
export class MainWindowsManager {
  /** Main window snapshot */
  private snapshot: browser.windows.Window | null = null

  async takeSnapshot(): Promise<void> {
    this.snapshot = await browser.windows.getLastFocused()
  }

  destroySnapshot(): void {
    this.snapshot = null
  }

  async makeRoomForSidebar(): Promise<void> {
    if (!this.snapshot || this.snapshot.id == null) {
      return
    }

    await browser.windows.update(this.snapshot.id, {
      state: 'normal',
      top: 0,
      // fix a chrome bug by moving 1 extra pixal then to 0
      left:
        window.appConfig.tripleCtrlSidebar === 'right'
          ? 1
          : window.appConfig.panelWidth,
      width: window.screen.availWidth - window.appConfig.panelWidth,
      height: window.screen.availHeight
    })

    // fix a chrome bug by moving 1 extra pixal then to 0
    if (window.appConfig.tripleCtrlSidebar === 'right') {
      await browser.windows.update(this.snapshot.id, {
        state: 'normal',
        top: 0,
        left: 0,
        width: window.screen.availWidth - window.appConfig.panelWidth,
        height: window.screen.availHeight
      })
    }
  }

  async restoreSnapshot(): Promise<void> {
    if (!this.snapshot || this.snapshot.id == null) {
      return
    }

    await browser.windows.update(this.snapshot.id, {
      state: this.snapshot.state,
      top: this.snapshot.top,
      left: this.snapshot.left,
      width: this.snapshot.width,
      height: this.snapshot.height
    })
  }
}

/**
 * Manipulate Standalone Quick Search Panel
 */
export class QsPanelManager {
  private qsPanelId: number | null = null
  private snapshot: browser.windows.Window | null = null

  async create(): Promise<void> {
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
        ? this.getSidebarRect()
        : this.getDefaultRect()),
      type: 'popup',
      url: browser.runtime.getURL(
        `quick-search.html?sidebar=${window.appConfig.tripleCtrlSidebar}${wordString}`
      )
    })

    if (qsPanelWin && qsPanelWin.id) {
      this.qsPanelId = qsPanelWin.id
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

  destroy(): void {
    this.qsPanelId = null
    this.destroySnapshot()
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
      await browser.windows.update(this.qsPanelId, { focused: true })
      const [tab] = await browser.tabs.query({ windowId: this.qsPanelId })
      if (tab && tab.id) {
        await message.send(tab.id, { type: 'QS_PANEL_FOCUSED' })
      }
    }
  }

  async takeSnapshot(): Promise<void> {
    if (this.qsPanelId != null) {
      this.snapshot = await browser.windows.get(this.qsPanelId)
    }
  }

  destroySnapshot(): void {
    this.snapshot = null
  }

  async restoreSnapshot(): Promise<void> {
    if (this.snapshot != null && this.snapshot.id != null) {
      await browser.windows.update(this.snapshot.id, {
        focused: true,
        state: this.snapshot.state,
        top: this.snapshot.top,
        left: this.snapshot.left,
        width: this.snapshot.width,
        height: this.snapshot.height
      })
    } else if (this.qsPanelId != null) {
      await browser.windows.update(this.qsPanelId, {
        state: 'normal',
        focused: true,
        ...this.getDefaultRect()
      })
    }
  }

  async moveToSidebar(): Promise<void> {
    if (this.qsPanelId != null) {
      await browser.windows.update(this.qsPanelId, {
        state: 'normal',
        focused: true,
        ...this.getSidebarRect()
      })
    }
  }

  /**
   * Rough matching win rect
   */
  async isSidebar(): Promise<boolean> {
    if (this.qsPanelId == null) {
      return false
    }

    const win = await this.getWin()

    if (!win) {
      return false
    }

    // Reverse comparing in case undefined
    return !(
      Math.abs(win.top!) > 50 || // include menu bar height
      (Math.abs(win.left!) > 5 &&
        Math.abs(win.left! + win.width! - window.screen.availWidth) > 5)
    )
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

  getSidebarRect(): WinRect {
    return {
      top: 0,
      left:
        window.appConfig.tripleCtrlSidebar === 'right'
          ? window.screen.availWidth - window.appConfig.panelWidth
          : 0,
      width: window.appConfig.panelWidth,
      height: window.screen.availHeight
    }
  }
}
