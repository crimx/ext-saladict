import React, { FC, useState, useEffect, useRef } from 'react'
import { Modal, Form, Slider, Button, message as antdMsg } from 'antd'
import { FormInstance } from 'antd/lib/form'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import {
  setTitlebarOffset,
  TitlebarOffset,
  getTitlebarOffset,
  calibrateTitlebarOffset
} from '@/_helpers/titlebar-offset'
import { formItemModalLayout } from '@/options/helpers/layout'
import { pixelSlideFormatter } from '@/options/components/SaladictForm'
import { useTranslate } from '@/_helpers/i18n'

export interface TitlebarOffsetModalProps {
  show: boolean
  onClose: () => void
}

export const TitlebarOffsetModal: FC<TitlebarOffsetModalProps> = props => {
  const { t } = useTranslate(['options', 'common'])
  const [offset, setOffset] = useState<TitlebarOffset>()
  const formRef = useRef<FormInstance>(null)

  useEffect(() => {
    if (props.show) return

    let stale = false

    getTitlebarOffset().then(titlebarOffset => {
      if (!stale) {
        setOffset(
          titlebarOffset || {
            main: 0,
            panel: 0
          }
        )
      }
    })

    return () => {
      stale = true
    }
  }, [props.show])

  const onSubmit = () => {
    if (formRef.current) {
      formRef.current.submit()
    }
  }

  const onCancel = () => {
    if (formRef.current && formRef.current.isFieldsTouched()) {
      Modal.confirm({
        title: t('unsave_confirm'),
        icon: <ExclamationCircleOutlined />,
        okType: 'danger',
        onOk: props.onClose
      })
    } else {
      props.onClose()
    }
  }

  const onFormFinish = async (values: any) => {
    if (process.env.DEBUG) {
      console.log(values)
    }
    await setTitlebarOffset(values as TitlebarOffset)
    antdMsg.destroy()
    antdMsg.success(t('msg_updated'))
    props.onClose()
  }

  const onCalibrate = async () => {
    const offset = await calibrateTitlebarOffset()

    if (offset && formRef.current) {
      formRef.current.setFieldsValue(offset)
      antdMsg.destroy()
      antdMsg.success(t('titlebarOffset.calibrateSuccess'))
    } else {
      antdMsg.destroy()
      antdMsg.error(t('titlebarOffset.calibrateError'))
    }
  }

  return (
    <Modal
      title={t('titlebarOffset.title')}
      visible={props.show && !!offset}
      onOk={onSubmit}
      onCancel={onCancel}
      footer={[
        <Button key="calibration" onClick={onCalibrate}>
          {t('titlebarOffset.calibrate')}
        </Button>,
        <Button key="cancel" onClick={onCancel}>
          {t('common:cancel')}
        </Button>,
        <Button key="submit" type="primary" onClick={onSubmit}>
          {t('common:save')}
        </Button>
      ]}
    >
      <p>{t('titlebarOffset.help')}</p>
      <Form
        {...formItemModalLayout}
        initialValues={offset}
        ref={formRef}
        onFinish={onFormFinish}
      >
        <Form.Item
          name="main"
          label={t('titlebarOffset.main')}
          help={t('titlebarOffset.main_help')}
        >
          <Slider
            tipFormatter={pixelSlideFormatter}
            min={0}
            max={100}
            marks={{ 0: '0px', 100: '100px' }}
          />
        </Form.Item>
        <Form.Item
          name="panel"
          label={t('titlebarOffset.panel')}
          help={t('titlebarOffset.panel_help')}
        >
          <Slider
            tipFormatter={pixelSlideFormatter}
            min={0}
            max={100}
            marks={{ 0: '0px', 100: '100px' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
