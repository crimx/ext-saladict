export function injectAnalytics (win = window) {
  if (process.env.DEV_BUILD ||
      process.env.NODE_ENV === 'test' ||
      !process.env.SDAPP_ANALYTICS ||
      win.dataLayer
  ) {
    return
  }

  win.dataLayer = [
    ['js', new Date()],
    ['config', process.env.SDAPP_ANALYTICS],
  ]

  const ga = win.document.createElement('script')
  ga.type = 'text/javascript'
  ga.async = true
  ga.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.SDAPP_ANALYTICS}`
  win.document.body.append(ga)
}
