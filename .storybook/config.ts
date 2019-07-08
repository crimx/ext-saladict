import { configure, addDecorator } from '@storybook/react'
import { withInfo } from '@storybook/addon-info'

addDecorator(
  withInfo({
    inline: true,
    header: false
  })
)

function loadStories() {
  const req = require.context('../src', true, /\.stories\.tsx$/)
  req.keys().forEach(filename => req(filename))
}

configure(loadStories, module)
