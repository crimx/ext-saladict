import React, { FC } from 'react'
import { Switch, Checkbox, Slider } from 'antd'
import { useTranslate } from '@/_helpers/i18n'
import { getConfigPath, getProfilePath } from '@/options/helpers/path-joiner'
import { SaladictForm } from '@/options/components/SaladictForm'
import { supportedLangs } from '@/_helpers/lang-check'
import { searchMode } from './searchMode'

export const SearchModes: FC = () => {
  const { t } = useTranslate(['options', 'common'])
  return (
    <SaladictForm
      items={[
        {
          name: getConfigPath('noTypeField'),
          valuePropName: 'checked',
          children: <Switch />
        },
        {
          name: getConfigPath('touchMode'),
          valuePropName: 'checked',
          children: <Switch />
        },
        {
          key: getConfigPath('language'),
          className: 'saladict-form-danger-extra',
          items: supportedLangs.map(lang => ({
            name: getConfigPath('language', lang),
            className: 'form-item-inline',
            valuePropName: 'checked',
            children: <Checkbox>{t(`common:lang.${lang}`)}</Checkbox>
          }))
        },
        {
          name: getProfilePath('stickyFold'),
          valuePropName: 'checked',
          children: <Switch />
        },
        {
          name: getConfigPath('doubleClickDelay'),
          children: (
            <Slider
              tipFormatter={v => v + t('common:unit.ms')}
              min={100}
              max={2000}
              marks={{
                100: '0.1' + t('common:unit.s'),
                2000: '2' + t('common:unit.s')
              }}
            />
          )
        },
        searchMode('mode', t),
        searchMode('pinMode', t),
        searchMode('panelMode', t),
        searchMode('qsPanelMode', t)
      ]}
    />
  )
}
