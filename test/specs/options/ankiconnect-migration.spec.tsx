import React from 'react'
import ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'
import { notification } from 'antd'
import { AnkiConnectModal } from '@/options/components/Entries/Notebook/sync-services/ankiconnect'
import { Service } from '@/background/sync-manager/services/ankiconnect'
import { ClozeMigrationPlan } from '@/background/sync-manager/services/ankiconnect/migration'
import * as helpersMock from '@/background/sync-manager/__mocks__/helpers'

jest.mock('@/background/sync-manager/helpers')
jest.mock('@/_helpers/i18n', () => ({
  useTranslate: () => ({
    t: key => key,
    i18n: { exists: () => true }
  })
}))
const helpers: typeof helpersMock = require('@/background/sync-manager/helpers')

const plan = {
  source: { name: 'Saladict Word' },
  targetName: 'Saladict Word (Cloze)',
  notes: [{}],
  decks: [{}]
} as ClozeMigrationPlan

describe('Anki migration confirmation', () => {
  let container: HTMLDivElement
  let close: jest.Mock
  let migrate: jest.SpyInstance
  let upload: jest.SpyInstance

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    close = jest.fn()
    helpers.setSyncConfig.mockReset()
    helpers.setSyncConfig.mockResolvedValue(undefined)
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      addListener() {},
      removeListener() {}
    }))
    jest.spyOn(window, 'confirm').mockReturnValue(false)
    jest.spyOn(notification, 'success').mockImplementation(() => {})
    jest.spyOn(notification, 'error').mockImplementation(() => {})
    jest
      .spyOn(Service.prototype, 'init')
      .mockRejectedValue(new Error('notetype_cloze'))
    jest
      .spyOn(Service.prototype, 'prepareClozeMigration')
      .mockResolvedValue(plan)
    migrate = jest.spyOn(Service.prototype, 'migrateCloze')
    upload = jest.spyOn(Service.prototype, 'add').mockResolvedValue(undefined)
    act(() => {
      ReactDOM.render(
        <AnkiConnectModal
          show
          syncConfig={{ ...Service.getDefaultConfig(), enable: true }}
          onClose={close}
        />,
        container
      )
    })
  })
  afterEach(() => {
    act(() => {
      ReactDOM.unmountComponentAtNode(container)
    })
    container.remove()
    jest.restoreAllMocks()
  })

  function button(text: string): HTMLButtonElement {
    const match = [...document.querySelectorAll('button')].find(
      el => el.textContent === text
    )
    if (!match) throw new Error('Missing button: ' + text)
    return match as HTMLButtonElement
  }
  async function click(text: string) {
    await act(async () => {
      button(text).dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await Promise.resolve()
    })
  }

  it('offers migration after Verify without uploading or changing settings, and allows cancellation', async () => {
    await click('syncService.ankiconnect.verify')
    expect(button('sync:ankiconnect.migration.action')).toBeTruthy()
    expect(migrate).not.toHaveBeenCalled()
    expect(upload).not.toHaveBeenCalled()
    expect(window.confirm).not.toHaveBeenCalled()
    expect(helpers.setSyncConfig).not.toHaveBeenCalled()
    // The last Cancel belongs to the migration dialog above the settings dialog.
    const cancels = [...document.querySelectorAll('button')].filter(
      el => el.textContent === 'common:cancel'
    )
    await act(async () => {
      cancels[cancels.length - 1].dispatchEvent(
        new MouseEvent('click', { bubbles: true })
      )
    })
    expect(migrate).not.toHaveBeenCalled()
    expect(helpers.setSyncConfig).not.toHaveBeenCalled()
    expect(close).not.toHaveBeenCalled()
  })

  it('does not persist an invalid type when Save offers migration', async () => {
    await click('common:save')
    expect(button('sync:ankiconnect.migration.action')).toBeTruthy()
    expect(helpers.setSyncConfig).not.toHaveBeenCalled()
    expect(close).not.toHaveBeenCalled()
  })

  it('saves the new type only after an explicitly confirmed migration completes', async () => {
    let finish: (value: {
      noteType: string
      backupPaths: string[]
    }) => void = () => {}
    migrate.mockImplementation(
      () =>
        new Promise(resolve => {
          finish = resolve
        })
    )
    await click('syncService.ankiconnect.verify')
    await click('sync:ankiconnect.migration.action')
    expect(migrate).toHaveBeenCalledTimes(1)
    expect(helpers.setSyncConfig).not.toHaveBeenCalled()
    await act(async () => {
      finish({ noteType: plan.targetName, backupPaths: ['/backup.apkg'] })
      await Promise.resolve()
    })
    expect(helpers.setSyncConfig).toHaveBeenCalledWith(
      'ankiconnect',
      expect.objectContaining({ noteType: plan.targetName, enable: true })
    )
    expect(close).toHaveBeenCalledTimes(1)
    expect(upload).not.toHaveBeenCalled()
  })

  it('retains backup paths and does not switch settings on a migration failure', async () => {
    migrate.mockImplementation(async (_, onBackup) => {
      onBackup(['/backup.apkg'])
      throw new Error('migration_verify')
    })
    await click('syncService.ankiconnect.verify')
    await click('sync:ankiconnect.migration.action')
    expect(document.body.textContent).toContain('/backup.apkg')
    expect(document.body.textContent).toContain(
      'sync:ankiconnect.error.migration_verify'
    )
    expect(helpers.setSyncConfig).not.toHaveBeenCalled()
    expect(close).not.toHaveBeenCalled()
  })

  it('keeps the new type in the form if saving settings fails after migration', async () => {
    migrate.mockResolvedValue({ noteType: plan.targetName, backupPaths: [] })
    helpers.setSyncConfig.mockRejectedValueOnce(new Error('storage failure'))
    await click('syncService.ankiconnect.verify')
    await click('sync:ankiconnect.migration.action')
    expect(
      (document.getElementById('noteType') as HTMLInputElement).value
    ).toBe(plan.targetName)
    expect(document.body.textContent).toContain(
      'sync:ankiconnect.error.storage failure'
    )
    expect(close).not.toHaveBeenCalled()
  })
})
