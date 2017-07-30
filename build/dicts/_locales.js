const path = require('path')
const fs = require('fs')
const glob = require('glob')
const mkdirp = require('mkdirp')

const langs = ['en', 'zh_CN', 'zh_TW']
const locales = langs.reduce((locales, lang) => {
  locales[lang] = require(`../../src/_locales/${lang}/messages.json`)
  return locales
}, {})

glob(path.join(__dirname, '../../src/components/**/_locales.@(json|js)'), (err, files) => {
  if (err || files.length <= 0) { console.error(err) }
  files.forEach(file => appendLocale(file))
  writeLocales()
})

function appendLocale (localePath) {
  const id = path.basename(path.dirname(localePath))
  const locale = require(localePath)
  appendKey(`dict_${id}`, locale.name, 'Dictionary Name')
  if (locale.options) {
    Object.keys(locale.options).forEach(opt => {
      appendKey(`dict_${id}_${opt}`, locale.options[opt], 'Dictionary option')
    })
  }
}

function appendKey (key, messages, description) {
  langs.forEach(lang => {
    locales[lang][key] = {
      description,
      message: messages[lang]
    }
  })
}

function writeLocales () {
  const LocalesPath = path.join(__dirname, '../../dist/_locales')
  langs.forEach(lang => {
    mkdirp(path.join(LocalesPath, lang), err => {
      if (err) { console.error(err) }
      fs.writeFile(path.join(LocalesPath, lang, 'messages.json'), JSON.stringify(locales[lang]))
    })
  })
}
