import React from 'react'
import { storage } from '@/_helpers/browser-api'
import { Props } from '../typings'
import { updateConfigOrProfile, formItemLayout } from '../helpers'
import WebdavModal from './WebdavModal'
import ShanbayModal from './ShanbayModal'
import {
  Service as WebDAVService,
  SyncConfig as WebDAVConfig
} from '@/background/sync-manager/services/webdav'
import {
  Service as ShanbayService,
  SyncConfig as ShanbayConfig
} from '@/background/sync-manager/services/shanbay'

import { FormComponentProps } from 'antd/lib/form'
import { Form, Switch, Checkbox, Button } from 'antd'

export type NotebookProps = Props & FormComponentProps

interface SyncConfigs {
  [WebDAVService.id]?: WebDAVConfig
  [ShanbayService.id]?: ShanbayConfig
}

export interface NotebookState {
  isShowSyncServiceModal: {
    [WebDAVService.id]: boolean
    [ShanbayService.id]: boolean
  }
  syncConfigs: null | SyncConfigs
}

export class Notebook extends React.Component<NotebookProps, NotebookState> {
  state: NotebookState = {
    isShowSyncServiceModal: {
      [WebDAVService.id]: false,
      [ShanbayService.id]: false
    },
    syncConfigs: null
  }

  constructor(props: NotebookProps) {
    super(props)

    storage.sync.get('syncConfig').then(({ syncConfig }) => {
      this.setState({ syncConfigs: syncConfig || {} })
    })
    storage.sync.addListener<SyncConfigs>('syncConfig', ({ syncConfig }) => {
      this.setState({ syncConfigs: syncConfig.newValue || {} })
    })
  }

  showSyncServiceModal = (
    id: keyof NotebookState['isShowSyncServiceModal'],
    isShow: boolean
  ) => {
    this.setState(prevState => ({
      isShowSyncServiceModal: {
        ...prevState.isShowSyncServiceModal,
        [id]: isShow
      }
    }))
  }

  render() {
    const { t, config } = this.props
    const { getFieldDecorator } = this.props.form
    const { syncConfigs, isShowSyncServiceModal } = this.state

    return (
      <Form>
        <Form.Item
          {...formItemLayout}
          label={t('opt.edit_on_fav')}
          help={t('opt.edit_on_fav_help')}
        >
          {getFieldDecorator('config#editOnFav', {
            initialValue: config.editOnFav,
            valuePropName: 'checked'
          })(<Switch />)}
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={t('opt.history')}
          help={t('opt.history_help')}
        >
          {getFieldDecorator('config#searhHistory', {
            initialValue: config.searhHistory,
            valuePropName: 'checked'
          })(<Switch />)}
        </Form.Item>
        {config.searhHistory && (
          <Form.Item {...formItemLayout} label={t('opt.history_inco')}>
            {getFieldDecorator('config#searhHistoryInco', {
              initialValue: config.searhHistoryInco,
              valuePropName: 'checked'
            })(<Switch />)}
          </Form.Item>
        )}
        <Form.Item
          {...formItemLayout}
          label={t('opt.ctx_trans')}
          help={t('opt.ctx_trans_help')}
        >
          {Object.keys(config.ctxTrans).map(id => (
            <Form.Item key={id} style={{ marginBottom: 0 }}>
              {getFieldDecorator(`config#ctxTrans#${id}`, {
                initialValue: config.ctxTrans[id],
                valuePropName: 'checked'
              })(<Checkbox>{t(`dicts:${id}.name`)}</Checkbox>)}
            </Form.Item>
          ))}
        </Form.Item>
        <Form.Item {...formItemLayout} label={t('sync.webdav.title')}>
          <Button
            onClick={() => this.showSyncServiceModal(WebDAVService.id, true)}
          >{`${t('sync.webdav.title')} (${t(
            syncConfigs &&
              syncConfigs[WebDAVService.id] &&
              syncConfigs[WebDAVService.id]!.url
              ? 'common:enabled'
              : 'common:disabled'
          )})`}</Button>
        </Form.Item>
        <Form.Item {...formItemLayout} label={t('sync.shanbay.title')}>
          <Button
            onClick={() => this.showSyncServiceModal(ShanbayService.id, true)}
          >{`${t('sync.shanbay.title')} (${t(
            syncConfigs &&
              syncConfigs[ShanbayService.id] &&
              syncConfigs[ShanbayService.id]!.enable
              ? 'common:enabled'
              : 'common:disabled'
          )})`}</Button>
        </Form.Item>
        {syncConfigs && (
          <>
            <WebdavModal
              syncConfig={syncConfigs[WebDAVService.id]}
              t={t}
              show={isShowSyncServiceModal[WebDAVService.id]}
              onClose={() => this.showSyncServiceModal(WebDAVService.id, false)}
            />
            <ShanbayModal
              syncConfig={syncConfigs[ShanbayService.id]}
              t={t}
              show={isShowSyncServiceModal[ShanbayService.id]}
              onClose={() =>
                this.showSyncServiceModal(ShanbayService.id, false)
              }
            />
          </>
        )}
      </Form>
    )
  }
}

export default Form.create<NotebookProps>({
  onFieldsChange: updateConfigOrProfile as any
})(Notebook)
