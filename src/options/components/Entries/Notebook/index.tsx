import React, { FC, useMemo, useContext, useState } from 'react'
import { Switch, Checkbox, Button } from 'antd'
import { concat, from } from 'rxjs'
import { pluck } from 'rxjs/operators'
import { useObservableState, useObservable } from 'observable-hooks'
import { objectKeys } from '@/typings/helpers'
import { useTranslate } from '@/_helpers/i18n'
import { storage } from '@/_helpers/browser-api'
import { getConfigPath } from '@/options/helpers/path-joiner'
import { SaladictForm } from '@/options/components/SaladictForm'
import { GlobalsContext } from '@/options/data'
import {
  Service as WebDAVService,
  SyncConfig as WebDAVConfig
} from '@/background/sync-manager/services/webdav'
import {
  Service as ShanbayService,
  SyncConfig as ShanbayConfig
} from '@/background/sync-manager/services/shanbay'
import { ShanbayModal } from './ShanbayModal'
import { WebdavModal } from './WebdavModal'

interface SyncConfigs {
  [WebDAVService.id]?: WebDAVConfig
  [ShanbayService.id]?: ShanbayConfig
}

export const Notebook: FC = () => {
  const { t, i18n, ready } = useTranslate(['options', 'dicts', 'common'])
  const globals = useContext(GlobalsContext)
  const [showWebdav, setShowWebdav] = useState(false)
  const [showShanbay, setShowshanbay] = useState(false)
  const syncConfigs = useObservableState<SyncConfigs>(
    useObservable(() =>
      concat(
        from(storage.sync.get('syncConfig')).pipe(pluck('syncConfig')),
        storage.sync.createStream('syncConfig').pipe(pluck('newValue'))
      )
    )
  )

  return (
    <>
      <SaladictForm
        items={useMemo(
          () => [
            {
              name: getConfigPath('editOnFav'),
              valuePropName: 'checked',
              children: <Switch />
            },
            {
              name: getConfigPath('searhHistory'),
              valuePropName: 'checked',
              children: <Switch />
            },
            {
              name: getConfigPath('searhHistoryInco'),
              hide: values => !values[getConfigPath('searhHistory')],
              valuePropName: 'checked',
              children: <Switch />
            },
            {
              key: getConfigPath('ctxTrans'),
              style: { marginBottom: 10 },
              items: objectKeys(globals.config.ctxTrans).map(id => ({
                name: getConfigPath('ctxTrans', id),
                valuePropName: 'checked',
                style: { marginBottom: 0 },
                children: <Checkbox>{t(`dicts:${id}.name`)}</Checkbox>
              }))
            },
            {
              key: 'syncService.btn.webdav',
              style: { marginBottom: 15 },
              children: (
                <Button onClick={() => setShowWebdav(true)}>{`${t(
                  'syncService.btn.webdav'
                )} (${t(
                  syncConfigs?.[WebDAVService.id]?.url
                    ? 'common:enabled'
                    : 'common:disabled'
                )})`}</Button>
              )
            },
            {
              key: 'syncService.btn.shanbay',
              children: (
                <Button onClick={() => setShowshanbay(true)}>{`${t(
                  'syncService.btn.shanbay'
                )} (${t(
                  syncConfigs?.[ShanbayService.id]?.enable
                    ? 'common:enabled'
                    : 'common:disabled'
                )})`}</Button>
              )
            }
          ],
          [syncConfigs, ready, i18n.language]
        )}
      />
      <ShanbayModal
        syncConfig={syncConfigs?.[ShanbayService.id]}
        show={showShanbay}
        onClose={() => setShowshanbay(false)}
      />
      <WebdavModal
        syncConfig={syncConfigs?.[WebDAVService.id]}
        show={showWebdav}
        onClose={() => setShowWebdav(false)}
      />
    </>
  )
}
