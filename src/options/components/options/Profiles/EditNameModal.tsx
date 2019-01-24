import React from 'react'

import { FormComponentProps } from 'antd/lib/form'
import { Form, Input, Modal } from 'antd'

export interface EditNameModalProps extends FormComponentProps {
  title: string
  show: boolean
  name: string
  onClose: (value?: string) => void
}

export class EditNameModal extends React.Component<EditNameModalProps> {
  render () {
    const { title, onClose, name, show } = this.props
    const { getFieldDecorator, getFieldValue } = this.props.form

    return (
      <Modal
        visible={show}
        title={title}
        destroyOnClose
        onOk={() => onClose(getFieldValue('profile_name'))}
        onCancel={() => onClose()}
      >
        <Form>
          <Form.Item>{
            getFieldDecorator('profile_name', {
              initialValue: name,
            })(
              <Input autoFocus />
            )
          }</Form.Item>
        </Form>
      </Modal>
    )
  }
}

export default Form.create()(EditNameModal)
