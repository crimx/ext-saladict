import React, { FC, useEffect, useRef } from 'react'
import { DictItem, DictItemProps } from '../DictItem/DictItem'
import { DictID, AppConfig } from '@/app-config'
import { useObservableCallback, useSubscription } from 'observable-hooks'
import { debounceTime } from 'rxjs/operators'
import { useInPanelSelect } from '@/selection/select-text'
import { Word } from '@/_helpers/record-manager'

const MemoDictItem = React.memo(DictItem)

type DictListItemKeys =
  | 'dictID'
  | 'preferredHeight'
  | 'searchStatus'
  | 'searchResult'
  | 'dictComp'

export interface DictListProps
  extends Omit<DictItemProps, DictListItemKeys | 'onHeightChanged'> {
  dicts: Pick<DictItemProps, DictListItemKeys>[]
  onHeightChanged: (height: number) => void

  touchMode: AppConfig['touchMode']
  language: AppConfig['language']
  doubleClickDelay: AppConfig['doubleClickDelay']
  newSelection: (payload: {
    word: Word | null
    mouseX: number
    mouseY: number
    dbClick: boolean
    shiftKey: boolean
    ctrlKey: boolean
    metaKey: boolean
    self: boolean
    instant: boolean
    force: boolean
  }) => void
}

type Height = {
  dicts: { [key in DictID]?: number }
  sum: number
}

export const DictList: FC<DictListProps> = props => {
  const {
    dicts,
    onHeightChanged,
    touchMode,
    language,
    doubleClickDelay,
    newSelection,
    ...restProps
  } = props

  const heightRef = useRef<Height>({ dicts: {}, sum: 0 })

  const [updateHeight, iupdateHeight$] = useObservableCallback<number>(event$ =>
    debounceTime<number>(10)(event$)
  )

  useSubscription(iupdateHeight$, onHeightChanged)

  const onItemHeightChanged = useRef((id: DictID, height: number) => {
    heightRef.current.sum =
      heightRef.current.sum - (heightRef.current.dicts[id] || 0) + height
    heightRef.current.dicts[id] = height
    updateHeight(heightRef.current.sum)
  }).current

  useEffect(() => {
    const oldHeight = heightRef.current
    heightRef.current = dicts.reduce(
      (height, { dictID }) => {
        height.dicts[dictID] = oldHeight.dicts[dictID] || 31
        height.sum += height.dicts[dictID] || 31
        return height
      },
      { dicts: {}, sum: 0 } as Height
    )
    updateHeight(heightRef.current.sum)
  }, [dicts.reduce((str, d) => str + d.dictID + ',', '')])

  const onInPanelSelect = useInPanelSelect(
    touchMode,
    language,
    doubleClickDelay,
    newSelection
  )

  return (
    <div className="dictList">
      {dicts.map(data => (
        <MemoDictItem
          key={data.dictID}
          {...restProps}
          {...data}
          onInPanelSelect={onInPanelSelect}
          onHeightChanged={onItemHeightChanged}
        />
      ))}
    </div>
  )
}
