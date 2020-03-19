import React from 'react'
import { AppConfig } from '@/app-config'
import { Profile, ProfileIDList } from '@/app-config/profiles'
import { withTranslation, WithTranslation } from 'react-i18next'
import { Layout, Menu, Icon } from 'antd'
import HeadInfo from './components/HeadInfo'
import { getProfileName } from '@/_helpers/profile-manager'
import { reportGA } from '@/_helpers/analytics'

const { Header, Content, Sider } = Layout

const _optRequire = require.context(
  './components/options/',
  true,
  /index\.tsx$/
)

const menuselected =
  new URL(document.URL).searchParams.get('menuselected') || 'General'

export interface OptionsMainProps {
  config: AppConfig
  profile: Profile
  profileIDList: ProfileIDList
  rawProfileName: string
}

interface OptionsMainState {
  selectedKey: string
}

export class OptionsMain extends React.Component<
  OptionsMainProps & WithTranslation,
  OptionsMainState
> {
  state: OptionsMainState = {
    selectedKey: menuselected
  }

  onNavSelect = ({ key }: { key: string }) => {
    this.setState({ selectedKey: key })
    this.setTitle(key)
    const { protocol, host, pathname } = window.location
    const newurl = `${protocol}//${host}${pathname}?menuselected=${key}`
    window.history.pushState({ key }, '', newurl)
    if (this.props.config.analytics) {
      reportGA(`/options/${key}`)
    }
  }

  setTitle = (key: string) => {
    const { t } = this.props
    document.title = `${t('title')} - ${t('nav.' + key)}`
  }

  componentDidMount() {
    this.setTitle(this.state.selectedKey)

    if (this.props.config.analytics) {
      reportGA(`/options/${this.state.selectedKey}`)
    }

    window.addEventListener('popstate', e => {
      this.setState({ selectedKey: e.state.key || 'General' })
    })
  }

  render() {
    const { t, i18n, config, profile, rawProfileName } = this.props

    return (
      <Layout
        className="xmain-container"
        style={{ maxWidth: 1400, margin: '0 auto' }}
      >
        <Header className="options-header">
          <h1 style={{ color: '#fff' }}>{t('title')}</h1>
          <span style={{ color: '#fff' }}>
            「 {getProfileName(rawProfileName, t)} 」
          </span>
          <HeadInfo />
        </Header>
        <Layout>
          <Sider width={180} style={{ background: '#fff' }}>
            <Menu
              mode="inline"
              selectedKeys={[this.state.selectedKey]}
              style={{ height: '100%', borderRight: 0 }}
              onSelect={this.onNavSelect}
            >
              <Menu.Item key="General">
                <Icon type="setting" /> {t('nav.General')}
              </Menu.Item>
              <Menu.Item key="Notebook">
                <Icon type="tags" /> {t('nav.Notebook')}
              </Menu.Item>
              <Menu.Item key="Profiles">
                <Icon type="dashboard" /> {t('nav.Profiles')}
              </Menu.Item>
              <Menu.Item key="DictPanel">
                <Icon type="profile" /> {t('nav.DictPanel')}
              </Menu.Item>
              <Menu.Item key="SearchModes">
                <Icon type="select" /> {t('nav.SearchModes')}
              </Menu.Item>
              <Menu.Item key="Dictionaries">
                <Icon type="book" /> {t('nav.Dictionaries')}
              </Menu.Item>
              <Menu.Item key="PDF">
                <Icon type="file-pdf" /> {t('nav.PDF')}
              </Menu.Item>
              <Menu.Item key="ContextMenus">
                <Icon type="database" /> {t('nav.ContextMenus')}
              </Menu.Item>
              <Menu.Item key="Popup">
                <Icon type="layout" /> {t('nav.Popup')}
              </Menu.Item>
              <Menu.Item key="QuickSearch">
                <Icon type="flag" /> {t('nav.QuickSearch')}
              </Menu.Item>
              <Menu.Item key="BlackWhiteList">
                <Icon type="exception" /> {t('nav.BlackWhiteList')}
              </Menu.Item>
              <Menu.Item key="ImportExport">
                <Icon type="swap" /> {t('nav.ImportExport')}
              </Menu.Item>
              <Menu.Item key="Privacy">
                <Icon type="lock" /> {t('nav.Privacy')}
              </Menu.Item>
            </Menu>
          </Sider>
          <Layout style={{ padding: '24px', minHeight: innerHeight - 64 }}>
            <Content
              data-option-content={this.state.selectedKey}
              style={{
                background: '#fff',
                padding: 24,
                margin: 0
              }}
            >
              {React.createElement(
                _optRequire(`./${this.state.selectedKey}/index.tsx`).default,
                { t, i18n, config, profile }
              )}
            </Content>
          </Layout>
        </Layout>
      </Layout>
    )
  }
}

export default withTranslation()(OptionsMain)
