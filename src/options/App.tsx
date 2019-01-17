import React from 'react'
import { AppConfig } from '@/app-config'
import { translate, TranslationFunction } from 'react-i18next'
import { Layout, Menu, Icon } from 'antd'
import HeadInfo from './components/HeadInfo'

const { Header, Content, Sider } = Layout

const _optRequire = require['context']('./components/options/', true, /index\.tsx$/)

const menuselected = new URL(document.URL).searchParams.get('menuselected') || 'General'

export interface OptionsMainProps {
  config: AppConfig
}

export class OptionsMain extends React.Component<OptionsMainProps & { t: TranslationFunction }> {
  state = {
    activeProfileName: '',
    selectedKey: menuselected,
  }

  constructor (props: OptionsMainProps & { t: TranslationFunction }) {
    super(props)
    this.setTitle(this.state.selectedKey)

    window.addEventListener('popstate', e => {
      this.setState({ selectedKey: e.state.key || 'General' })
    })
  }

  static getDerivedStateFromProps (props: OptionsMainProps & { t: TranslationFunction }) {
    const name = props.config.name

    // default names
    const match = /^%%_(\S+)_%%$/.exec(name)
    if (match) {
      return {
        activeProfileName: props.t(`profile:${match[1]}`) || name
      }
    }

    return { activeProfileName: name }
  }

  onNavSelect = ({ key }: { key: string }) => {
    this.setState({ selectedKey: key })
    this.setTitle(key)
    const { protocol, host, pathname } = window.location
    const newurl = `${protocol}//${host}${pathname}?menuselected=${key}`
    window.history.pushState(
      { key },
      '',
      newurl
    )
  }

  setTitle = (key: string) => {
    const { t } = this.props
    document.title = `${t('title')} - ${t('nav_' + key)}`
  }

  render () {
    const { t, config } = this.props

    return (
      <Layout>
        <Header style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h1 style={{ color: '#fff' }}>{t('title')}</h1>
          <span style={{ color: '#fff' }}>「 {this.state.activeProfileName} 」</span>
          <HeadInfo />
        </Header>
        <Layout>
          <Sider width={180} style={{ background: '#fff' }}>
            <Menu
              mode='inline'
              selectedKeys={[this.state.selectedKey]}
              style={{ height: '100%', borderRight: 0 }}
              onSelect={this.onNavSelect}
            >
              <Menu.Item key='General'><Icon type='setting' /> {t('nav_General')}</Menu.Item>
              <Menu.Item key='Notebook'><Icon type='tags' /> {t('nav_Notebook')}</Menu.Item>
              <Menu.Item key='Profiles'><Icon type='dashboard' /> {t('nav_Profiles')}</Menu.Item>
              <Menu.Item key='DictPanel'><Icon type='profile' /> {t('nav_DictPanel')}</Menu.Item>
              <Menu.Item key='SearchModes'><Icon type='select' /> {t('nav_SearchModes')}</Menu.Item>
              <Menu.Item key='Dictioneries'><Icon type='book' /> {t('nav_Dictioneries')}</Menu.Item>
              <Menu.Item key='PDF'><Icon type='file-pdf' /> {t('nav_PDF')}</Menu.Item>
              <Menu.Item key='ContextMenus'><Icon type='database' /> {t('nav_ContextMenus')}</Menu.Item>
              <Menu.Item key='Popup'><Icon type='layout' /> {t('nav_Popup')}</Menu.Item>
              <Menu.Item key='QuickSearch'><Icon type='thunderbolt' /> {t('nav_QuickSearch')}</Menu.Item>
              <Menu.Item key='BlackWhiteList'><Icon type='file-protect' /> {t('nav_BlackWhiteList')}</Menu.Item>
              <Menu.Item key='ImportExport'><Icon type='swap' /> {t('nav_ImportExport')}</Menu.Item>
            </Menu>
          </Sider>
          <Layout style={{ padding: '24px', minHeight: innerHeight - 64 }}>
            <Content style={{
              background: '#fff', padding: 24, margin: 0,
            }}
            >
              {React.createElement(
                _optRequire(`./${this.state.selectedKey}/index.tsx`).default,
                { t, config }
              )}
            </Content>
          </Layout>
        </Layout>
      </Layout>
    )
  }
}

export default translate()(OptionsMain)
