import React, { FC } from 'react'
import { Switch } from 'antd'
import { getConfigPath } from '@/options/helpers/path-joiner'
import { SaladictForm } from '@/options/components/SaladictForm'
import { isFirefox } from '@/_helpers/saladict'

export const Privacy: FC = () => {
  return (
    <SaladictForm
      items={[
        {
          name: getConfigPath('updateCheck'),
          valuePropName: 'checked',
          children: <Switch />
        },
        {
          name: getConfigPath('analytics'),
          hide: () => isFirefox,
          valuePropName: 'checked',
          children: <Switch />
        },
        {
          name: getConfigPath('searchHistory'),
          valuePropName: 'checked',
          children: <Switch />
        },
        {
          name: getConfigPath('searchHistoryInco'),
          hide: values => !values[getConfigPath('searchHistory')],
          valuePropName: 'checked',
          children: <Switch />
        },
        {
          key: 'third_party_privacy',
          children: <Switch disabled checked />
        }
      ]}
    />
  )
}
