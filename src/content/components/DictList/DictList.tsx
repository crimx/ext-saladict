import React, { FC } from 'react'
import { DictItem, DictItemProps } from '../DictItem/DictItem'

const MemoDictItem = React.memo(DictItem)

type DictListItemKeys =
  | 'dictID'
  | 'preferredHeight'
  | 'searchStatus'
  | 'searchResult'
  | 'dictComp'

export interface DictListProps extends Omit<DictItemProps, DictListItemKeys> {
  dicts: Pick<DictItemProps, DictListItemKeys>[]
}

export const DictList: FC<DictListProps> = props => {
  const { dicts, ...restProps } = props
  return (
    <div className="dictList">
      {dicts.map(data => (
        <MemoDictItem key={data.dictID} {...restProps} {...data} />
      ))}
    </div>
  )
}
