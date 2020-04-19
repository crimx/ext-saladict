import React, { FC, useMemo, useContext } from 'react'
import { Switch, Select } from 'antd'
import { useTranslate } from '@/_helpers/i18n'
import { getConfigPath } from '@/options/helpers/path-joiner'
import { SaladictForm } from '@/options/components/SaladictForm'
import { GlobalsContext } from '@/options/data'

export const Popup: FC = () => {
  const { t, i18n, ready } = useTranslate(['options', 'menus'])
  const globals = useContext(GlobalsContext)

  return (
    <SaladictForm
      items={useMemo(
        () => [
          {
            name: getConfigPath('baOpen'),
            children: (
              <Select>
                <Select.Option value="popup_panel">
                  {t('config.opt.baOpen.popup_panel')}
                </Select.Option>
                <Select.Option value="popup_fav">
                  {t('config.opt.baOpen.popup_fav')}
                </Select.Option>
                <Select.Option value="popup_options">
                  {t('config.opt.baOpen.popup_options')}
                </Select.Option>
                <Select.Option value="popup_standalone">
                  {t('config.opt.baOpen.popup_standalone')}
                </Select.Option>
                {Object.keys(globals.config.contextMenus.all).map(id => (
                  <Select.Option key={id} value={id}>
                    {t(`menus:${id}`)}
                  </Select.Option>
                ))}
              </Select>
            )
          },
          {
            name: getConfigPath('baPreload'),
            label: t('preload.title'),
            help: t('preload.help'),
            hide: values => values[getConfigPath('baOpen')] !== 'popup_panel',
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
            name: getConfigPath('baAuto'),
            label: t('preload.auto'),
            help: t('preload.auto_help'),
            hide: values =>
              values[getConfigPath('baOpen')] !== 'popup_panel' ||
              !values[getConfigPath('baPreload')],
            valuePropName: 'checked',
            children: <Switch />
          }
        ],
        [ready, i18n.language]
      )}
    />
  )
}
