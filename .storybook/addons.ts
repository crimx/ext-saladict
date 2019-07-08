import '@storybook/addon-knobs/register'
import '@storybook/addon-contexts/register'
import '@storybook/addon-actions/register'

import addons from '@storybook/addons'
import { STORY_RENDERED } from '@storybook/core-events'

addons.register('TitleAddon', api => {
  api.on(STORY_RENDERED, () => {
    const storyData = api.getCurrentStoryData()
    document.title = `${storyData.name} - Saladict Storybook`
  })
})
