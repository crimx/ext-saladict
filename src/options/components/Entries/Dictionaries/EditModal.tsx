import React, { FC, useContext } from 'react'
import { shallowEqual } from 'react-redux'
import { Translator } from '@opentranslate/translator'
import { Switch, Select, Checkbox, Button, Modal } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { Rule } from 'antd/lib/form'
import { DictID } from '@/app-config'
import { useTranslate } from '@/_helpers/i18n'
import { supportedLangs } from '@/_helpers/lang-check'
import { useSelector } from '@/content/redux'
import { getProfilePath } from '@/options/helpers/path-joiner'
import { SaladictFormItem } from '@/options/components/SaladictForm'
import { InputNumberGroup } from '@/options/components/InputNumberGroup'
import { SaladictModalForm } from '@/options/components/SaladictModalForm'
import { ChangeEntryContext } from '@/options/helpers/change-entry'
import { useFormDirty, setFormDirty } from '@/options/helpers/use-form-dirty'

export interface EditModalProps {
  dictID?: DictID | null
  onClose: () => void
}

export const EditModal: FC<EditModalProps> = ({ dictID, onClose }) => {
  const { t, i18n } = useTranslate(['options', 'dicts', 'common', 'langcode'])
  const changeEntry = useContext(ChangeEntryContext)
  const formDirtyRef = useFormDirty()
  const { dictAuth, allDicts } = useSelector(
    state => ({
      dictAuth: state.config.dictAuth,
      allDicts: state.activeProfile.dicts.all
    }),
    shallowEqual
  )
  const formItems: SaladictFormItem[] = []

  const NUMBER_RULES: Rule[] = [
    { type: 'number', message: t('form.number_error'), required: true }
  ]

  if (dictID) {
    formItems.push(
      {
        key: getProfilePath('dicts', 'all', dictID, 'selectionLang'),
        label: t('dict.selectionLang'),
        help: t('dict.selectionLang_help'),
        extra: t('config.language_extra'),
        className: 'saladict-form-danger-extra',
        items: supportedLangs.map(lang => ({
          name: getProfilePath('dicts', 'all', dictID, 'selectionLang', lang),
          className: 'form-item-inline',
          valuePropName: 'checked',
          children: <Checkbox>{t(`common:lang.${lang}`)}</Checkbox>
        }))
      },
      {
        key: getProfilePath('dicts', 'all', dictID, 'defaultUnfold'),
        label: t('dict.defaultUnfold'),
        help: t('dict.defaultUnfold_help'),
        extra: t('config.language_extra'),
        className: 'saladict-form-danger-extra',
        items: supportedLangs.map(lang => ({
          name: getProfilePath('dicts', 'all', dictID, 'defaultUnfold', lang),
          className: 'form-item-inline',
          valuePropName: 'checked',
          children: <Checkbox>{t(`common:lang.${lang}`)}</Checkbox>
        }))
      },
      {
        key: getProfilePath('dicts', 'all', dictID, 'selectionWC'),
        label: t('dict.selectionWC'),
        help: t('dict.selectionWC_help'),
        items: [
          {
            name: getProfilePath('dicts', 'all', dictID, 'selectionWC', 'min'),
            label: null,
            style: { marginBottom: 5 },
            rules: NUMBER_RULES,
            children: <InputNumberGroup suffix={t('common:min')} />
          },
          {
            name: getProfilePath('dicts', 'all', dictID, 'selectionWC', 'max'),
            label: null,
            style: { marginBottom: 5 },
            rules: NUMBER_RULES,
            children: <InputNumberGroup suffix={t('common:max')} />
          }
        ]
      },
      {
        name: getProfilePath('dicts', 'all', dictID, 'preferredHeight'),
        label: t('dict.preferredHeight'),
        help: t('dict.preferredHeight_help'),
        rules: NUMBER_RULES,
        children: <InputNumberGroup suffix={t('common:max')} />
      }
    )

    // Dict Auth for Machine Translators
    if (dictAuth[dictID]) {
      formItems.push({
        key: dictID + '_auth',
        label: t('nav.DictAuths'),
        children: (
          <Button
            href="./?menuselected=DictAuths"
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()
              if (formDirtyRef.value) {
                Modal.confirm({
                  title: t('unsave_confirm'),
                  icon: <ExclamationCircleOutlined />,
                  okType: 'danger',
                  onOk: () => {
                    setFormDirty(false)
                    changeEntry('DictAuths')
                  }
                })
              } else {
                changeEntry('DictAuths')
              }
            }}
          >
            {t('dictAuth.manage')}
          </Button>
        )
      })
    }

    // custom options
    const options = allDicts[dictID]['options']
    if (options) {
      formItems.push(
        ...Object.keys(options).map(optKey => {
          // can be number | boolean | string(select)
          const value = options[optKey]

          const item: SaladictFormItem = {
            name: `profile.dicts.all.${dictID}.options.${optKey}`,
            label: t(`dicts:${dictID}.options.${optKey}`),
            help: i18n.exists(`dicts:${dictID}.helps.${optKey}`)
              ? t(`dicts:${dictID}.helps.${optKey}`)
              : null
          }

          switch (typeof value) {
            case 'number':
              item.rules = NUMBER_RULES
              item.children = (
                <InputNumberGroup
                  suffix={t(`dicts:${dictID}.options.${optKey}_unit`)}
                />
              )
              break
            case 'string':
              if (optKey === 'tl' || optKey === 'tl2') {
                const getTranslator:
                  | undefined
                  | (() => Translator) = require(`@/components/dictionaries/${dictID}/engine`)
                  .getTranslator

                const langs = getTranslator
                  ? getTranslator()
                      .getSupportLanguages()
                      .map(lang => (lang === 'auto' ? 'default' : lang))
                  : allDicts[dictID]['options_sel'][optKey]

                item.children = (
                  <Select>
                    {langs.map((option: string) => (
                      <Select.Option value={option} key={option}>
                        {option === 'default' ? '' : option + ' '}
                        {t(`langcode:${option}`)}
                      </Select.Option>
                    ))}
                  </Select>
                )
              } else {
                item.children = (
                  <Select>
                    {allDicts[dictID]['options_sel'][optKey].map(
                      (option: string) => (
                        <Select.Option value={option} key={option}>
                          {t(`dicts:${dictID}.options.${optKey}-${option}`)}
                        </Select.Option>
                      )
                    )}
                  </Select>
                )
              }
              break
            default:
              item.valuePropName = 'checked'
              item.children = <Switch />
          }
          return item
        })
      )
    }
  }

  return (
    <SaladictModalForm
      visible={!!dictID}
      title={t(`dicts:${dictID}.name`)}
      items={formItems}
      onClose={onClose}
    />
  )
}
