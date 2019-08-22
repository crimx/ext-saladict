import React, { FC } from 'react'
import { DictItem, DictItemProps } from '../DictItem/DictItem'

export interface DictListProps {
  text: string

  fontSize: number
  withAnimation: boolean

  dicts: Array<
    Pick<
      DictItemProps,
      | 'dictID'
      | 'preferredHeight'
      | 'searchStatus'
      | 'searchResult'
      | 'dictComp'
    >
  >

  searchText: DictItemProps['searchText']
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
