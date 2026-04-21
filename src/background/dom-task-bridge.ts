import { AudioManager } from './audio-manager'
import { copyTextToClipboard, getTextFromClipboard } from './clipboard-manager'
import { openUrl } from '@/_helpers/browser-api'
import {
  canUseOffscreenDocument,
  ensureOffscreenDocument,
  sendOffscreenMessage
} from './offscreen-document'

export interface DomTaskBridge {
  playAudio(src?: string): Promise<void>
  stopAudio(): Promise<void>
  readClipboard(): Promise<string>
  writeClipboard(text: string): Promise<void>
}

class BackgroundPageDomTaskBridge implements DomTaskBridge {
  playAudio(src?: string): Promise<void> {
    return AudioManager.getInstance().play(src)
  }

  stopAudio(): Promise<void> {
    AudioManager.getInstance().reset()
    return Promise.resolve()
  }

  readClipboard(): Promise<string> {
    return getTextFromClipboard()
  }

  writeClipboard(text: string): Promise<void> {
    return copyTextToClipboard(text)
  }
}

class ChromiumMv3DomTaskBridge implements DomTaskBridge {
  async playAudio(src?: string): Promise<void> {
    await this.ensureOffscreen()
    await sendOffscreenMessage({
      type: 'SALADICT_OFFSCREEN_TASK',
      task: 'PLAY_AUDIO',
      src
    })
  }

  async stopAudio(): Promise<void> {
    await this.ensureOffscreen()
    await sendOffscreenMessage({
      type: 'SALADICT_OFFSCREEN_TASK',
      task: 'STOP_AUDIO'
    })
  }

  async readClipboard(): Promise<string> {
    if (
      !(await browser.permissions.contains({ permissions: ['clipboardRead'] }))
    ) {
      openUrl(
        '/options.html?menuselected=Permissions&missing_permission=clipboardRead',
        true
      )
      return ''
    }

    await this.ensureOffscreen()
    return sendOffscreenMessage({
      type: 'SALADICT_OFFSCREEN_TASK',
      task: 'READ_CLIPBOARD'
    })
  }

  async writeClipboard(text: string): Promise<void> {
    if (
      !(await browser.permissions.contains({ permissions: ['clipboardWrite'] }))
    ) {
      openUrl(
        '/options.html?menuselected=Permissions&missing_permission=clipboardWrite',
        true
      )
      return
    }

    await this.ensureOffscreen()
    await sendOffscreenMessage({
      type: 'SALADICT_OFFSCREEN_TASK',
      task: 'WRITE_CLIPBOARD',
      text
    })
  }

  private async ensureOffscreen() {
    return ensureOffscreenDocument()
  }
}

function createDefaultBridge(): DomTaskBridge {
  if (canUseOffscreenDocument()) {
    return new ChromiumMv3DomTaskBridge()
  }
  return new BackgroundPageDomTaskBridge()
}

let currentBridge: DomTaskBridge = createDefaultBridge()

export function getDomTaskBridge(): DomTaskBridge {
  return currentBridge
}

export function setDomTaskBridge(bridge: DomTaskBridge) {
  currentBridge = bridge
}
