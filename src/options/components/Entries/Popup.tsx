import React, { FC } from 'react'
import { Switch, Select, Slider } from 'antd'
import { useTranslate } from '@/_helpers/i18n'
import { isFirefox } from '@/_helpers/saladict'
import { useSelector } from '@/content/redux'
import { getConfigPath } from '@/options/helpers/path-joiner'
import {
  SaladictForm,
  pixelSlideFormatter
} from '@/options/components/SaladictForm'

export const Popup: FC = () => {
  const { t } = useTranslate(['options', 'menus'])
  const menusIds = useSelector(state => {
    const ids = Object.keys(state.config.contextMenus.all)
    if (isFirefox) {
      return ids.filter(id => {
        switch (id) {
          case 'youdao_page_translate':
          case 'caiyuntrs':
            return false
        }
        return true
      })
    }
    return ids
  })
  const { availWidth } = window.screen

  return (
    <SaladictForm
      items={[
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
              {menusIds.map(id => (
                <Select.Option key={id} value={id}>
                  {t(`menus:${id}`)}
                </Select.Option>
              ))}
            </Select>
          )
        },
        {
          name: getConfigPath('baWidth'),
          hide: values => values[getConfigPath('baOpen')] !== 'popup_panel',
          children: (
            <Slider
              tipFormatter={pixelSlideFormatter}
              min={-1}
              max={availWidth}
              marks={{
                '-1': '-1',
                450: '450px',
                [availWidth]: `${availWidth}px`
              }}
            />
          )
        },
        {
          name: getConfigPath('baHeight'),
          hide: values => values[getConfigPath('baOpen')] !== 'popup_panel',
          children: (
            <Slider
              tipFormatter={pixelSlideFormatter}
              min={250}
              max={availWidth}
              marks={{
                250: '250px',
                550: '550px',
                [availWidth]: `${availWidth}px`
              }}
            />
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
      ]}
    />
  )
}
