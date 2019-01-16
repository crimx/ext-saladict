import React from 'react'
import { AppConfig } from '@/app-config'
import { translate, TranslationFunction } from 'react-i18next'
import { Layout, Menu, Icon } from 'antd'
import HeadInfo from './components/HeadInfo'

const { Header, Content, Sider } = Layout

const _optRequire = require['context']('./components/options/', true, /index\.tsx$/)

export interface OptionsMainProps {
  config: AppConfig
}

export class OptionsMain extends React.Component<OptionsMainProps & { t: TranslationFunction }> {
  state = {
    activeProfileName: '',
    selectedOptionId: 'General',
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
    this.setState({ selectedOptionId: key })
  }

  render () {
    const { t, config } = this.props

    return (
      <Layout>
        <Header style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h1 style={{ color: '#fff' }}>{t('opt:title')}</h1>
          <span style={{ color: '#fff' }}>「 {this.state.activeProfileName} 」</span>
          <HeadInfo />
        </Header>
        <Layout>
          <Sider width={180} style={{ background: '#fff' }}>
            <Menu
              mode='inline'
              defaultSelectedKeys={['General']}
              style={{ height: '100%', borderRight: 0 }}
              onSelect={this.onNavSelect}
            >
              <Menu.Item key='General'><Icon type='setting' /> {t('opt:nav_general')}</Menu.Item>
              <Menu.Item key='Profiles'><Icon type='dashboard' /> {t('opt:nav_profiles')}</Menu.Item>
              <Menu.Item key='DictPanel'><Icon type='profile' /> {t('opt:nav_dict_panel')}</Menu.Item>
              <Menu.Item key='SearchModes'><Icon type='select' /> {t('opt:nav_search_modes')}</Menu.Item>
              <Menu.Item key='Dictioneries'><Icon type='book' /> {t('opt:nav_dictioneries')}</Menu.Item>
              <Menu.Item key='ContextMenus'><Icon type='database' /> {t('opt:nav_context_menus')}</Menu.Item>
              <Menu.Item key='Popup'><Icon type='layout' /> {t('opt:nav_popup')}</Menu.Item>
              <Menu.Item key='QuickSearch'><Icon type='thunderbolt' /> {t('opt:nav_quick_search')}</Menu.Item>
              <Menu.Item key='BlackWhiteList'><Icon type='file-protect' /> {t('opt:nav_black_white_list')}</Menu.Item>
              <Menu.Item key='InportExport'><Icon type='swap' /> {t('opt:nav_inport_export')}</Menu.Item>
            </Menu>
          </Sider>
          <Layout style={{ padding: '24px' }}>
            <Content style={{
              background: '#fff', padding: 24, margin: 0, minHeight: 280,
            }}
            >
              {React.createElement(
                _optRequire(`./${this.state.selectedOptionId}/index.tsx`).default,
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
