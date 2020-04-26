import { useContext } from 'react'
import { message } from 'antd'
import { objectKeys } from '@/typings/helpers'
import { updateConfig } from '@/_helpers/config-manager'
import { GlobalsContext } from '../data'
import { ChangeEntryContext } from './change-entry'
import { useTranslate } from '@/_helpers/i18n'

export const useCheckDictAuth = () => {
  const { t } = useTranslate('options')
  const changeEntry = useContext(ChangeEntryContext)
  const globals = useContext(GlobalsContext)

  return async () => {
    const { showedDictAuth, dictAuth } = globals.config

    if (!showedDictAuth) {
      // opens on Profiles
      await updateConfig({
        ...globals.config,
        showedDictAuth: true
      })

      if (
        objectKeys(dictAuth).every(id =>
          objectKeys(dictAuth[id]).every(k => !dictAuth[id]?.[k])
        )
      ) {
        message.warning(t('msg_first_time_notice'), 10)
        changeEntry('DictAuths')
        return false
      }
    }

    return true
  }
}
