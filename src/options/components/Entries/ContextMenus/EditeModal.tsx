import React, { FC, useMemo, useRef } from 'react'
import { Input, Modal, Form } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { FormInstance } from 'antd/lib/form/Form'
import { useObservableGetState, useSubscription } from 'observable-hooks'
import { useTranslate } from '@/_helpers/i18n'
import { config$$ } from '@/options/data'
import { upload, uploadResult$$ } from '@/options/helpers/upload'

export interface EditModalProps {
  menuID?: string | null
  onClose: () => void
}

export const EditModal: FC<EditModalProps> = ({ menuID, onClose }) => {
  const { t } = useTranslate(['options', 'dicts', 'common', 'langcode'])
  const formRef = useRef<FormInstance>(null)
  const allMenus = useObservableGetState(config$$, null, 'contextMenus', 'all')

  const namePath = `config.contextMenus.all.${menuID}.name`
  const urlPath = `config.contextMenus.all.${menuID}.url`

  const initialValues = useMemo(() => {
    if (allMenus && menuID) {
      const item = allMenus[menuID]
      if (typeof item === 'string') {
        return {
          [namePath]: t(`menus:${menuID}`),
          [urlPath]: item
        }
      }
      if (item) {
        return {
          [namePath]: item.name,
          [urlPath]: item.url
        }
      }
    }
    return {
      [namePath]: '',
      [urlPath]: ''
    }
  }, [allMenus, menuID])

  useSubscription(uploadResult$$, result => {
    if (menuID && !result.loading && !result.error) {
      onClose()
    }
  })

  return (
    <Modal
      visible={!!menuID}
      zIndex={1001}
      title={t(`config.opt.contextMenus_edit`)}
      destroyOnClose
      onOk={submitForm}
      onCancel={closeModal}
    >
      <Form ref={formRef} initialValues={initialValues} onFinish={upload}>
        <Form.Item name={namePath} label={t('common:name')}>
          <Input />
        </Form.Item>
        <Form.Item name={urlPath} label="URL">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  )

  function submitForm() {
    if (formRef.current) {
      formRef.current.submit()
    }
  }

  function closeModal() {
    if (formRef.current && formRef.current.isFieldsTouched()) {
      Modal.confirm({
        zIndex: 1002,
        title: t('syncService.close_confirm'),
        icon: <ExclamationCircleOutlined />,
        okType: 'danger',
        onOk: onClose
      })
    } else {
      onClose()
    }
  }
}
