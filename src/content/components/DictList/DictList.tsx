import React, { FC } from 'react'
import { DictItem, DictItemProps } from '../DictItem/DictItem'

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
      {props.dicts.map(data => (
        <DictItem key={data.dictID} {...restProps} {...data} />
      ))}
    </div>
  )
}
