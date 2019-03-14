import React from 'react'
import { Props } from '../typings'
import { updateConfigOrProfile, formItemLayout } from '../helpers'
import WebdavModal from './WebdavModal'

import { FormComponentProps } from 'antd/lib/form'
import { Form, Switch, Checkbox, Button } from 'antd'

export type NotebookProps = Props & FormComponentProps

export interface NotebookState {
  isShowSyncServiceModal: boolean
}

export class Notebook extends React.Component<NotebookProps, NotebookState> {
  state: NotebookState = {
    isShowSyncServiceModal: false,
  }

  openSyncService = () => {
    this.setState({ isShowSyncServiceModal: true })
  }

  closeSyncServiceModal = () => {
    this.setState({ isShowSyncServiceModal: false })
  }

  render () {
    const { t, config } = this.props
    const { getFieldDecorator } = this.props.form

    return (
      <Form>
        <Form.Item
          {...formItemLayout}
          label={t('opt_edit_on_fav')}
          help={t('opt_edit_on_fav_help')}
        >{
          getFieldDecorator('config#editOnFav', {
            initialValue: config.editOnFav,
            valuePropName: 'checked',
          })(
            <Switch />
          )
        }</Form.Item>
        <Form.Item
          {...formItemLayout}
          label={t('opt_history')}
          help={t('opt_history_help')}
        >{
          getFieldDecorator('config#searhHistory', {
            initialValue: config.searhHistory,
            valuePropName: 'checked',
          })(
            <Switch />
          )
        }</Form.Item>
        {config.searhHistory &&
          <Form.Item
            {...formItemLayout}
            label={t('opt_history_inco')}
          >{
            getFieldDecorator('config#searhHistoryInco', {
              initialValue: config.searhHistoryInco,
              valuePropName: 'checked',
            })(
              <Switch />
            )
          }</Form.Item>
        }
        <Form.Item
          {...formItemLayout}
          label={t('opt_ctx_trans')}
          help={t('opt_ctx_trans_help')}
        >
          {Object.keys(config.ctxTrans).map(id => (
            <Form.Item key={id} style={{ marginBottom: 0 }}>{
              getFieldDecorator(`config#ctxTrans#${id}`, {
                initialValue: config.ctxTrans[id],
                valuePropName: 'checked',
              })(
                <Checkbox>{t(`dict:${id}`)}</Checkbox>
              )
            }</Form.Item>
          ))}
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={t('opt_sync_btn')}
        >
          <Button onClick={this.openSyncService}>{t('opt_sync_btn')}</Button>
        </Form.Item>
        <WebdavModal
          t={t}
          show={this.state.isShowSyncServiceModal}
          onClose={this.closeSyncServiceModal}
        />
      </Form>
    )
  }
}

export default Form.create({
  onFieldsChange: updateConfigOrProfile as any
})(Notebook)
