import { Word } from '@/_helpers/record-manager'
import { message } from '@/_helpers/browser-api'

/**
 * Manipulate main window
 */
export class MainWindowsManager {
  /** Main window snapshot */
  private snapshot: browser.windows.Window | null = null

  async takeSnapshot() {
    this.snapshot = await browser.windows.getLastFocused()
  }

  destroySnapshot() {
    this.snapshot = null
  }

  async makeRoomForSidebar(
    sidebarPosition: '' | 'left' | 'right',
    sidebarWidth: number
  ) {
    if (!this.snapshot || this.snapshot.id == null) {
      return
    }

    await browser.windows.update(this.snapshot.id, {
      state: 'normal',
      top: 0,
      // fix a chrome bug by moving 1 extra pixal then to 0
      left: sidebarPosition === 'left' ? sidebarWidth : 1,
      width: window.screen.availWidth - sidebarWidth,
      height: window.screen.availHeight
    })

    // fix a chrome bug by moving 1 extra pixal then to 0
    if (sidebarPosition === 'right') {
      await browser.windows.update(this.snapshot.id, {
        state: 'normal',
        top: 0,
        left: 0,
        width: window.screen.availWidth - sidebarWidth,
        height: window.screen.availHeight
      })
    }
  }

  async restoreSnapshot() {
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

export class QsPanelManager {
  private qsPanelId: number | null = null
  private snapshot: browser.windows.Window | null = null

  async create(
    rect: {
      width: number
      height: number
      left: number
      top: number
    },
    sidebar: '' | 'left' | 'right',
    word?: Word
  ) {
    let wordString = ''
    if (word) {
      try {
        wordString = '&word=' + encodeURIComponent(JSON.stringify(word))
      } catch (e) {}
    }

    const qsPanelWin = await browser.windows.create({
      ...rect,
      type: 'popup',
      url: browser.runtime.getURL(
        `quick-search.html?sidebar=${sidebar}${wordString}`
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

  destroy() {
    this.qsPanelId = null
    this.destroySnapshot()
  }

  isQsPanel(winId?: number) {
    return winId != null && winId === this.qsPanelId
  }

  hasCreated(): boolean {
    return this.qsPanelId != null
  }

  async focus() {
    if (this.qsPanelId != null) {
      await browser.windows.update(this.qsPanelId, { focused: true })
      const [tab] = await browser.tabs.query({ windowId: this.qsPanelId })
      if (tab && tab.id) {
        await message.send(tab.id, { type: 'QS_PANEL_FOCUSED' })
      }
    }
  }

  async takeSnapshot() {
    if (this.qsPanelId != null) {
      this.snapshot = await browser.windows.get(this.qsPanelId)
    }
  }

  async destroySnapshot() {
    this.snapshot = null
  }

  async restoreSnapshot() {
    if (this.snapshot != null && this.snapshot.id != null) {
      await browser.windows.update(this.snapshot.id, {
        state: this.snapshot.state,
        top: this.snapshot.top,
        left: this.snapshot.left,
        width: this.snapshot.width,
        height: this.snapshot.height
      })
    }
  }

  async isSidebar(): Promise<boolean> {
    if (this.qsPanelId == null) {
      return false
    }

    const win = await browser.windows.get(this.qsPanelId)
    return (
      win.top === 0 &&
      (win.left === 0 ||
        Math.floor(win.left! + win.width!) ===
          Math.floor(window.screen.availWidth))
    )
  }
}
