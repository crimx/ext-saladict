import React, { FC } from 'react'
import { Switch, Select } from 'antd'
import { useRefFn } from 'observable-hooks'
import { getConfigPath } from '@/options/helpers/path-joiner'
import { SaladictForm } from '@/options/components/SaladictForm'

export const General: FC = () => {
  return (
    <SaladictForm
      items={
        useRefFn(() => [
          {
            name: getConfigPath('active'),
            valuePropName: 'checked',
            children: <Switch />
          },
          {
            name: getConfigPath('animation'),
            valuePropName: 'checked',
            children: <Switch />
          },
          {
            name: getConfigPath('darkMode'),
            valuePropName: 'checked',
            children: <Switch />
          },
          {
            name: getConfigPath('langCode'),
            children: (
              <Select>
                <Select.Option value="zh-CN">简体中文</Select.Option>
                <Select.Option value="zh-TW">繁體中文</Select.Option>
                <Select.Option value="en">English</Select.Option>
              </Select>
            )
          }
        ]).current
      }
    />
  )
}
