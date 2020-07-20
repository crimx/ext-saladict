import { AppConfig } from '@/app-config'
import { isFirefox, isOpera } from './saladict'

export async function checkBackgroundPermission(
  config: AppConfig
): Promise<void> {
  // Firefox and Opera does not support 'background' permission.
  if (isFirefox || isOpera) return

  const backgroundPermissions: browser.permissions.AnyPermissions = {
    permissions: ['background']
  }
  const hasBackground = await browser.permissions.contains(
    backgroundPermissions
  )
  if (config.runInBg) {
    if (!hasBackground) {
      await browser.permissions.request(
        backgroundPermissions as browser.permissions.Permissions
      )
    }
  } else {
    if (hasBackground) {
      try {
        await browser.permissions.remove(
          backgroundPermissions as browser.permissions.Permissions
        )
      } catch (e) {
        // failed silently on remove
        console.error(e)
      }
    }
  }
}
