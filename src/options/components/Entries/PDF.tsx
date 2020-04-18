import React, { FC, useMemo, useState } from 'react'
import { Switch, Button } from 'antd'
import { getConfigPath } from '@/options/helpers/path-joiner'
import { SaladictForm } from '@/options/components/SaladictForm'
import { useTranslate, Trans } from '@/_helpers/i18n'
import { MatchPatternModal } from '../MatchPatternModal'

export const PDF: FC = () => {
  const { t, i18n, ready } = useTranslate(['options', 'common'])
  const [editingArea, setEditingArea] = useState<
    'pdfBlacklist' | 'pdfWhitelist' | null
  >(null)

  return (
    <>
      <SaladictForm
        items={useMemo(
          () => [
            {
              name: getConfigPath('pdfSniff'),
              valuePropName: 'checked',
              extra: (
                <Trans message={t(getConfigPath('pdfSniff') + '_extra')}>
                  <a
                    href="https://saladict.crimx.com/native.html"
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                  >
                    {t('nativeSearch')}
                  </a>
                </Trans>
              ),
              children: <Switch />
            },
            {
              key: 'BlackWhiteList',
              label: t('nav.BlackWhiteList'),
              help: t('config.opt.pdf_blackwhitelist_help'),
              children: (
                <>
                  <Button
                    style={{ marginRight: 10 }}
                    onClick={() => setEditingArea('pdfBlacklist')}
                  >
                    PDF {t('common:blacklist')}
                  </Button>
                  <Button onClick={() => setEditingArea('pdfWhitelist')}>
                    PDF {t('common:whitelist')}
                  </Button>
                </>
              )
            }
          ],
          [ready, i18n.language]
        )}
      />
      <MatchPatternModal
        area={editingArea}
        onClose={() => setEditingArea(null)}
      />
    </>
  )
}
