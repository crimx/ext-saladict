import React from 'react'
import {
  SortableContainer,
  SortableHandle,
  SortableElement,
  SortEnd as _SortEnd
} from 'react-sortable-hoc'
import { List, Radio, Button, Card } from 'antd'
import {
  PlusOutlined,
  SwapOutlined,
  EditOutlined,
  CloseOutlined
} from '@ant-design/icons'
import { RadioChangeEvent } from 'antd/lib/radio'
import { Omit } from '@/typings/helpers'
import { useTranslate } from '@/_helpers/i18n'

import './_style.scss'

export type SortEnd = _SortEnd

export type SortableListItem = { value: string; title: React.ReactNode }

export interface SortableListItemProps {
  indexCopy: number
  selected?: string
  item: SortableListItem
  disableEdit?: (index: number, item: SortableListItem) => boolean
  onEdit?: (index: number, item: SortableListItem) => void
  onDelete?: (index: number, item: SortableListItem) => void
}

export interface SortableListProps
  extends Omit<SortableListItemProps, 'item' | 'indexCopy'> {
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

const DragHandle = React.memo(
  SortableHandle(() => {
    const { t } = useTranslate('common')
    return (
      <SwapOutlined rotate={90} title={t('sort')} style={{ cursor: 'move' }} />
    )
  })
)

const ProfileListItem = SortableElement(
  ({
    selected,
    item,
    disableEdit,
    onEdit,
    onDelete,
    indexCopy
  }: SortableListItemProps) => {
    const { t } = useTranslate('options')

    return (
      <List.Item>
        <div className="sortable-list-item">
          {selected == null ? (
            item.title
          ) : (
            <Radio value={item.value}>{item.title}</Radio>
          )}
          <div>
            <DragHandle />
            <Button
              className="sortable-list-item-btn"
              title={t('common:edit')}
              shape="circle"
              size="small"
              icon={<EditOutlined />}
              disabled={disableEdit != null && disableEdit(indexCopy, item)}
              onClick={onEdit && (() => onEdit(indexCopy, item))}
            />
            <Button
              title={t('common:delete')}
              className="sortable-list-item-btn"
              shape="circle"
              size="small"
              icon={<CloseOutlined />}
              disabled={selected != null && item.value === selected}
              onClick={onDelete && (() => onDelete(indexCopy, item))}
            />
          </div>
        </div>
      </List.Item>
    )
  }
)

const SortableListContainer = SortableContainer((props: SortableListProps) => (
  <List
    size="large"
    dataSource={props.list}
    renderItem={(item: any, index: number) => (
      <ProfileListItem {...props} item={item} index={index} indexCopy={index} />
    )}
  />
))

export function SortableList(props: SortableListProps) {
  const { t } = useTranslate('common')

  return (
    <Card
      title={props.title}
      extra={
        <Button type="dashed" size="small" onClick={props.onAdd}>
          <PlusOutlined />
          {t('add')}
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
          <PlusOutlined /> {t('add')}
        </Button>
      )}
    </Card>
  )
}

/**
 * Changes the contents of an array by moving an element to a different position
 */
export function arrayMove<T extends any[]>(
  arr: T,
  from: number,
  to: number
): T {
  arr.splice(to < 0 ? arr.length + to : to, 0, arr.splice(from, 1)[0])
  return arr
}
