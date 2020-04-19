import React, { FC, useMemo, useState } from 'react'
import { Switch, Select, Button } from 'antd'
import { TCDirection } from '@/app-config'
import { useTranslate, Trans } from '@/_helpers/i18n'
import { getConfigPath } from '@/options/helpers/path-joiner'
import { SaladictForm } from '@/options/components/SaladictForm'
import { StandaloneModal } from './StandaloneModal'

const locLocale: Readonly<TCDirection[]> = [
  'CENTER',
  'TOP',
  'RIGHT',
  'BOTTOM',
  'LEFT',
  'TOP_LEFT',
  'TOP_RIGHT',
  'BOTTOM_LEFT',
  'BOTTOM_RIGHT'
]

export const QuickSearch: FC = () => {
  const { t, i18n, ready } = useTranslate(['options', 'menus'])
  const [showStandaloneModal, setShowStandaloneModal] = useState(false)

  return (
    <>
      <SaladictForm
        items={useMemo(
          () => [
            {
              name: getConfigPath('tripleCtrl'),
              help: (
                <Trans message={t(getConfigPath('tripleCtrl') + '_help')}>
                  <kbd>⌘ Command</kbd>
                  <kbd>Ctrl</kbd>
                </Trans>
              ),
              valuePropName: 'checked',
              children: <Switch />
            },
            {
              name: getConfigPath('tripleCtrlLocation'),
              children: (
                <Select>
                  {locLocale.map(locale => (
                    <Select.Option key={locale} value={locale}>
                      {t(`locations.${locale}`)}
                    </Select.Option>
                  ))}
                </Select>
              )
            },
            {
              name: getConfigPath('tripleCtrlPreload'),
              label: t('preload.title'),
              help: t('preload.help'),
              children: (
                <Select>
                  <Select.Option value="">{t('common:none')}</Select.Option>
                  <Select.Option value="clipboard">
                    {t('preload.clipboard')}
                  </Select.Option>
                  <Select.Option value="selection">
                    {t('preload.selection')}
                  </Select.Option>
                </Select>
              )
            },
            {
              name: getConfigPath('tripleCtrlAuto'),
              label: t('preload.auto'),
              help: t('preload.auto_help'),
              hide: values => !values[getConfigPath('tripleCtrlPreload')],
              valuePropName: 'checked',
              children: <Switch />
            },
            {
              name: getConfigPath('tripleCtrlStandalone'),
              help: (
                <Trans
                  message={t(getConfigPath('tripleCtrlStandalone') + '_help')}
                >
                  <a
                    href="https://saladict.crimx.com/native.html"
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                  >
                    {t('nativeSearch')}
                  </a>
                </Trans>
              ),
              valuePropName: 'checked',
              children: <Switch />
            },
            {
              key: 'config.opt.openTripleCtrlStandalone',
              children: (
                <Button onClick={() => setShowStandaloneModal(true)}>
                  {t('config.opt.openTripleCtrlStandalone')}
                </Button>
              )
            }
          ],
          [ready, i18n.language]
        )}
      />
      <StandaloneModal
        show={showStandaloneModal}
        onClose={() => setShowStandaloneModal(false)}
      />
    </>
  )
}
