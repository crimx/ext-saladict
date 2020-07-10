import React, { FC, useMemo } from 'react'
import { Card, List, Switch } from 'antd'
import { DictID } from '@/app-config'
import { useSelector } from '@/content/redux'
import { objectKeys } from '@/typings/helpers'
import { DictTitle } from './DictTitle'

export interface AllDictsProps {
  value?: DictID[]
  onChange?: (list: DictID[]) => void
}

/**
 * Antd form item compatible list
 */
export const AllDicts: FC<AllDictsProps> = props => {
  const allDicts = useSelector(state => state.activeProfile.dicts.all)
  const allDictIds = useMemo(() => objectKeys(allDicts), [allDicts])
  const selected = useMemo(() => new Set(props.value || []), [props.value])

  return (
    <Card>
      <List
        size="large"
        dataSource={allDictIds}
        renderItem={dictID => (
          <List.Item>
            <div className="sortable-list-item">
              <DictTitle dictID={dictID} dictLangs={allDicts[dictID].lang} />
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
