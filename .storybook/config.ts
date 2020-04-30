import {
  configure,
  addDecorator,
  StoryDecorator,
  addParameters
} from '@storybook/react'
import { withContexts } from '@storybook/addon-contexts/react'
import { i18nContexts } from './configs/contexts'
import { StyleWrap } from '../src/_helpers/storybook'

import './style.css'

addParameters({
  options: {
    // bug https://github.com/storybookjs/storybook/issues/6569
    enableShortcuts: false
  },
  props: {
    propTablesExclude: [StyleWrap],
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
  let files = req.keys()
  if (process.env.STORYBOOK_PATH_PATTERN) {
    const tester = new RegExp(process.env.STORYBOOK_PATH_PATTERN)
    files = files.filter(filename => tester.test(filename))
  }
  files.forEach(filename => req(filename))
}

configure(loadStories, module)
