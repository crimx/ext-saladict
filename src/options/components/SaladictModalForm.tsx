import React, { FC, useRef, ReactNode } from 'react'
import { useUpdateEffect } from 'react-use'
import { useObservableState } from 'observable-hooks'
import { Modal } from 'antd'
import { FormInstance } from 'antd/lib/form'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { useTranslate } from '@/_helpers/i18n'
import {
  SaladictForm,
  SaladictFormItem,
  SaladictFormProps
} from '@/options/components/SaladictForm'
import { formItemModalLayout } from '@/options/helpers/layout'
import { useFormDirty, setFormDirty } from '@/options/helpers/use-form-dirty'
import { uploadStatus$ } from '@/options/helpers/upload'

export interface SaladictModalFormProps
  extends Omit<SaladictFormProps, 'title'> {
  visible: boolean
  title: ReactNode
  zIndex?: number
  items: SaladictFormItem[]
  onClose: () => void
}

export const SaladictModalForm: FC<SaladictModalFormProps> = props => {
  const { visible, title, zIndex, onClose, ...restProps } = props
  const { t } = useTranslate('options')
  const uploadStatus = useObservableState(uploadStatus$, 'idle')
  const formDirtyRef = useFormDirty()
  const formRef = useRef<FormInstance>(null)

  useUpdateEffect(() => {
    if (visible && uploadStatus === 'idle') {
      onClose()
    }
  }, [uploadStatus])

  return (
    <Modal
      visible={visible}
      title={title}
      zIndex={zIndex}
      width={600}
      destroyOnClose
      onOk={() => {
        if (formRef.current) {
          formRef.current.submit()
        }
      }}
      onCancel={() => {
        if (formDirtyRef.value) {
          Modal.confirm({
            title: t('unsave_confirm'),
            icon: <ExclamationCircleOutlined />,
            okType: 'danger',
            onOk: () => {
              setFormDirty(false)
              onClose()
            }
          })
        } else {
          onClose()
        }
      }}
    >
      <SaladictForm
        {...formItemModalLayout}
        hideFooter
        {...restProps}
        ref={formRef}
      />
    </Modal>
  )
}
