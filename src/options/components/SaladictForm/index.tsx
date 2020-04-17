import React, { useContext, ReactNode, useMemo, Ref } from 'react'
import { Form, Button, Modal, Tooltip } from 'antd'
import { FormItemProps, Rule, FormProps, FormInstance } from 'antd/lib/form'
import { ExclamationCircleOutlined, BlockOutlined } from '@ant-design/icons'
import get from 'lodash/get'
import mapValues from 'lodash/mapValues'
import { startWith, map, distinctUntilChanged } from 'rxjs/operators'
import { useObservableState } from 'observable-hooks'
import { resetConfig } from '@/_helpers/config-manager'
import { resetAllProfiles } from '@/_helpers/profile-manager'
import { useTranslate } from '@/_helpers/i18n'
import { isFirefox } from '@/_helpers/saladict'
import { openURL } from '@/_helpers/browser-api'
import { GlobalsContext } from '@/options/data'
import { formItemLayout, formItemFooterLayout } from '@/options/helpers/layout'
import { uploadResult$$, upload } from '@/options/helpers/upload'
import shallowEqual from 'shallowequal'

import './_style.scss'

interface FieldValues {
  [name: string]: any
}

interface FieldShow {
  [name: string]: boolean
}

export interface SaladictFormItem
  extends Omit<FormItemProps, 'name' | 'children'> {
  /** Must set name or key. Set name if the item has value. */
  name?: string
  /** Must set name or key. Set key if the item does not carry value. */
  key?: string
  /** Hide item based on other fields */
  hide?: (values: FieldValues) => boolean
  /** Nested items. Must set items or children. */
  items?: SaladictFormItem[]
  /** Must set items or children. */
  children?: ReactNode
}

export interface SaladictFormProps extends FormProps {
  items: SaladictFormItem[]
  hideFooter?: boolean
}

export const SaladictForm = React.forwardRef(
  (props: SaladictFormProps, ref: Ref<FormInstance>) => {
    const { items, hideFooter, ...restProps } = props
    const { t, i18n, ready } = useTranslate(['options', 'common'])
    const globals = useContext(GlobalsContext)
    const { loading: uploading } = useObservableState(uploadResult$$, {
      loading: false
    })

    function extractInitial(
      items: SaladictFormItem[],
      result: {
        initialValues: { [index: string]: any }
        hideFieldFns: { [index: string]: (values: FieldValues) => boolean }
      } = { initialValues: {}, hideFieldFns: {} }
    ): { [index: string]: any } {
      for (const item of items) {
        if (item.items) {
          extractInitial(item.items, result)
        } else {
          if (item.hide) {
            result.hideFieldFns[(item.key || item.name)!] = item.hide
          }

          if (item.name) {
            const value = get(globals, item.name, globals)
            if (value !== globals) {
              result.initialValues[item.name] = value
            } else if (process.env.DEBUG) {
              console.warn(
                new Error('Missing value for form key: ' + item.name)
              )
            }
          }
        }
      }
      return result
    }

    const { initialValues, hideFieldFns } = useMemo(
      () => extractInitial(items),
      [items]
    )

    const [hideFields, setHideFields] = useObservableState<
      FieldShow,
      FieldValues,
      true
    >(input$ =>
      input$.pipe(
        map(values => mapValues(hideFieldFns, hide => hide(values))),
        startWith(mapValues(hideFieldFns, hide => hide(initialValues))),
        distinctUntilChanged(shallowEqual)
      )
    )

    function genFormItems(items: SaladictFormItem[]) {
      return items.map(item => {
        const name = (item.key || item.name)!
        const isProfile = name.startsWith('profile.')

        if (
          item.label === undefined &&
          ready &&
          i18n.exists(`options:${name}`)
        ) {
          item.label = isProfile ? (
            <Tooltip
              title={t('profile.opt.item_extra')}
              className="saladict-form-profile-title"
            >
              <span>
                <BlockOutlined />
                {t(name)}
              </span>
            </Tooltip>
          ) : (
            t(name)
          )
        }

        if (item.help === undefined) {
          const help = `options:${name}_help`
          if (ready && i18n.exists(help)) {
            item.help = t(help)
          }
        }

        if (item.extra === undefined) {
          const extra = `options:${name}_extra`
          if (ready && i18n.exists(extra)) {
            item.extra = t(extra)
          }
        }

        let { className, hide, children, items: subItems, ...itemProps } = item
        if (hideFields[name]) {
          className = className ? className + ' saladict-hide' : 'saladict-hide'
        }

        return (
          <Form.Item key={name} {...itemProps} className={className}>
            {subItems ? genFormItems(subItems) : children!}
          </Form.Item>
        )
      })
    }

    const formItems = useMemo(() => genFormItems(items), [
      ready,
      i18n.language,
      hideFields,
      items
    ])

    return (
      <Form
        {...formItemLayout}
        initialValues={initialValues}
        onFinish={upload}
        onValuesChange={(_, values) => {
          ;(globals as GlobalsContext).dirty = true
          setHideFields(values)
        }}
        {...restProps}
        ref={ref}
      >
        {formItems}
        {!hideFooter && (
          <Form.Item {...formItemFooterLayout} className="saladict-form-btns">
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
                    ;(globals as GlobalsContext).dirty = false
                  }
                })
              }}
            >
              {t('config.opt.reset')}
            </Button>
          </Form.Item>
        )}
      </Form>
    )
  }
)

export const NUMBER_RULES: Rule[] = [
  { type: 'number', whitespace: true, required: true }
]

export const percentageSlideFormatter = (v: number) => `${v}%`

export const pixelSlideFormatter = (v: number) => `${v}px`

function openShortcuts() {
  if (isFirefox) {
    openURL('about:addons')
  } else {
    openURL('chrome://extensions/shortcuts')
  }
}
