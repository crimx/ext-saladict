import React from 'react'
import { Props } from '../typings'
import { AppConfig } from '@/app-config'
import { ProfileIDList, Profile } from '@/app-config/profiles'
import { mergeConfig } from '@/app-config/merge-config'
import { mergeProfile } from '@/app-config/merge-profile'
import { updateConfig, getConfig } from '@/_helpers/config-manager'
import { updateProfile, getProfile } from '@/_helpers/profile-manager'
import { storage } from '@/_helpers/browser-api'

import { Upload, Icon, Row, Col, message } from 'antd'
import { RcFile } from 'antd/lib/upload/interface'

export type ConfigStorage = {
  baseconfig: AppConfig
  activeProfileID: string
  hasInstructionsShown: boolean
  profileIDList: ProfileIDList
} & {
  [id: string]: Profile
}

export class ImportExport extends React.Component<Props> {
  importConfig = async (file: RcFile) => {
    const { t } = this.props

    const result = await new Promise<Partial<ConfigStorage> | null>(resolve => {
      const fr = new FileReader()
      fr.onload = () => {
        try {
          const json = JSON.parse(fr.result as string)
          resolve(json)
        } catch (err) {
          /* */
        }
        resolve()
      }
      fr.onerror = () => resolve()
      fr.readAsText(file)
    })

    if (!result) {
      message.error(t('opt.config.import_error'))
      return
    }

    let {
      baseconfig,
      activeProfileID,
      hasInstructionsShown,
      profileIDList,
      syncConfig
    } = result

    if (
      !baseconfig &&
      !activeProfileID &&
      !profileIDList &&
      hasInstructionsShown == null
    ) {
      message.error(t('opt.config.import_error'))
      return
    }

    await storage.sync.clear()

    if (baseconfig) {
      await updateConfig(mergeConfig(baseconfig))
    }

    if (syncConfig) {
      await storage.sync.set({ syncConfig })
    }

    if (hasInstructionsShown != null) {
      await storage.sync.set({ hasInstructionsShown })
    }

    if (profileIDList) {
      profileIDList = profileIDList.filter(({ id }) => result[id])
      if (profileIDList.length > 0) {
        for (const { id } of profileIDList) {
          await updateProfile(mergeProfile(result[id] as Profile))
        }
        if (
          !activeProfileID ||
          profileIDList.every(({ id }) => id !== activeProfileID)
        ) {
          // use first item instead
          activeProfileID = profileIDList[0].id
        }
        await storage.sync.set({ activeProfileID, profileIDList })
      }
    }
  }

  exportConfig = async () => {
    const { t } = this.props

    const result = await storage.sync.get([
      'activeProfileID',
      'hasInstructionsShown',
      'profileIDList',
      'syncConfig'
    ])

    result.baseconfig = await getConfig()

    if (
      !result.baseconfig ||
      !result.activeProfileID ||
      !result.profileIDList
    ) {
      message.error(t('opt.config.import_error'))
      return
    }

    for (const { id } of result.profileIDList) {
      result[id] = await getProfile(id)
    }
    try {
      let text = JSON.stringify(result)
      const { os } = await browser.runtime.getPlatformInfo()
      if (os === 'win') {
        text = text.replace(/\r\n|\n/g, '\r\n')
      }
      const file = new Blob([text], { type: 'text/plain;charset=utf-8' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(file)
      a.download = `config-${Date.now()}.saladict`

      // firefox
      a.target = '_blank'
      document.body.appendChild(a)

      a.click()
    } catch (err) {
      message.error(t('opt.config.import_error'))
    }
  }

  render() {
    const { t } = this.props
    return (
      <Row>
        <Col span={12}>
          <Row gutter={10}>
            <Col span={12}>
              <Upload.Dragger
                beforeUpload={file => {
                  this.importConfig(file)
                  return false
                }}
              >
                <p className="ant-upload-drag-icon">
                  <Icon type="download" />
                </p>
                <p className="ant-upload-text">{t('opt.config.import')}</p>
              </Upload.Dragger>
            </Col>
            <Col span={12}>
              <button
                className="ant-upload ant-upload-drag"
                onClick={this.exportConfig}
              >
                <div className="ant-upload ant-upload-btn">
                  <p className="ant-upload-drag-icon">
                    <Icon type="upload" />
                  </p>
                  <p className="ant-upload-text">{t('opt.config.export')}</p>
                </div>
              </button>
            </Col>
          </Row>
        </Col>
      </Row>
    )
  }
}

export default ImportExport
