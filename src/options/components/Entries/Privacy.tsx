import React, { FC } from 'react'
import { Switch } from 'antd'
import { useFixedMemo } from '@/_helpers/hooks'
import { getConfigPath } from '@/options/helpers/path-joiner'
import { SaladictForm } from '@/options/components/SaladictForm'

export const Privacy: FC = () => {
  return (
    <SaladictForm
      items={useFixedMemo(() => [
        {
          name: getConfigPath('updateCheck'),
          valuePropName: 'checked',
          children: <Switch />
        },
        {
          name: getConfigPath('analytics'),
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
      ])}
    />
  )
}
