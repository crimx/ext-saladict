import React from 'react'
import { TFunction } from 'i18next'
import {
  SortableContainer,
  SortableHandle,
  SortableElement,
  SortEnd as _SortEnd
} from 'react-sortable-hoc'
import { List, Radio, Button, Card } from 'antd'
import { PlusOutlined, BarsOutlined } from '@ant-design/icons'
import { RadioChangeEvent } from 'antd/lib/radio'
import { Omit } from '@/typings/helpers'

export type SortEnd = _SortEnd

export type SortableListItem = { value: string; title: React.ReactNode }

export interface SortableListItemProps {
  t: TFunction
  indexCopy: number
  selected?: string
  item: SortableListItem
  disableEdit?: (index: number, item: SortableListItem) => boolean
  onEdit?: (index: number, item: SortableListItem) => void
  onDelete?: (index: number, item: SortableListItem) => void
}

export interface SortableListProps
  extends Omit<SortableListItemProps, 'item' | 'indexCopy'> {
  t: TFunction
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

const DragHandle = SortableHandle<{ t: TFunction }>(({ t }) => (
  <BarsOutlined title={t('common:sort')} style={{ cursor: 'move' }} />
))

const ProfileListItem = SortableElement(
  ({
    t,
    selected,
    item,
    disableEdit,
    onEdit,
    onDelete,
    indexCopy
  }: SortableListItemProps) => {
    return (
      <List.Item>
        <div className="sortable-list-item">
          {selected == null ? (
            item.title
          ) : (
            <Radio value={item.value}>{item.title}</Radio>
          )}
          <div>
            <DragHandle t={t} />
            <Button
              className="sortable-list-item-btn"
              title={t('common:edit')}
              shape="circle"
              size="small"
              icon="edit"
              disabled={disableEdit != null && disableEdit(indexCopy, item)}
              onClick={onEdit && (() => onEdit(indexCopy, item))}
            />
            <Button
              title={t('common:delete')}
              className="sortable-list-item-btn"
              shape="circle"
              size="small"
              icon="close"
              disabled={selected != null && item.value === selected}
              onClick={onDelete && (() => onDelete(indexCopy, item))}
            />
          </div>
        </div>
      </List.Item>
    )
  }
)

const SortableListContainer = SortableContainer<SortableListProps>(props => (
  <List
    size="large"
    dataSource={props.list}
    renderItem={(item: any, index: number) => (
      <ProfileListItem {...props} item={item} index={index} indexCopy={index} />
    )}
  />
))

export function SortableList(props: SortableListProps) {
  return (
    <Card
      title={props.title}
      extra={
        <Button type="dashed" size="small" onClick={props.onAdd}>
          <PlusOutlined />
          {props.t('common:add')}
        </Button>
      }
    >
      {props.description}
      <Radio.Group
        className="sortable-list-radio-group"
        value={props.selected}
        onChange={props.onSelect}
      >
        <SortableListContainer useDragHandle {...props} />
      </Radio.Group>
      {(props.isShowAdd == null || props.isShowAdd) && (
        <Button type="dashed" style={{ width: '100%' }} onClick={props.onAdd}>
          <PlusOutlined /> {props.t('common:add')}
        </Button>
      )}
    </Card>
  )
}

export default SortableList
