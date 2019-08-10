import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { withKnobs } from '@storybook/addon-knobs'
import { jsxDecorator } from 'storybook-addon-jsx'
import { withPropsTable } from 'storybook-addon-react-docgen'
import { withSaladictPanel } from '@/_helpers/storybook'
import { MachineTrans } from './MachineTrans'

storiesOf('Content Scripts|Components', module)
  .addDecorator(withPropsTable)
  .addDecorator(jsxDecorator)
  .addDecorator(withKnobs)
  .addDecorator(
    withSaladictPanel({
      head: <style>{require('./MachineTrans.scss').toString()}</style>
    })
  )
  .add('MachineTrans', () => {
    return (
      <MachineTrans
        result={{
          id: 'baidu',
          sl: 'en',
          tl: 'zh',
          langcodes: ['zh', 'cht', 'en'],
          searchText: {
            text:
              'Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem quo necessitatibus voluptatem nobis, autem minima? Praesentium at est, eos reprehenderit, voluptatem obcaecati id quasi natus rem voluptatum temporibus pariatur omnis.',
            audio: 'https://example.com'
          },
          trans: {
            text:
              'Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem quo necessitatibus voluptatem nobis, autem minima? Praesentium at est, eos reprehenderit, voluptatem obcaecati id quasi natus rem voluptatum temporibus pariatur omnis.'
          }
        }}
        searchText={action('Search Text')}
      />
    )
  })
