import { message, openUrl } from '@/_helpers/browser-api'
import { AppConfig } from '@/app-config'
import isEqual from 'lodash/isEqual'
import { createConfigStream } from '@/_helpers/config-manager'
import { isFirefox } from '@/_helpers/saladict'
import { reportEvent } from '@/_helpers/analytics'
import './types'

import { TFunction } from 'i18next'
import { I18nManager } from './i18n-manager'

import { combineLatest } from 'rxjs'
import { concatMap, filter, distinctUntilChanged } from 'rxjs/operators'
import { openPDF, extractPDFUrl } from './pdf-sniffer'
import { copyTextToClipboard } from './clipboard-manager'
import { BackgroundServer } from './server'

interface CreateMenuOptions {
  type?: browser.contextMenus.ItemType
  id?: string
  parentId?: string
  title?: string
  contexts?: browser.contextMenus.ContextType[]
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

  static openGoogle() {
    return tryExecuteScript(
      { file: '/assets/google-page-trans.js' },
      'google_page_translate'
    )
  }

  static openCaiyunTrs() {
    // FF policy
    if (isFirefox) return
    return tryExecuteScript({ file: '/assets/trs.js' }, 'caiyuntrs')
  }

  static async openYoudao() {
    // FF policy
    if (isFirefox) return
    // inject youdao script, defaults to the active tab of the current window.
    const result = await tryExecuteScript(
      { file: '/assets/fanyi.youdao.2.0/main.js' },
      'youdao_page_translate'
    )
    if (!result || ((result as any) !== 1 && result[0] !== 1)) {
      await browser.notifications.create({
        type: 'basic',
        eventTime: Date.now() + 4000,
        iconUrl: browser.runtime.getURL(`assets/icon-128.png`),
        title: 'Saladict',
        message: (await I18nManager.getInstance()).i18n.t(
          'menus:notification_youdao_err'
        )
      })
    }
  }

