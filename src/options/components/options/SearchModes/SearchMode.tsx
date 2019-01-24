import React from 'react'
import { Props } from '../typings'
import { updateConfigOrProfile, formItemLayout, formSubItemLayout } from '../helpers'
import { InputNumberGroup } from '../../InputNumberGroup'

import { FormComponentProps } from 'antd/lib/form'
import { Form, Checkbox, Select } from 'antd'

const { Option } = Select

export type SearchModeProps = Props & FormComponentProps & {
  mode: 'mode' | 'pinMode' | 'panelMode' | 'qsPanelMode'
  /** sub panel */
  sub?: boolean
}

interface SearchModeState {
  isShowHolding: boolean
}

export default class SearchMode extends React.Component<SearchModeProps, SearchModeState> {
  constructor (props: SearchModeProps) {
    super(props)

    const { config, mode } = this.props
    this.state = {
      isShowHolding: (
        config[mode].holding.shift ||
        config[mode].holding.ctrl ||
        config[mode].holding.meta
      ),
    }
  }

  toggleHolding = () => this.setState(({ isShowHolding }) => {
    isShowHolding = !isShowHolding
    const { mode } = this.props
    updateConfigOrProfile(this.props, {
      [`config#${mode}#holding#shift`]: {
        name: `config#${mode}#holding#shift`,
        touched: true,
        dirty: false,
        value: isShowHolding,
      }
    })
    updateConfigOrProfile(this.props, {
      [`config#${mode}#holding#ctrl`]: {
        name: `config#${mode}#holding#ctrl`,
        touched: true,
        dirty: false,
        value: isShowHolding,
      }
    })
    updateConfigOrProfile(this.props, {
      [`config#${mode}#holding#meta`]: {
        name: `config#${mode}#holding#meta`,
        touched: true,
        dirty: false,
        value: isShowHolding,
      }
    })
    return { isShowHolding }
  })

  render () {
    const { t, config, mode, sub } = this.props
    const { isShowHolding } = this.state
    const { getFieldDecorator } = this.props.form

    return (
      <Form.Item
        {...(sub ? formSubItemLayout : formItemLayout)}
        label={t(`opt_sm_${mode}`)}
      >
        {mode === 'mode' && (
          <>
            <Form.Item help={t('opt_sm_icon_help')}>{
              getFieldDecorator(`config#${mode}#icon`, {
                initialValue: config[mode].icon,
                valuePropName: 'checked',
              })(
                <Checkbox>{t('opt_sm_icon')}</Checkbox>
              )
            }</Form.Item>
            {config.mode.icon &&
              <Form.Item help={t('opt_bowl_hover_help')}>{
                getFieldDecorator(`config#bowlHover`, {
                  initialValue: config.bowlHover,
                  valuePropName: 'checked',
                })(
                  <Checkbox>{t('opt_bowl_hover')}</Checkbox>
                )
              }</Form.Item>
            }
          </>
        )}
        <Form.Item help={t('opt_sm_direct_help')}>{
          getFieldDecorator(`config#${mode}#direct`, {
            initialValue: config[mode].direct,
            valuePropName: 'checked',
          })(
            <Checkbox>{t('opt_sm_direct')}</Checkbox>
          )
        }</Form.Item>
        <Form.Item help={t('opt_sm_double_help')}>{
          getFieldDecorator(`config#${mode}#double`, {
            initialValue: config[mode].double,
            valuePropName: 'checked',
          })(
            <Checkbox>{t('opt_sm_double')}</Checkbox>
          )
        }</Form.Item>
        <Form.Item help={t('opt_sm_holding_help')}>
          <Checkbox
            checked={isShowHolding}
            onChange={this.toggleHolding}
          >{t('opt_sm_holding')}</Checkbox>
          {isShowHolding &&
            <div>
              <Form.Item className='form-item-inline'>{
                getFieldDecorator(`config#${mode}#holding#shift`, {
                  initialValue: config[mode].holding.shift,
                  valuePropName: 'checked',
                })(
                  <Checkbox><kbd>Shift</kbd></Checkbox>
                )
              }</Form.Item>
              <Form.Item className='form-item-inline'>{
                getFieldDecorator(`config#${mode}#holding#ctrl`, {
                  initialValue: config[mode].holding.ctrl,
                  valuePropName: 'checked',
                })(
                  <Checkbox><kbd>Ctrl</kbd></Checkbox>
                )
              }</Form.Item>
              <Form.Item className='form-item-inline'>{
                getFieldDecorator(`config#${mode}#holding#meta`, {
                  initialValue: config[mode].holding.meta,
                  valuePropName: 'checked',
                })(
                  <Checkbox><kbd>Meta(⌘/⊞)</kbd></Checkbox>
                )
              }</Form.Item>
            </div>
          }
        </Form.Item>
        <Form.Item help={t('opt_sm_instant_help')}>
          {getFieldDecorator(`config#${mode}#instant#enable`, {
            initialValue: config[mode].instant.enable,
            valuePropName: 'checked',
          })(
            <Checkbox>{t('opt_sm_instant')}</Checkbox>
          )}
          {config[mode].instant.enable && (
            <div>
              {t('opt_sm_instant_key') + ': '}
              <Form.Item className='form-item-inline'>{
                getFieldDecorator(`config#${mode}#instant#key`, {
                  initialValue: config[mode].instant.key,
                })(
                  <Select style={{ width: 100 }}>
                    <Option value='direct'>{t('opt_sm_instant_direct')}</Option>
                    <Option value='ctrl'>Ctrl/⌘</Option>
                    <Option value='alt'>Alt</Option>
                    <Option value='shift'>Shift</Option>
                  </Select>
                )
              }</Form.Item>

              <span style={{ marginLeft: 20 }}>{t('opt_sm_instant_delay')}: </span>
              <Form.Item className='form-item-inline'>{
                getFieldDecorator(`config#${mode}#instant#delay`, {
                  initialValue: config[mode].instant.delay,
                  rules: [{ type: 'number', whitespace: true }],
                })(
                  <InputNumberGroup suffix={t('common:unit_ms')} />
                )
              }</Form.Item>
            </div>
          )}
        </Form.Item>
      </Form.Item>
    )
  }
}
