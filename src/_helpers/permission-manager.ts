import { AppConfig } from '@/app-config'
import { isFirefox } from './saladict'

export async function checkBackgroundPermission(
  config: AppConfig
): Promise<void> {
  // Firefox does not support 'background' permission.
  if (isFirefox) return

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
      await browser.permissions.remove(
        backgroundPermissions as browser.permissions.Permissions
      )
    }
  }
}