  static openBaiduPage() {
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      if (tabs.length > 0 && tabs[0].url) {
        const langCode =
          window.appConfig.langCode === 'zh-CN'
            ? 'zh'
            : window.appConfig.langCode === 'zh-TW'
            ? 'cht'
            : 'en'
        openUrl(
          `https://fanyi.baidu.com/transpage?query=${encodeURIComponent(
            tabs[0].url as string
          )}&from=auto&to=${langCode}&source=url&render=1`
        )
      }
    })
  }

  static openSogouPage() {
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      if (tabs.length > 0 && tabs[0].url) {
        const langCode = window.appConfig.langCode === 'zh-CN' ? 'zh-CHS' : 'en'
        openUrl(
          `https://translate.sogoucdn.com/pcvtsnapshot?from=auto&to=${langCode}&tfr=translatepc&url=${encodeURIComponent(
            tabs[0].url as string
          )}&domainType=sogou`
        )
      }
    })
  }

  static openMicrosoftPage() {
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      if (tabs.length > 0 && tabs[0].url) {
        const langCode =
          window.appConfig.langCode === 'zh-CN'
            ? 'zh-Hans'
            : window.appConfig.langCode === 'zh-TW'
            ? 'zh-Hant'
            : 'en'
        openUrl(
          `https://www.microsofttranslator.com/bv.aspx?from=auto&to=${langCode}&r=true&a=${encodeURIComponent(
            tabs[0].url as string
          )}`
        )
      }
    })
  }

  static requestSelection() {
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      if (tabs.length > 0 && tabs[0].id != null) {
        message.send(tabs[0].id as number, { type: 'EMIT_SELECTION' })
      }
    })
  }

  private handleContextMenusClick(info: ContextMenusClickInfo) {
    const menuItemId = String(info.menuItemId).replace(/_ba$/, '')
    const selectionText = info.selectionText || ''
    const linkUrl = info.linkUrl || ''
    switch (menuItemId) {
      case 'google_page_translate':
        ContextMenus.openGoogle()
        break
      case 'caiyuntrs':
        ContextMenus.openCaiyunTrs()
        break
      case 'google_cn_page_translate':
        ContextMenus.openGoogle()
        break
      case 'youdao_page_translate':
        ContextMenus.openYoudao()
        break
      case 'baidu_page_translate':
        ContextMenus.openBaiduPage()
        break
      case 'sogou_page_translate':
        ContextMenus.openSogouPage()
        break
      case 'microsoft_page_translate':
        ContextMenus.openMicrosoftPage()
        break
      case 'view_as_pdf':
        openPDF(linkUrl, info.menuItemId !== 'view_as_pdf_ba')
        break
      case 'copy_pdf_url': {
        const url = extractPDFUrl(info.pageUrl)
        if (url) {
          copyTextToClipboard(url)
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
          const item = window.appConfig.contextMenus.all[menuItemId]
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
    if (!browser.extension.inIncognitoContext) {
      // In 'split' incognito mode, this will also remove the items on normal mode windows
      await browser.contextMenus.removeAll()
    }

    const ctx: browser.contextMenus.ContextType[] = [
      'audio',
      'editable',
      'frame',
      'image',
      'link',
      'selection',
      'page',
      'video'
    ]

    // top level context menus item
    const containerCtx = new Set<browser.contextMenus.ContextType>([
      'selection'
    ])

    const optionList: CreateMenuOptions[] = []

    const browserActionItems: string[] = []

    for (const id of contextMenus.selected) {
      let contexts: browser.contextMenus.ContextType[]
      switch (id) {
        case 'caiyuntrs':
        case 'google_page_translate':
        case 'google_cn_page_translate':
        case 'youdao_page_translate':
        case 'sogou_page_translate':
        case 'baidu_page_translate':
        case 'microsoft_page_translate':
          // two for browser action
          contexts = ctx
          browserActionItems.push(id)
          break
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
      if (browserActionItems.length > 0) {
        ctx.forEach(type => containerCtx.add(type))
      }

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
      contexts: ['browser_action', 'page_action']
    })

    if (browserActionItems.length > 2) {
      await createContextMenu({
        id: 'saladict_ba_container',
        title: t('page_translations'),
        contexts: ['browser_action', 'page_action']
      })

      for (const id of browserActionItems) {
        await createContextMenu({
          id: id + '_ba',
          parentId: 'saladict_ba_container',
          title: getTitle(id),
          contexts: ['browser_action', 'page_action']
        })
      }
    } else if (browserActionItems.length > 0) {
      for (const id of browserActionItems) {
        await createContextMenu({
          id: id + '_ba',
          title: getTitle(id),
          contexts: ['browser_action', 'page_action']
        })
      }
    } else {
      // Add only to browser action if not selected
      await createContextMenu({
        id: 'google_cn_page_translate_ba',
        title: t('google_cn_page_translate'),
        contexts: ['browser_action', 'page_action']
      })
      await createContextMenu({
        id: 'youdao_page_translate_ba',
        title: t('youdao_page_translate'),
        contexts: ['browser_action', 'page_action']
      })
    }

    await createContextMenu({
      type: 'separator',
      id: Date.now().toString(),
      contexts: ['browser_action']
    })

    if (searchHistory) {
      // search history
      await createContextMenu({
        id: 'search_history',
        title: t('history_title'),
        contexts: ['browser_action']
      })
    }

    // Manual
    await createContextMenu({
      id: 'notebook',
      title: t('notebook_title'),
      contexts: ['browser_action']
    })

    function getTitle(id: string): string {
      const item = contextMenus.all[id]
      return !item || typeof item === 'string' ? t(id) : item.name
    }

    function createContextMenu(
      createProperties: CreateMenuOptions
    ): Promise<void> {
      return new Promise(resolve => {
        browser.contextMenus.create(createProperties, () => {
          if (browser.runtime.lastError) {
            console.error(browser.runtime.lastError)
          }
          resolve()
        })
      })
    }
  }
}

async function tryExecuteScript(
  details: browser.extensionTypes.InjectDetails,
  nameKey: string
) {
  try {
    return await browser.tabs.executeScript(details)
  } catch (error) {
    const { i18n } = await I18nManager.getInstance()
    await browser.notifications.create({
      type: 'basic',
      eventTime: Date.now() + 4000,
      iconUrl: browser.runtime.getURL(`assets/icon-128.png`),
      title: 'Saladict',
      message: i18n.t('menus:page_permission_err', {
        name: i18n.t(`menus:${nameKey}`)
      })
    })
    return error
  }
}

function reportMenusEvent(
  menuItemId: string | number,
  label: 'From_Browser_Action' | 'From_Context_Menus'
) {
  menuItemId = String(menuItemId).replace(/_ba$/, '')
  switch (menuItemId) {
    case 'google_page_translate':
      reportEvent({
        category: 'Page_Translate',
        action: 'Open_Google',
        label
      })
      break
    case 'caiyuntrs':
      reportEvent({
        category: 'Page_Translate',
        action: 'Open_Caiyun',
        label
      })
      break
    case 'google_cn_page_translate':
      reportEvent({
        category: 'Page_Translate',
        action: 'Open_Google',
        label
      })
      break
    case 'youdao_page_translate':
      reportEvent({
        category: 'Page_Translate',
        action: 'Open_Youdao',
        label
      })
      break
    case 'view_as_pdf':
      reportEvent({
        category: 'PDF_Viewer',
        action: 'Open_PDF_Viewer',
        label
      })
      break
  }
}
