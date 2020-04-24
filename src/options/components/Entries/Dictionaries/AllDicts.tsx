import React, { FC, useContext, useMemo } from 'react'
import { Card, List, Switch } from 'antd'
import { GlobalsContext } from '@/options/data'
import { objectKeys } from '@/typings/helpers'
import { DictTitle } from './DictTitle'
import { DictID } from '@/app-config'
import { useFixedMemo } from '@/_helpers/hooks'

export interface AllDictsProps {
  value?: DictID[]
  onChange?: (list: DictID[]) => void
}

/**
 * Antd form item compatible list
 */
export const AllDicts: FC<AllDictsProps> = props => {
  const globals = useContext(GlobalsContext)
  const all = useFixedMemo(() => objectKeys(globals.profile.dicts.all))
  const selected = useMemo(() => new Set(props.value || []), [props.value])

  return (
    <Card>
      <List
        size="large"
        dataSource={all}
        renderItem={dictID => (
          <List.Item>
            <div className="sortable-list-item">
              <DictTitle
                dictID={dictID}
                dictLangs={globals.profile.dicts.all[dictID].lang}
              />
              <Switch
                checked={selected.has(dictID)}
                onChange={checked => {
                  if (props.onChange && props.value) {
                    props.onChange(
                      checked
                        ? [...props.value, dictID]
                        : props.value.filter(id => id !== dictID)
                    )
                  }
                }}
              />
            </div>
          </List.Item>
        )}
      />
    </Card>
  )
}
