import React from 'react'
import { configure, addDecorator } from '@storybook/react'
import { withInfo } from '@storybook/addon-info'

addDecorator(
  withInfo({
    inline: true,
    header: false
  })
)

// https://github.com/storybookjs/storybook/issues/5721
// @ts-ignore
addDecorator(Story => React.createElement(Story))

function loadStories() {
  const req = require.context('../src', true, /\.stories\.tsx$/)
  req.keys().forEach(filename => req(filename))
}

configure(loadStories, module)
