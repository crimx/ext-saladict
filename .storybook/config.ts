import {
  configure,
  addDecorator,
  StoryDecorator,
  addParameters
} from '@storybook/react'
import { withContexts } from '@storybook/addon-contexts/react'
import { i18nContexts } from './configs/contexts'

import './style.css'

addParameters({
  props: {
    styles: styles => ({
      ...styles,
      infoBody: {
        ...styles.infoBody,
        marginTop: 0,
        padding: '0 40px'
      },
      propTableHead: {
        ...styles.propTableHead,
        margin: 0
      },
      h1: {
        display: 'none'
      }
    })
  },
  jsx: {
    functionValue: (fn: Function) => `${fn.name}()`
  }
})

// place after the info addon so that wrappers get removed
addDecorator(withContexts(i18nContexts) as StoryDecorator)

function loadStories() {
  const req = require.context('../src', true, /\.stories\.tsx$/)
  req.keys().forEach(filename => req(filename))
}

configure(loadStories, module)
