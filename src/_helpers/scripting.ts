function getChromeScripting() {
  return (self as any).chrome && (self as any).chrome.scripting
}

function isManifestV3() {
  return browser.runtime.getManifest().manifest_version === 3
}

async function getActiveTabId() {
  const [tab] = await browser.tabs.query({
    active: true,
    currentWindow: true
  })
  return tab && tab.id != null ? tab.id : undefined
}

export async function executeScriptCompat(
  details: browser.extensionTypes.InjectDetails,
  tabId?: number
) {
  const scripting = getChromeScripting()
  if (isManifestV3() && scripting) {
    const resolvedTabId = tabId != null ? tabId : await getActiveTabId()
    if (resolvedTabId == null || !details.file) {
      return
    }

    return scripting.executeScript({
      target: {
        tabId: resolvedTabId,
        allFrames: !!details.allFrames
      },
      files: [details.file],
      injectImmediately: details.runAt === 'document_start'
    })
  }

  return tabId == null
    ? browser.tabs.executeScript(details)
    : browser.tabs.executeScript(tabId, details)
}

export async function insertCSSCompat(
  details: browser.extensionTypes.InjectDetails,
  tabId: number
) {
  const scripting = getChromeScripting()
  if (isManifestV3() && scripting) {
    if (!details.file) {
      return
    }

    return scripting.insertCSS({
      target: {
        tabId,
        allFrames: !!details.allFrames
      },
      files: [details.file]
    })
  }

  return browser.tabs.insertCSS(tabId, details)
}
