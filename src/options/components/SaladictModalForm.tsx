import React, { FC, useContext, useRef, ReactNode } from 'react'
import { Modal } from 'antd'
import { FormInstance } from 'antd/lib/form'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { useSubscription } from 'observable-hooks'
import { useTranslate } from '@/_helpers/i18n'
import {
  SaladictForm,
  SaladictFormItem,
  SaladictFormProps
} from '@/options/components/SaladictForm'
import { GlobalsContext } from '@/options/data'
import { formItemModalLayout } from '@/options/helpers/layout'
import { uploadResult$$ } from '@/options/helpers/upload'

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
  const globals = useContext(GlobalsContext)
  const formRef = useRef<FormInstance>(null)

  useSubscription(uploadResult$$, result => {
    // successfully saved
    if (visible && !result.loading && !result.error) {
      onClose()
    }
  })

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
        if (globals.dirty) {
          Modal.confirm({
            title: t('unsave_confirm'),
            icon: <ExclamationCircleOutlined />,
            okType: 'danger',
            onOk: () => {
              ;(globals as GlobalsContext).dirty = false
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
