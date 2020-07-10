import React, { FC, useRef } from 'react'
import { shallowEqual } from 'react-redux'
import { useUpdateEffect } from 'react-use'
import { useObservableState } from 'observable-hooks'
import { Form, Modal, Button } from 'antd'
import { FormInstance, Rule } from 'antd/lib/form'
import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { useTranslate, Trans } from '@/_helpers/i18n'
import { matchPatternToRegExpStr } from '@/_helpers/matchPatternToRegExpStr'
import { useSelector } from '@/content/redux'
import { getConfigPath } from '@/options/helpers/path-joiner'
import { useUpload, uploadStatus$ } from '@/options/helpers/upload'
import { PatternItem } from './ PatternItem'

export interface MatchPatternModalProps {
  area: null | 'pdfWhitelist' | 'pdfBlacklist' | 'whitelist' | 'blacklist'
  onClose: () => void
}

export const MatchPatternModal: FC<MatchPatternModalProps> = ({
  area,
  onClose
}) => {
  const { t } = useTranslate(['options', 'common'])
  const formRef = useRef<FormInstance>(null)
  const uploadStatus = useObservableState(uploadStatus$, 'idle')
  const patterns = useSelector(
    state => ({
      pdfWhitelist: state.config.pdfWhitelist,
      pdfBlacklist: state.config.pdfBlacklist,
      whitelist: state.config.whitelist,
      blacklist: state.config.blacklist
    }),
    shallowEqual
  )
  const upload = useUpload()

  useUpdateEffect(() => {
    if (area && uploadStatus === 'idle') {
      onClose()
    }
  }, [uploadStatus])

  const title = area
    ? (area.startsWith('pdf') ? 'PDF ' : '') +
      t(area.endsWith('hitelist') ? 'common:whitelist' : 'common:blacklist')
    : t('nav.BlackWhiteList')

  async function validatePatterns(rule: Rule, value: [string, string]) {
    if (value[1]) {
      // url
      value[0] = matchPatternToRegExpStr(value[1])
      if (!value[0]) {
        throw new Error(t('matchPattern.url_error'))
      }
    } else if (value[0]) {
      // regex
      try {
        RegExp(value[0])
      } catch (e) {
        throw new Error(t('matchPattern.regex_error'))
      }
    }
  }

  return (
    <Modal
      visible={!!area}
      title={title}
      destroyOnClose
      onOk={() => {
        if (formRef.current) {
          formRef.current.submit()
        }
      }}
      onCancel={() => {
        if (formRef.current && formRef.current.isFieldsTouched()) {
          Modal.confirm({
            title: t('unsave_confirm'),
            icon: <ExclamationCircleOutlined />,
            okType: 'danger',
            onOk: onClose
          })
        } else {
          onClose()
        }
      }}
    >
      <p>
        <Trans message={t('matchPattern.description')}>
          <a
            href="https://developer.mozilla.org/zh-CN/Add-ons/WebExtensions/Match_patterns#范例"
            target="_blank"
            rel="nofollow noopener noreferrer"
          >
            {t('matchPattern.url')}
          </a>
          <a
            href="https://deerchao.cn/tutorials/regex/regex.htm"
            target="_blank"
            rel="nofollow noopener noreferrer"
          >
            {t('matchPattern.regex')}
          </a>
        </Trans>
      </p>
      <Form
        ref={formRef}
        wrapperCol={{ span: 24 }}
        initialValues={area ? { patterns: patterns[area] } : {}}
        onFinish={values => {
          if (area) {
            const patterns: [string, string][] | undefined = values.patterns
            upload({
              [getConfigPath(area)]: (patterns || []).filter(p => p[0])
            })
          }
        }}
      >
        <Form.List name="patterns">
          {(fields, { add }) => (
            <div>
              {fields.map(field => (
                <Form.Item
                  // @ts-ignore
                  key={field.key}
                  {...field}
                  validateTrigger={['onChange', 'onBlur']}
                  hasFeedback
                  rules={[{ validator: validatePatterns }]}
                >
                  <PatternItem />
                </Form.Item>
              ))}
              <Form.Item>
                <Button type="dashed" block onClick={() => add(['', ''])}>
                  <PlusOutlined /> {t('common:add')}
                </Button>
              </Form.Item>
            </div>
          )}
        </Form.List>
      </Form>
    </Modal>
  )
}
