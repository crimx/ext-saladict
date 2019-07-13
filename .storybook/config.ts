import {
  configure,
  addDecorator,
  StoryDecorator,
  addParameters
} from '@storybook/react'
import { withInfo } from '@storybook/addon-info'
import { withContexts } from '@storybook/addon-contexts/react'
import { i18nContexts } from './configs/contexts' // we will define the contextual setups later in API section
import union from 'lodash/union'

addParameters({
  options: {
    panelPosition: 'right'
  }
})

addDecorator(
  withInfo({
    inline: true,
    header: false,
    propTablesExclude: union(...i18nContexts.map(c => c.components || []))
  })
)

// place after the info addon so that wrappers get removed
addDecorator(withContexts(i18nContexts) as StoryDecorator)

function loadStories() {
  const req = require.context('../src', true, /\.stories\.tsx$/)
  req.keys().forEach(filename => req(filename))
}

configure(loadStories, module)
