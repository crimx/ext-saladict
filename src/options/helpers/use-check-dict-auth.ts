import { useContext } from 'react'
import { message } from 'antd'
import { objectKeys } from '@/typings/helpers'
import { updateConfig } from '@/_helpers/config-manager'
import { useTranslate } from '@/_helpers/i18n'
import { useStore } from '@/content/redux'
import { ChangeEntryContext } from './change-entry'

export const useCheckDictAuth = () => {
  const { t } = useTranslate('options')
  const changeEntry = useContext(ChangeEntryContext)
  const store = useStore()

  return async () => {
    const { config } = store.getState()

    if (!config.showedDictAuth) {
      // opens on Profiles
      await updateConfig({
        ...config,
        showedDictAuth: true
      })

      if (
        objectKeys(config.dictAuth).every(id =>
          objectKeys(config.dictAuth[id]).every(k => !config.dictAuth[id]?.[k])
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
