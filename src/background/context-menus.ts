import { message, openURL } from '@/_helpers/browser-api'
import { MsgType, MsgContextMenusClick } from '@/typings/message'
import { AppConfig } from '@/app-config'
import i18nLoader from '@/_helpers/i18n'
import { TranslationFunction } from 'i18next'
import contextLocles from '@/_locales/context'
import isEqual from 'lodash/isEqual'
import { addConfigListener, AppConfigChanged } from '@/_helpers/config-manager'
import './types'

// import { Observable, ReplaySubject, combineLatest } from 'rxjs'
// import { mergeMap, filter, map, audit, mapTo, share, startWith } from 'rxjs/operators'
import { Observable } from 'rxjs/Observable'
import { ReplaySubject } from 'rxjs/ReplaySubject'
import { combineLatest } from 'rxjs/observable/combineLatest'
import { mergeMap } from 'rxjs/operators/mergeMap'
import { filter } from 'rxjs/operators/filter'
import { map } from 'rxjs/operators/map'
import { audit } from 'rxjs/operators/audit'
import { mapTo } from 'rxjs/operators/mapTo'
import { share } from 'rxjs/operators/share'
import { startWith } from 'rxjs/operators/startWith'
import { fromEventPattern } from 'rxjs/observable/fromEventPattern'

type ContextMenusConfig = AppConfig['contextMenus']

interface CreateMenuOptions {
  type?: browser.contextMenus.ItemType,
  id?: string
  parentId?: string
  title?: string
  contexts?: browser.contextMenus.ContextType[]
}

// singleton
let setMenus$$: Observable<void>

const i18n$$ = new ReplaySubject<TranslationFunction>(1)
const i18n = i18nLoader({ context: contextLocles }, 'context', (_, t) => i18n$$.next(t))
i18n.on('languageChanged', () => i18n$$.next(i18n.t.bind(i18n)))

browser.contextMenus.onClicked.addListener(handleContextMenusClick)
message.addListener<MsgContextMenusClick>(MsgType.ContextMenusClick, handleContextMenusClick)

export function init (initConfig: ContextMenusConfig): Observable<void> {
  if (setMenus$$) { return setMenus$$ }
  // when context menus config changes
  const contextMenusChanged$ =
      fromEventPattern<AppConfigChanged[] | AppConfigChanged>(addConfigListener as any).pipe(
    map(args => Array.isArray(args) ? args[0] : args),
    filter(({ newConfig, oldConfig }) => {
      if (!newConfig) { return false }
      if (!oldConfig) { return true }

      return !isEqual(
        oldConfig.contextMenus.selected,
        newConfig.contextMenus.selected,
      )
    }),
    map(({ newConfig }) => newConfig.contextMenus),
    startWith(initConfig),
  )

  let signal$: Observable<boolean>

  setMenus$$ = combineLatest(
    contextMenusChanged$,
    i18n$$,
  ).pipe(
    // ignore values while setContextMenus is running
    // if source emits any value during setContextMenus,
    // retrieve the latest after setContextMenus is completed
    audit(() => signal$),
    mergeMap(([contextMenus, t]) => setContextMenus(contextMenus, t)),
    share(),
  )

  signal$ = setMenus$$.pipe(
    mapTo(true), // last setContextMenus is completed
    startWith(true),
  )

  setMenus$$.subscribe()

  return setMenus$$
}

/**
 * @param url provide a url
 * @param force load the current tab anyway
 */
export async function openPDF (url?: string, force?: boolean) {
  const pdfURL = browser.runtime.getURL('static/pdf/web/viewer.html')
  if (url) {
    // open link as pdf
    return openURL(pdfURL + '?file=' + encodeURIComponent(url))
  }
  const tabs = await browser.tabs.query({ active: true, currentWindow: true })
  if (tabs.length > 0 && tabs[0].url) {
    if (/pdf$/i.test(tabs[0].url as string) || force) {
      return openURL(pdfURL + '?file=' + encodeURIComponent((tabs[0].url as string)))
    }
  }
  return openURL(pdfURL)
}

export function openGoogle (cn?: boolean) {
  browser.tabs.query({ active: true, currentWindow: true })
    .then(tabs => {
      if (tabs.length > 0 && tabs[0].url) {
        openURL(`https://translate.google.${cn ? 'cn' : 'com'}/translate?sl=auto&tl=${window.appConfig.langCode}&js=y&prev=_t&ie=UTF-8&u=${encodeURIComponent(tabs[0].url as string)}&edit-text=&act=url`)
      }
    })
}

