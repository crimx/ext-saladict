import React, { FC, useRef } from 'react'
import { Input, Modal } from 'antd'
import { ProfileID } from '@/app-config/profiles'

export interface EditNameModalProps {
  title: string
  show: boolean
  profileID: ProfileID | null
  onClose: (newProfileID?: ProfileID) => void
}

export const EditNameModal: FC<EditNameModalProps> = props => {
  const inputRef = useRef<Input | null>(null)

  return (
    <Modal
      visible={props.show}
      title={props.title}
      destroyOnClose
      onOk={() => {
        const name = (inputRef.current?.input.value || '').trim()
        if (name && props.profileID) {
          props.onClose({
            ...props.profileID,
            name
          })
        } else {
          props.onClose()
        }
      }}
      onCancel={() => props.onClose()}
    >
      <Input ref={inputRef} autoFocus defaultValue={props.profileID?.name} />
    </Modal>
  )
}
