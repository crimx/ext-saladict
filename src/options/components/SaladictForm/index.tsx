import React, { FC, useContext } from 'react'
import { Form, Button, Modal } from 'antd'
import { FormItemProps } from 'antd/lib/form'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import get from 'lodash/get'
import { map, withLatestFrom } from 'rxjs/operators'
import { useObservableState, useObservable } from 'observable-hooks'
import { resetConfig } from '@/_helpers/config-manager'
import { resetAllProfiles } from '@/_helpers/profile-manager'
import { useTranslate } from '@/_helpers/i18n'
import { isFirefox } from '@/_helpers/saladict'
import { openURL } from '@/_helpers/browser-api'
import { config$$, profile$$, FormDirtyContext } from '@/options/data'
import { formItemLayout, formItemHeadLayout } from '@/options/helpers/layout'
import { uploadResult$$, upload } from '@/options/helpers/upload'

import './_style.scss'

export interface SaladictFormItem extends Omit<FormItemProps, 'name'> {
  name: string
}

export interface SaladictFormProps {
  items: SaladictFormItem[]
}

export const SaladictForm: FC<SaladictFormProps> = props => {
  const { t, i18n, ready } = useTranslate(['options', 'common'])
  const dirtyRef = useContext(FormDirtyContext)
  const { loading: uploading } = useObservableState(uploadResult$$, {
    loading: false
  })

  const initialValues = useObservableState(
    useObservable(
      inputs$ =>
        inputs$.pipe(
          withLatestFrom(config$$, profile$$),
          map(([[items], config, profile]) => {
            const data = { config, profile }
            return items.reduce((o, item) => {
              const value = get(data, item.name, data)
              if (value !== data) {
                o[item.name] = value
              } else if (process.env.DEBUG) {
                console.warn(
                  new Error('Missing value for form key: ' + item.name)
                )
              }
              return o
            }, {} as { [index: string]: any })
          })
        ),
      [props.items]
    )
  )

  return (
    <Form
      {...formItemLayout}
      onFinish={upload}
      initialValues={initialValues}
      onValuesChange={() => (dirtyRef.current = true)}
    >
      {props.items.map(item => {
        item.label = t(item.name)
        const help = `options:${item.name}_help`
        if (ready && i18n.exists(help)) {
          item.help = t(help)
        }
        const extra = `options:${item.name}_extra`
        if (ready && i18n.exists(extra)) {
          item.extra = t(extra)
        }
        return <Form.Item key={item.name} {...item} />
      })}
      <Form.Item {...formItemHeadLayout} className="saladict-form-btns">
        <Button type="primary" htmlType="submit" disabled={uploading}>
          {t('common:save')}
        </Button>
        <Button onClick={openShortcuts}>{t('shortcuts')}</Button>
        <Button
          type="danger"
          onClick={() => {
            Modal.confirm({
              title: t('config.opt.reset_confirm'),
              icon: <ExclamationCircleOutlined />,
              okType: 'danger',
              onOk: async () => {
                await resetConfig()
                await resetAllProfiles()
                dirtyRef.current = false
              }
            })
          }}
        >
          {t('config.opt.reset')}
        </Button>
      </Form.Item>
    </Form>
  )
}

function openShortcuts() {
  if (isFirefox) {
    openURL('about:addons')
  } else {
    openURL('chrome://extensions/shortcuts')
  }
}
