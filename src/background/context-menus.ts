import { message, openURL } from '@/_helpers/browser-api'
import { MsgType } from '@/typings/message'
import { AppConfig } from '@/app-config'
import i18nLoader from '@/_helpers/i18n'
import { TranslationFunction } from 'i18next'
import contextLocles from '@/_locales/context'
import isEqual from 'lodash/isEqual'
import { getActiveConfig, addActiveConfigListener, AppConfigChanged } from '@/_helpers/config-manager'

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
  title?: string
  contexts?: browser.contextMenus.ContextType[]
}

// singleton
let setMenus$$: Observable<void>

const i18n$$ = new ReplaySubject<TranslationFunction>(1)
const i18n = i18nLoader({ context: contextLocles }, 'context', (_, t) => i18n$$.next(t))
i18n.on('languageChanged', () => i18n$$.next(i18n.t.bind(i18n)))

browser.contextMenus.onClicked.addListener(info => {
  const menuItemId = info.menuItemId
  const selectionText = info.selectionText || ''
  const linkUrl = info.linkUrl || ''
  switch (menuItemId) {
    case 'google_page_translate':
      openGoogle()
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
      openPDF(linkUrl)
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
      getActiveConfig()
        .then(config => {
          const url = config.contextMenus.all[menuItemId]
          if (url) {
            openURL(url.replace('%s', selectionText))
          }
        })
  }
})

export function init (initConfig: ContextMenusConfig): Observable<void> {
  if (setMenus$$) { return setMenus$$ }
  // when context menus config changes
  const contextMenusChanged$ =
      fromEventPattern<AppConfigChanged[] | AppConfigChanged>(addActiveConfigListener as any).pipe(
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

export function openPDF (linkUrl?: string) {
  const pdfURL = browser.runtime.getURL('static/pdf/web/viewer.html')
  if (linkUrl) {
    // open link as pdf
    openURL(pdfURL + '?file=' + linkUrl)
  } else {
    browser.tabs.query({ active: true, currentWindow: true })
      .then(tabs => {
        if (tabs.length > 0 && tabs[0].url) {
          openURL(pdfURL + '?file=' + tabs[0].url)
        } else {
          openURL(pdfURL)
        }
      })
  }
}

export function openGoogle () {
  browser.tabs.query({ active: true, currentWindow: true })
    .then(tabs => {
      if (tabs.length > 0 && tabs[0].url) {
        getActiveConfig().then(config => {
          openURL(`https://translate.google.com/translate?sl=auto&tl=${config.langCode}&js=y&prev=_t&ie=UTF-8&u=${encodeURIComponent(tabs[0].url as string)}&edit-text=&act=url`)
        })
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
        getActiveConfig().then(config => {
          const langCode = config.langCode === 'zh-CN'
            ? 'zh'
            : config.langCode === 'zh-TW'
              ? 'cht'
              : 'en'
          openURL(`https://fanyi.baidu.com/transpage?query=${encodeURIComponent(tabs[0].url as string)}&from=auto&to=${langCode}&source=url&render=1`)
        })
      }
    })
}

export function openSogouPage () {
  browser.tabs.query({ active: true, currentWindow: true })
    .then(tabs => {
      if (tabs.length > 0 && tabs[0].url) {
        getActiveConfig().then(config => {
          const langCode = config.langCode === 'zh-CN' ? 'zh-CHS' : 'en'
          openURL(`https://translate.sogoucdn.com/pcvtsnapshot?from=auto&to=${langCode}&tfr=translatepc&url=${encodeURIComponent(tabs[0].url as string)}&domainType=sogou`)
        })
      }
    })
}

export function openMicrosoftPage () {
  browser.tabs.query({ active: true, currentWindow: true })
    .then(tabs => {
      if (tabs.length > 0 && tabs[0].url) {
        getActiveConfig().then(config => {
          const langCode = config.langCode === 'zh-CN'
            ? 'zh-CHS'
            : config.langCode === 'zh-TW'
              ? 'zh-CHT'
              : 'en'
          openURL(`https://www.microsofttranslator.com/bv.aspx?from=auto&to=${langCode}&r=true&a=${encodeURIComponent(tabs[0].url as string)}`)
        })
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

function setContextMenus (
  contextMenus: ContextMenusConfig,
  t: TranslationFunction
): Promise<void> {
  return browser.contextMenus.removeAll()
    .then(() => {
      const optionList: CreateMenuOptions[] = []

      // pdf
      optionList.push({
        id: 'view_as_pdf',
        title: t('view_as_pdf'),
        contexts: ['link', 'browser_action']
      })

      let browserActionCount = 0
      contextMenus.selected.forEach(id => {
        let contexts: browser.contextMenus.ContextType[]
        switch (id) {
          case 'google_page_translate':
          case 'youdao_page_translate':
          case 'sogou_page_translate':
          case 'baidu_page_translate':
          case 'microsoft_page_translate':
            contexts = ['all']
            browserActionCount++
            break
          default:
            contexts = ['selection']
            break
        }
        optionList.push({
          id,
          title: t(id),
          contexts
        })
      })

      // Only for browser action
      if (browserActionCount <= 0) {
        optionList.push({
          id: 'google_page_translate',
          title: t('google_page_translate'),
          contexts: ['browser_action']
        })
        optionList.push({
          id: 'youdao_page_translate',
          title: t('youdao_page_translate'),
          contexts: ['browser_action']
        })
      }

      optionList.push({
        type: 'separator',
        id: Date.now().toString(),
        contexts: ['browser_action']
      })

      // search history
      optionList.push({
        id: 'search_history',
        title: t('history_title'),
        contexts: ['browser_action']
      })

      // Manual
      optionList.push({
        id: 'notebook',
        title: t('notebook_title'),
        contexts: ['browser_action']
      })

      return Promise.all(
        optionList.map(option =>
        new Promise(resolve => {
          browser.contextMenus.create(option, resolve)
        })
      ))
    })
    .then(() => { /* noop */ })
}
