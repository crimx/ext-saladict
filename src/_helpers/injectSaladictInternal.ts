import { executeScriptCompat, insertCSSCompat } from './scripting'

export async function injectDictPanel(tab: browser.tabs.Tab | undefined) {
  if (tab && tab.id) {
    const tabId = tab.id
    const manifest = browser.runtime.getManifest()
    if (manifest.content_scripts) {
      for (const script of manifest.content_scripts) {
        if (script.js) {
          for (const js of script.js) {
            await executeScriptCompat(
              {
                file: js[0] === '/' ? js : `/${js}`,
                allFrames: script.all_frames,
                matchAboutBlank: script.match_about_blank,
                runAt: script.run_at
              },
              tabId
            )
          }
        }
        if (script.css) {
          for (const css of script.css) {
            await insertCSSCompat(
              {
                file: css[0] === '/' ? css : `/${css}`,
                allFrames: script.all_frames,
                matchAboutBlank: script.match_about_blank,
                runAt: script.run_at
              },
              tabId
            )
          }
        }
      }
    }
  }
}
