import { AddConfig, SyncService } from '../interface'
import { getNotebook, getSyncConfig, setSyncConfig } from '../helpers'
import { openURL } from '@/_helpers/browser-api'
import { timer } from '@/_helpers/promise-more'

export interface SyncConfig {
  enable: boolean
}

const locales = {
  open: {
    en: 'Open',
    'zh-CN': '打开',
    'zh-TW': '開啟'
  },
  loginCheckFailed: {
    en: 'Shanbay login failed. Click to open shanbay.com.',
    'zh-CN': '扇贝登录已失效，请点击打开官网重新登录。',
    'zh-TW': '扇貝登入已失效，請點選開啟官網重新登入。'
  },
  errNetwork: {
    en: 'Unable to access shanbay.com. Please check your network connection.',
    'zh-CN': '无法访问扇贝生词本，请检查网络。',
    'zh-TW': '無法訪問扇貝生字本，請檢查網路。'
  },
  errWord: {
    en:
      "Unable to add to Shanbay notebook. This word is not in Shanbay's vocabulary database.",
    'zh-CN': '无法添加到扇贝生词本，扇贝单词库没有收录此单词。',
    'zh-TW': '無法新增到扇貝生字本，扇貝單字庫沒有收錄此單字。'
  },
  errLearning: {
    en: 'Unable to add to Shanbay notebook.',
    'zh-CN': '无法添加到扇贝生词本。',
    'zh-TW': '無法新增到扇貝生字本。'
  }
}

export class Service extends SyncService<SyncConfig> {
  static readonly id = 'shanbay'

  static readonly title = {
    en: 'Shanbay',
    'zh-CN': '扇贝',
    'zh-TW': '扇贝'
  }

  config = Service.getDefaultConfig()

  static getDefaultConfig(): SyncConfig {
    return {
      enable: false
    }
  }

  static openLogin() {
    return openURL('https://www.shanbay.com/web/account/login')
  }

  async startInterval() {
    const config = await getSyncConfig<SyncConfig>(Service.id)
    if (config) {
      this.config = config
    }

    browser.notifications.onClicked.addListener(this.handleLoginNotification)
    if (browser.notifications.onButtonClicked) {
      browser.notifications.onButtonClicked.addListener(
        this.handleLoginNotification
      )
    }
  }

  async init() {
    if (!(await this.isLogin())) {
      return Promise.reject('login')
    }

    this.config.enable = true
    await setSyncConfig<SyncConfig>(Service.id, this.config)
  }

  async add({ words, force }: AddConfig) {
    if (!this.config.enable) {
      return
    }

    if (!(await this.isLogin())) {
      this.notifyLogin()
      return
    }

    if (force) {
      words = await getNotebook()
    }

    if (!words || words.length <= 0) {
      return
    }

    for (let i = 0; i < words.length; i++) {
      try {
        await this.addWord(words[i].text)
      } catch (e) {
        break
      }
      if ((i + 1) % 50 === 0) {
        await timer(15 * 60000)
      } else {
        await timer(500)
      }
    }
  }

  async addWord(text: string) {
    try {
      const url =
        'http://www.shanbay.com/api/v1/bdc/search/?word=' +
        encodeURIComponent(text)
      var resSearch = await fetch(url).then(r => r.json())
    } catch (e) {
      this.notifyError('errNetwork', text)
      return Promise.reject('network')
    }

    if (!resSearch || !resSearch.data) {
      this.notifyError('errWord', text)
      return Promise.reject('word')
    }

    try {
      var resLearning = await fetch(
        'http://www.shanbay.com/api/v1/bdc/learning/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: `content_type=vocabulary&id=${resSearch.data.id}`
        }
      ).then(r => r.json())
    } catch (e) {
      this.notifyError('errNetwork', text)
      return Promise.reject('network')
    }

    if (!resLearning || resLearning.status_code !== 0) {
      this.notifyError('errLearning', text)
      return Promise.reject('learning')
    }
  }

  async isLogin(): Promise<boolean> {
    return Boolean(
      await browser.cookies.get({
        url: 'http://www.shanbay.com',
        name: 'auth_token'
      })
    )
  }

  handleLoginNotification(id: string) {
    if (id === 'shanbay-login') {
      Service.openLogin()
    }
  }

  notifyError(locale: keyof typeof locales, text: string) {
    const { langCode } = window.appConfig

    browser.notifications.create({
      type: 'basic',
      iconUrl: browser.runtime.getURL(`assets/icon-128.png`),
      title: `Saladict Sync Service ${Service.title[langCode]}`,
      message: `「${text}」${locales[locale][langCode]}`,
      eventTime: Date.now() + 10000,
      priority: 2
    })
  }

  notifyLogin() {
    const { langCode } = window.appConfig

    browser.notifications.create('shanbay-login', {
      type: 'basic',
      iconUrl: browser.runtime.getURL(`assets/icon-128.png`),
      title: `Saladict Sync Service ${Service.title[langCode]}`,
      message: locales.loginCheckFailed[langCode],
      buttons: [{ title: locales.open[langCode] }],
      eventTime: Date.now() + 10000,
      priority: 2
    })
  }
}
