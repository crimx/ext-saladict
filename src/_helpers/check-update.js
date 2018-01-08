/**
 * @returns {Promise<boolean>} isAvailable
 */
export default function checkUpdate () {
  // check new version
  return fetch('https://api.github.com/repos/crimx/crx-saladict/releases/latest')
    .then(r => r.json())
    .then(data => {
      if (data && data.tag_name) {
        let vGithub = /\d+\.\d+\.\d+/.exec(data.tag_name)
        if (!vGithub) { return }
        let gits = vGithub[0].split('.').map(v => Number(v))
        let curs = chrome.runtime.getManifest().version.split('.').map(v => Number(v))
        return {
          info: data,
          isAvailable: gits[0] !== curs[0]
            ? gits[0] > curs[0]
            : gits[1] !== curs[1]
              ? gits[1] > curs[1]
              : gits[2] > curs[2]
        }
      }
      return {isAvailable: false}
    })
    .catch(() => {
      console.warn('version check failed')
      return {isAvailable: false}
    })
}
