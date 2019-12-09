import { message, openURL } from '@/_helpers/browser-api'
import { AppConfig } from '@/app-config'
import isEqual from 'lodash/isEqual'
import { createConfigStream } from '@/_helpers/config-manager'
import './types'

import { TFunction } from 'i18next'
import { I18nManager } from './i18n-manager'

import { combineLatest } from 'rxjs'
import { concatMap, filter, distinctUntilChanged } from 'rxjs/operators'

interface CreateMenuOptions {
  type?: browser.contextMenus.ItemType
  id?: string
  parentId?: string
  title?: string
  contexts?: browser.contextMenus.ContextType[]
}

interface ContextMenusClickInfo {
  menuItemId: string | number
  selectionText?: string
  linkUrl?: string
}

export class ContextMenus {
  static getInstance() {
    return ContextMenus.instance || (ContextMenus.instance = new ContextMenus())
  }

  static init = ContextMenus.getInstance

  /**
   * @param url provide a url
   * @param force load the current tab anyway
   */
  static async openPDF(url?: string, force?: boolean) {
    const pdfURL = browser.runtime.getURL('assets/pdf/web/viewer.html')
    if (url) {
      // open link as pdf
      return openURL(pdfURL + '?file=' + encodeURIComponent(url))
    }
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    if (tabs.length > 0 && tabs[0].url) {
      if (/pdf$/i.test(tabs[0].url as string) || force) {
        return openURL(
          pdfURL + '?file=' + encodeURIComponent(tabs[0].url as string)
        )
      }
    }
    return openURL(pdfURL)
  }

  static openGoogle() {
    browser.tabs.executeScript({ file: '/assets/google-page-trans.js' })
    // browser.tabs.query({ active: true, currentWindow: true })
    //   .then(tabs => {
    //     if (tabs.length > 0 && tabs[0].url) {
    //       openURL(`https://translate.google.${cn ? 'cn' : 'com'}/translate?sl=auto&tl=${window.appConfig.langCode}&js=y&prev=_t&ie=UTF-8&u=${encodeURIComponent(tabs[0].url as string)}&edit-text=&act=url`)
    //     }
    //   })
  }

  static openYoudao() {
    // inject youdao script, defaults to the active tab of the current window.
    browser.tabs
      .executeScript({ file: '/assets/fanyi.youdao.2.0/main.js' })
      .then(result => {
        if (!result || ((result as any) !== 1 && result[0] !== 1)) {
          throw new Error()
        }
      })
      .catch(() => {
        // error msg
        browser.notifications.create({
          type: 'basic',
          eventTime: Date.now() + 4000,
          iconUrl: browser.runtime.getURL(`assets/icon-128.png`),
          title: 'Saladict',
          message: I18nManager.getInstance().i18n.t(
            'menus:notification_youdao_err'
          )
        })
      })
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
        openURL(
          `https://fanyi.baidu.com/transpage?query=${encodeURIComponent(tabs[0]
            .url as string)}&from=auto&to=${langCode}&source=url&render=1`
        )
      }
    })
  }

  static openSogouPage() {
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      if (tabs.length > 0 && tabs[0].url) {
        const langCode = window.appConfig.langCode === 'zh-CN' ? 'zh-CHS' : 'en'
        openURL(
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
            ? 'zh-CHS'
            : window.appConfig.langCode === 'zh-TW'
            ? 'zh-CHT'
            : 'en'
        openURL(
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
        ContextMenus.openPDF(linkUrl, info.menuItemId !== 'view_as_pdf_ba')
        break
      case 'saladict':
        ContextMenus.requestSelection()
        break
      case 'search_history':
        openURL(browser.runtime.getURL('history.html'))
        break
      case 'notebook':
        openURL(browser.runtime.getURL('notebook.html'))
        break
      default:
        const item = window.appConfig.contextMenus.all[menuItemId]
        if (item) {
          const url = typeof item === 'string' ? item : item.url
          if (url) {
            openURL(url.replace('%s', selectionText))
          }
        }
        break
    }
  }

  private static instance: ContextMenus

  private i18nManager: I18nManager

  // singleton
  private constructor() {
    this.i18nManager = I18nManager.getInstance()

    const contextMenusChanged$ = createConfigStream().pipe(
      distinctUntilChanged(
        (config1, config2) =>
          config1 &&
          config2 &&
          isEqual(config1.contextMenus.selected, config2.contextMenus.selected)
      ),
      filter(config => !!config)
    )

    combineLatest(contextMenusChanged$, this.i18nManager.getFixedT$$('menus'))
      .pipe(concatMap(this.setContextMenus))
      .subscribe()

    browser.contextMenus.onClicked.addListener(payload =>
      this.handleContextMenusClick(payload)
    )

    message.addListener('CONTEXT_MENUS_CLICK', ({ payload }) =>
      this.handleContextMenusClick(payload)
    )
  }

  private async setContextMenus([{ contextMenus }, t]: [
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

    const containerCtx = new Set<browser.contextMenus.ContextType>([
      'selection'
    ])

    const optionList: CreateMenuOptions[] = []

    const browserActionItems: string[] = []

    for (const id of contextMenus.selected) {
      let contexts: browser.contextMenus.ContextType[]
      switch (id) {
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

    // search history
    await createContextMenu({
      id: 'search_history',
      title: t('history_title'),
      contexts: ['browser_action']
    })

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
