import React from 'react'
import { TranslationFunction } from 'i18next'
import { SortableContainer, SortableHandle, SortableElement, SortEnd } from 'react-sortable-hoc'
import { Icon, List, Radio, Button, Card } from 'antd'
import { RadioChangeEvent } from 'antd/lib/radio'
import { Omit } from '@/typings/helpers'

export type SortableListItem = { value: string, title: React.ReactNode }

export interface SortableListItemProps {
  t: TranslationFunction
  indexCopy: number
  selected?: string
  item: SortableListItem
  onEdit?: (index: number, item: SortableListItem) => void
  onDelete?: (index: number, item: SortableListItem) => void
}

export interface SortableListProps extends Omit<
  SortableListItemProps, 'item' | 'indexCopy'
> {
  t: TranslationFunction
  /** List title */
  title: React.ReactNode
  description?: React.ReactNode
  list: SortableListItem[]
  /** List Item can be selected */
  selected?: string
  /** show add button */
  isShowAdd?: boolean
  onAdd?: () => void
  /** Title being selected */
  onSelect?: (e: RadioChangeEvent) => void
  onSortEnd?: (end: SortEnd) => void
}

const DragHandle = SortableHandle<{
  t: TranslationFunction
}>(({ t }) => (
  <Icon
    title={t('common:sort')}
    style={{ cursor: 'move' }}
    type='bars'
  />
))

const ProfileListItem = SortableElement<SortableListItemProps>(({
  t, selected, item, onEdit, onDelete, indexCopy
}) => {
  return (
    <List.Item>
      <div className='sortable-list-item'>
        {selected == null
          ? item.title
          : <Radio value={item.value}>{item.title}</Radio>
        }
        <div>
          <DragHandle t={t} />
          <Button
            className='sortable-list-item-btn'
            title={t('common:edit')}
            shape='circle'
            size='small'
            icon='edit'
            onClick={onEdit && (() => onEdit(indexCopy, item))}
          />
          <Button
            title={t('common:delete')}
            className='sortable-list-item-btn'
            shape='circle'
            size='small'
            icon='close'
            disabled={selected != null && item.value === selected}
            onClick={onDelete && (() => onDelete(indexCopy, item))}
          />
        </div>
      </div>
    </List.Item>
  )
})

export const SortableListContainer = SortableContainer<SortableListProps>(props => (
  <List
    size='large'
    dataSource={props.list}
    renderItem={(item: any, index: number) => (
      <ProfileListItem {...props} item={item} index={index} indexCopy={index} />
    )}
  />
))

export function SortableList (props: SortableListProps) {
  return (
    <Card
      title={props.title}
      extra={(
        <Button type='dashed' size='small' onClick={props.onAdd}>
          <Icon type='plus' />{props.t('common:add')}
        </Button>
      )}
    >
      <Radio.Group
        className='sortable-list-radio-group'
        value={props.selected}
        onChange={props.onSelect}
      >
        <SortableListContainer
          useDragHandle
          {...props}
        />
      </Radio.Group>
      {(props.isShowAdd == null || props.isShowAdd) &&
        <Button
          type='dashed'
          style={{ width: '100%' }}
          onClick={props.onAdd}
        >
          <Icon type='plus' /> {props.t('common:add')}
        </Button>
      }
    </Card>
  )
}

export default SortableList
