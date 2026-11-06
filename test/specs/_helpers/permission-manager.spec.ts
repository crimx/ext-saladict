import { getDefaultConfig, AppConfigMutable } from '@/app-config'
import { mergeConfig } from '@/app-config/merge-config'
import { checkBackgroundPermission } from '@/_helpers/permission-manager'
import { browser } from '../../helper'

jest.mock('@/_helpers/saladict', () => ({
  isFirefox: false,
  isOpera: false,
  isSafari: false
}))

describe('Background permission', () => {
  beforeEach(() => {
    browser.flush()
    browser.permissions.contains.callsFake(() => Promise.resolve(false))
    browser.permissions.request.callsFake(() => Promise.resolve(true))
    browser.permissions.remove.callsFake(() => Promise.resolve(true))
  })

  it.each([false, true])(
    'allows MV3 config saves with runInBg=%s when background is undeclared',
    async runInBg => {
      browser.runtime.getManifest.callsFake(() => ({
        manifest_version: 3,
        optional_permissions: ['clipboardRead', 'clipboardWrite']
      }))
      const config = getDefaultConfig() as AppConfigMutable
      config.runInBg = runInBg

      await expect(checkBackgroundPermission(config)).resolves.toBeUndefined()

      expect(browser.permissions.contains.called).toBe(false)
      expect(browser.permissions.request.called).toBe(false)
      expect(browser.permissions.remove.called).toBe(false)
    }
  )

  it('allows subsequent saves after importing a backup with runInBg enabled', async () => {
    browser.runtime.getManifest.callsFake(() => ({ manifest_version: 3 }))
    browser.permissions.request.callsFake(() =>
      Promise.reject(
        new Error(
          'Only permissions specified in the manifest may be requested.'
        )
      )
    )
    const backup = JSON.parse(
      JSON.stringify({ baseconfig: { ...getDefaultConfig(), runInBg: true } })
    )
    const config = mergeConfig(backup.baseconfig)

    expect(config.runInBg).toBe(true)
    await expect(checkBackgroundPermission(config)).resolves.toBeUndefined()
    expect(browser.permissions.request.called).toBe(false)
  })

  it('still requests a declared optional background permission', async () => {
    browser.runtime.getManifest.callsFake(() => ({
      manifest_version: 2,
      optional_permissions: ['background']
    }))
    const config = getDefaultConfig() as AppConfigMutable
    config.runInBg = true

    await checkBackgroundPermission(config)

    expect(
      browser.permissions.request.calledWith({ permissions: ['background'] })
    ).toBe(true)
  })

  it('still removes a granted optional background permission when disabled', async () => {
    browser.runtime.getManifest.callsFake(() => ({
      manifest_version: 2,
      optional_permissions: ['background']
    }))
    browser.permissions.contains.callsFake(() => Promise.resolve(true))

    await checkBackgroundPermission(getDefaultConfig())

    expect(
      browser.permissions.remove.calledWith({ permissions: ['background'] })
    ).toBe(true)
  })
})
