import React, { FC, useState } from 'react'
import { Button } from 'antd'
import { SaladictForm } from '@/options/components/SaladictForm'
import { useTranslate } from '@/_helpers/i18n'
import { MatchPatternModal } from '../MatchPatternModal'

export const BlackWhiteList: FC = () => {
  const { t } = useTranslate(['options', 'common'])
  const [editingArea, setEditingArea] = useState<
    'pdfWhitelist' | 'pdfBlacklist' | 'whitelist' | 'blacklist' | null
  >(null)

  return (
    <>
      <SaladictForm
        hideFooter
        items={[
          {
            key: 'BlackWhiteList',
            label: t('config.opt.sel_blackwhitelist'),
            help: t('config.opt.sel_blackwhitelist_help'),
            children: (
              <>
                <Button
                  style={{ marginRight: 10 }}
                  onClick={() => setEditingArea('blacklist')}
                >
                  {t('common:blacklist')}
                </Button>
                <Button onClick={() => setEditingArea('whitelist')}>
                  {t('common:whitelist')}
                </Button>
              </>
            )
          },
          {
            key: 'PDFBlackWhiteList',
            label: 'PDF ' + t('nav.BlackWhiteList'),
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
        ]}
      />
      <MatchPatternModal
        area={editingArea}
        onClose={() => setEditingArea(null)}
      />
    </>
  )
}
