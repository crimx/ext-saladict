import { message, openUrl } from '@/_helpers/browser-api'
import { AppConfig } from '@/app-config'
import isEqual from 'lodash/isEqual'
import { createConfigStream } from '@/_helpers/config-manager'
import { reportEvent } from '@/_helpers/analytics'
import './types'

import { TFunction } from 'i18next'
import { I18nManager } from './i18n-manager'

import { combineLatest } from 'rxjs'
import { concatMap, filter, distinctUntilChanged } from 'rxjs/operators'
import { openPDF, extractPDFUrl } from './pdf-sniffer'
import { BackgroundServer } from './server'
import { initBackgroundState } from './state'
import { getDomTaskBridge } from './dom-task-bridge'

interface CreateMenuOptions {
  type?: browser.contextMenus.ItemType
  id?: string
  parentId?: string
  title?: string
  contexts?: string[]
}

type ContextMenusClickInfo = Pick<
  browser.contextMenus.OnClickData,
  'menuItemId' | 'selectionText' | 'linkUrl' | 'pageUrl'
>

export class ContextMenus {
  static async getInstance() {
    if (!ContextMenus.instance) {
      const instance = new ContextMenus()
      ContextMenus.instance = instance

      const i18nManager = await I18nManager.getInstance()

      const contextMenusChanged$ = createConfigStream().pipe(
        distinctUntilChanged(
          (config1, config2) =>
            config1 &&
            config2 &&
            isEqual(
              config1.contextMenus.selected,
              config2.contextMenus.selected
            )
        ),
        filter(config => !!config)
      )

      combineLatest(contextMenusChanged$, i18nManager.getFixedT$('menus'))
        .pipe(concatMap(instance.setContextMenus))
        .subscribe()
    }

    return ContextMenus.instance
  }

  static init = ContextMenus.getInstance

  static requestSelection() {
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      if (tabs.length > 0 && tabs[0].id != null) {
        message.send(tabs[0].id as number, { type: 'EMIT_SELECTION' })
      }
    })
  }

  private async handleContextMenusClick(info: ContextMenusClickInfo) {
    const menuItemId = String(info.menuItemId).replace(/_ba$/, '')
    const selectionText = info.selectionText || ''
    const linkUrl = info.linkUrl || ''
    switch (menuItemId) {
      case 'view_as_pdf':
        openPDF(linkUrl, info.menuItemId !== 'view_as_pdf_ba')
        break
      case 'copy_pdf_url': {
        const url = extractPDFUrl(info.pageUrl)
        if (url) {
          getDomTaskBridge().writeClipboard(url)
        }
        break
      }
      case 'saladict':
        ContextMenus.requestSelection()
        break
      case 'saladict_standalone':
        BackgroundServer.getInstance().searchPageSelection()
        break
      case 'search_history':
        openUrl(browser.runtime.getURL('history.html'))
        break
      case 'notebook':
        openUrl(browser.runtime.getURL('notebook.html'))
        break
      default:
        {
          const {
            appConfig: {
              contextMenus: { all }
            }
          } = await initBackgroundState()
          const item = all[menuItemId]
          if (item) {
            const url = typeof item === 'string' ? item : item.url
            if (url) {
              openUrl(url.replace('%s', encodeURIComponent(selectionText)))
            }
          }
        }
        break
    }
  }

  private static instance: ContextMenus

  // singleton
  private constructor() {
    browser.contextMenus.onClicked.addListener(payload => {
      reportMenusEvent(payload.menuItemId, 'From_Context_Menus')
      return this.handleContextMenusClick(payload)
    })

    message.addListener('CONTEXT_MENUS_CLICK', ({ payload }) => {
      reportMenusEvent(payload.menuItemId, 'From_Browser_Action')
      return this.handleContextMenusClick(payload)
    })
  }

  private async setContextMenus([{ searchHistory, contextMenus }, t]: [
    AppConfig,
    TFunction
  ]): Promise<void> {
    const actionContexts = getToolbarMenuContexts()
    if (!browser.extension.inIncognitoContext) {
      // In 'split' incognito mode, this will also remove the items on normal mode windows
      await browser.contextMenus.removeAll()
    }

    // top level context menus item
    const containerCtx = new Set<browser.contextMenus.ContextType>([
      'selection'
    ])

    const optionList: CreateMenuOptions[] = []

    for (const id of contextMenus.selected) {
      if (!contextMenus.all[id]) {
        continue
      }

      let contexts: browser.contextMenus.ContextType[]
      switch (id) {
        case 'view_as_pdf':
          containerCtx.add('link')
          containerCtx.add('page')
          contexts = ['link', 'page']
          break
        case 'copy_pdf_url':
          containerCtx.add('page')
          contexts = ['page']
          break
        default:
          contexts = ['selection']
          break
      }
      optionList.push({
        id,
        title: getTitle(id),
        contexts
      })
    }

    if (optionList.length > 1) {
      await createContextMenu({
        id: 'saladict_container',
        title: t('saladict'),
        contexts: [...containerCtx]
      })

      for (const opt of optionList) {
        opt.parentId = 'saladict_container'
        await createContextMenu(opt)
      }
    } else if (optionList.length > 0) {
      // only one item, no need for parent container
      await createContextMenu(optionList[0])
    }

    await createContextMenu({
      id: 'view_as_pdf_ba',
      title: t('view_as_pdf'),
      contexts: actionContexts
    })

    await createContextMenu({
      type: 'separator',
      id: Date.now().toString(),
      contexts: getActionOnlyContexts()
    })

    if (searchHistory) {
      // search history
      await createContextMenu({
        id: 'search_history',
        title: t('history_title'),
        contexts: getActionOnlyContexts()
      })
    }

    // Manual
    await createContextMenu({
      id: 'notebook',
      title: t('notebook_title'),
      contexts: getActionOnlyContexts()
    })

    function getTitle(id: string): string {
      const item = contextMenus.all[id]
      return !item || typeof item === 'string' ? t(id) : item.name
    }

    function createContextMenu(
      createProperties: CreateMenuOptions
    ): Promise<void> {
      return new Promise(resolve => {
        browser.contextMenus.create(createProperties as any, () => {
          if (browser.runtime.lastError) {
            console.error(browser.runtime.lastError)
          }
          resolve()
        })
      })
    }
  }
}

function getToolbarMenuContexts() {
  return browser.runtime.getManifest().manifest_version === 3
    ? (['action'] as string[])
    : (['browser_action', 'page_action'] as string[])
}

function getActionOnlyContexts() {
  return browser.runtime.getManifest().manifest_version === 3
    ? (['action'] as string[])
    : (['browser_action'] as string[])
}

function reportMenusEvent(
  menuItemId: string | number,
  label: 'From_Browser_Action' | 'From_Context_Menus'
) {
  menuItemId = String(menuItemId).replace(/_ba$/, '')
  switch (menuItemId) {
    case 'view_as_pdf':
      reportEvent({
        category: 'PDF_Viewer',
        action: 'Open_PDF_Viewer',
        label
      })
      break
  }
}
