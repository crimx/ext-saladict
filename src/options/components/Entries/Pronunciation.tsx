import React, { FC, useContext, useMemo } from 'react'
import { Switch, Select } from 'antd'
import { useObservableGetState } from 'observable-hooks'
import { useTranslate } from '@/_helpers/i18n'
import { GlobalsContext, profile$$ } from '@/options/data'
import { getConfigPath, getProfilePath } from '@/options/helpers/path-joiner'
import { SaladictForm } from '@/options/components/SaladictForm'

export const Pronunciation: FC = () => {
  const { t, i18n, ready } = useTranslate(['options', 'common', 'dicts'])
  const globals = useContext(GlobalsContext)
  const zdicAudio = useObservableGetState(
    profile$$,
    'dicts',
    'all',
    'zdic',
    'options',
    'audio'
  )

  const autopronCNList = useMemo(
    () =>
      zdicAudio
        ? globals.config.autopron.cn.list
        : globals.config.autopron.cn.list.filter(id => id !== 'zdic'),
    [zdicAudio]
  )

  return (
    <SaladictForm
      items={useMemo(
        () => [
          {
            name: getConfigPath('autopron', 'cn', 'dict'),
            children: (
              <Select>
                <Select.Option value="">{t('common:none')}</Select.Option>
                {autopronCNList.map(id => (
                  <Select.Option key={id} value={id}>
                    {t(`dicts:${id}.name`)}
                  </Select.Option>
                ))}
              </Select>
            )
          },
          {
            name: getConfigPath('autopron', 'en', 'dict'),
            children: (
              <Select>
                <Select.Option value="">{t('common:none')}</Select.Option>
                {globals.config.autopron.en.list.map(id => (
                  <Select.Option key={id} value={id}>
                    {t(`dicts:${id}.name`)}
                  </Select.Option>
                ))}
              </Select>
            )
          },
          {
            name: getConfigPath('autopron', 'en', 'accent'),
            hide: values => !values[getConfigPath('autopron', 'en', 'dict')],
            children: (
              <Select>
                <Select.Option value="uk">
                  {t('config.opt.accent.uk')}
                </Select.Option>
                <Select.Option value="us">
                  {t('config.opt.accent.us')}
                </Select.Option>
              </Select>
            )
          },
          {
            name: getConfigPath('autopron', 'machine', 'dict'),
            children: (
              <Select>
                <Select.Option value="">{t('common:none')}</Select.Option>
                {globals.config.autopron.machine.list.map(id => (
                  <Select.Option key={id} value={id}>
                    {t(`dicts:${id}.name`)}
                  </Select.Option>
                ))}
              </Select>
            )
          },
          {
            name: getConfigPath('autopron', 'machine', 'src'),
            hide: values =>
              !values[getConfigPath('autopron', 'machine', 'dict')],
            children: (
              <Select>
                <Select.Option value="trans">
                  {t('config.autopron.machine.src_trans')}
                </Select.Option>
                <Select.Option value="searchText">
                  {t('config.autopron.machine.src_search')}
                </Select.Option>
              </Select>
            )
          },
          {
            name: getProfilePath('waveform'),
            valuePropName: 'checked',
            children: <Switch />
          }
        ],
        [ready, i18n.language, autopronCNList]
      )}
    />
  )
}
