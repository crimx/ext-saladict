import React from 'react'
import { updateProfile } from '@/_helpers/profile-manager'
import { Props } from '../typings'
import { arrayMove } from '../helpers'
import SortableList, { SortEnd } from '../../SortableList'
import AddDictModal from './AddDictModal'
import EditDictModal from './EditDictModal'
import DictTitle from './DictTitle'
import DictForm from './DictForm'

import { Col, Row, Tooltip, Icon } from 'antd'
import { DictID } from '@/app-config'

export type DictionariesProps = Props

interface DictionariesState {
  isShowAddDictModal: boolean
  editingDictID: DictID | ''
}

export class Dictionaries extends React.Component<
  DictionariesProps,
  DictionariesState
> {
  state: DictionariesState = {
    isShowAddDictModal: false,
    editingDictID: ''
  }

  openAddDictModal = () => {
    this.setState({ isShowAddDictModal: true })
  }

  closeAddDictModal = () => {
    this.setState({ isShowAddDictModal: false })
  }

  closeEditDictModal = () => {
    this.setState({ editingDictID: '' })
  }

  deleteItem = async (index: number) => {
    const { profile } = this.props
    ;(profile.dicts.selected as DictID[]).splice(index, 1)
    updateProfile(profile)
  }

  handleSortEnd = ({ oldIndex, newIndex }: SortEnd) => {
    if (oldIndex === newIndex) {
      return
    }
    const { profile } = this.props
    ;(profile.dicts.selected as DictID[]) = arrayMove(
      profile.dicts.selected as DictID[],
      oldIndex,
      newIndex
    )
    updateProfile(profile)
  }

  render() {
    const { t, profile } = this.props
    const { selected } = profile.dicts

    return (
      <Row>
        <Col>
          <DictForm {...this.props} />
        </Col>
        <Col span={13}>
          <SortableList
            t={t}
            title={
              <Tooltip title={t('opt.profile_change')}>
                <Icon type="question-circle-o" /> {t('opt.dict_selected')}
              </Tooltip>
            }
            list={selected.map(id => {
              return {
                value: id,
                title: (
                  <DictTitle
                    t={t}
                    dictID={id}
                    lang={profile.dicts.all[id].lang}
                  />
                )
              }
            })}
            onAdd={this.openAddDictModal}
            onEdit={index => this.setState({ editingDictID: selected[index] })}
            onDelete={this.deleteItem}
            onSortEnd={this.handleSortEnd}
          />
          <EditDictModal
            {...this.props}
            dictID={this.state.editingDictID}
            onClose={this.closeEditDictModal}
          />
          <AddDictModal
            {...this.props}
            show={this.state.isShowAddDictModal}
            onClose={this.closeAddDictModal}
          />
        </Col>
      </Row>
    )
  }
}

export default Dictionaries
