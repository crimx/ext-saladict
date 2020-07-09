import React, { FC } from 'react'
import { Switch, Select } from 'antd'
import { useTranslate } from '@/_helpers/i18n'
import { useSelector } from '@/content/redux'
import { getConfigPath, getProfilePath } from '@/options/helpers/path-joiner'
import { SaladictForm } from '@/options/components/SaladictForm'

export const Pronunciation: FC = () => {
  const { t } = useTranslate(['options', 'common', 'dicts'])
  const autopronLists = useSelector(state => ({
    cn: state.activeProfile.dicts.all.zdic.options.audio
      ? state.config.autopron.cn.list
      : state.config.autopron.cn.list.filter(id => id !== 'zdic'),
    en: state.config.autopron.en.list,
    machine: state.config.autopron.machine.list
  }))

  return (
    <SaladictForm
      items={[
        {
          name: getConfigPath('autopron', 'cn', 'dict'),
          children: (
            <Select>
              <Select.Option value="">{t('common:none')}</Select.Option>
              {autopronLists.cn.map(id => (
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
              {autopronLists.en.map(id => (
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
              {autopronLists.machine.map(id => (
                <Select.Option key={id} value={id}>
                  {t(`dicts:${id}.name`)}
                </Select.Option>
              ))}
            </Select>
          )
        },
        {
          name: getConfigPath('autopron', 'machine', 'src'),
          hide: values => !values[getConfigPath('autopron', 'machine', 'dict')],
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
      ]}
    />
  )
}