export function openYoudao () {
  // inject youdao script, defaults to the active tab of the current window.
  browser.tabs.executeScript({ file: '/static/fanyi.youdao.2.0/main.js' })
  .then(result => {
    if (!result || (result as any !== 1 && result[0] !== 1)) {
      throw new Error()
    }
  })
  .catch(() => {
    // error msg
    browser.notifications.create({
      type: 'basic',
      eventTime: Date.now() + 4000,
      iconUrl: browser.runtime.getURL(`static/icon-128.png`),
      title: 'Saladict',
      message: i18n.t('notification_youdao_err')
    })
  })
}

export function openBaiduPage () {
  browser.tabs.query({ active: true, currentWindow: true })
    .then(tabs => {
      if (tabs.length > 0 && tabs[0].url) {
        const langCode = window.appConfig.langCode === 'zh-CN'
          ? 'zh'
          : window.appConfig.langCode === 'zh-TW'
            ? 'cht'
            : 'en'
        openURL(`https://fanyi.baidu.com/transpage?query=${encodeURIComponent(tabs[0].url as string)}&from=auto&to=${langCode}&source=url&render=1`)
      }
    })
}

export function openSogouPage () {
  browser.tabs.query({ active: true, currentWindow: true })
    .then(tabs => {
      if (tabs.length > 0 && tabs[0].url) {
        const langCode = window.appConfig.langCode === 'zh-CN' ? 'zh-CHS' : 'en'
        openURL(`https://translate.sogoucdn.com/pcvtsnapshot?from=auto&to=${langCode}&tfr=translatepc&url=${encodeURIComponent(tabs[0].url as string)}&domainType=sogou`)
      }
    })
}

export function openMicrosoftPage () {
  browser.tabs.query({ active: true, currentWindow: true })
    .then(tabs => {
      if (tabs.length > 0 && tabs[0].url) {
        const langCode = window.appConfig.langCode === 'zh-CN'
          ? 'zh-CHS'
          : window.appConfig.langCode === 'zh-TW'
            ? 'zh-CHT'
            : 'en'
        openURL(`https://www.microsofttranslator.com/bv.aspx?from=auto&to=${langCode}&r=true&a=${encodeURIComponent(tabs[0].url as string)}`)
      }
    })
}

function requestSelection () {
  browser.tabs.query({ active: true, currentWindow: true })
    .then(tabs => {
      if (tabs.length > 0 && tabs[0].id != null) {
        message.send(tabs[0].id as number, { type: MsgType.EmitSelection })
      }
    })
}

async function setContextMenus (
  contextMenus: ContextMenusConfig,
  t: TranslationFunction
): Promise<void> {
  await browser.contextMenus.removeAll()
  const ctx: browser.contextMenus.ContextType[] = [
    'audio', 'editable', 'frame', 'image', 'link', 'selection', 'page', 'video'
  ]

  const containerCtx = new Set<browser.contextMenus.ContextType>(['selection'])
  const optionList: CreateMenuOptions[] = []

  let browserActionItems: string[] = []
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

  function getTitle (id: string): string {
    const item = contextMenus.all[id]
    return !item || typeof item === 'string' ? t(id) : item.name
  }
}

function createContextMenu (createProperties: CreateMenuOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    browser.contextMenus.create(createProperties, () => {
      if (browser.runtime.lastError) {
        reject(browser.runtime.lastError)
      } else {
        resolve()
      }
    })
  })
}

interface ContextMenusClickInfo {
  menuItemId: string | number
  selectionText?: string
  linkUrl?: string
}

function handleContextMenusClick (info: ContextMenusClickInfo) {
  const menuItemId = String(info.menuItemId).replace(/_ba$/, '')
  const selectionText = info.selectionText || ''
  const linkUrl = info.linkUrl || ''
  switch (menuItemId) {
    case 'google_page_translate':
      openGoogle()
      break
    case 'google_cn_page_translate':
      openGoogle(true)
      break
    case 'youdao_page_translate':
      openYoudao()
      break
    case 'baidu_page_translate':
      openBaiduPage()
      break
    case 'sogou_page_translate':
      openSogouPage()
      break
    case 'microsoft_page_translate':
      openMicrosoftPage()
      break
    case 'view_as_pdf':
      openPDF(linkUrl, info.menuItemId !== 'view_as_pdf_ba')
      break
    case 'search_history':
      openURL(browser.runtime.getURL('history.html'))
      break
    case 'notebook':
      openURL(browser.runtime.getURL('notebook.html'))
      break
    case 'saladict':
      requestSelection()
      break
    default:
      const item = window.appConfig.contextMenus.all[menuItemId]
      if (item) {
        const url = typeof item === 'string' ? item : item.url
        if (url) {
          openURL(url.replace('%s', selectionText))
        }
      }
  }
}
