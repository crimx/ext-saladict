import React from 'react'
import { storiesOf } from '@storybook/react'
import { withKnobs, text } from '@storybook/addon-knobs'
import { withSaladictPanel } from '@/_helpers/storybook'
import { EntryBox } from './index'

storiesOf('Content Scripts|Components', module)
  .addParameters({
    backgrounds: [
      { name: 'Saladict', value: '#5caf9e', default: true },
      { name: 'Black', value: '#000' },
      { name: 'White', value: '#fff' }
    ]
  })
  .addDecorator(withKnobs)
  .addDecorator(
    withSaladictPanel({
      head: <style>{require('./EntryBox.scss').toString()}</style>
    })
  )
  .add('EntryBox', () => (
    <EntryBox title={text('Title', 'title text')}>
      {text(
        'Content',
        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt recusandae exercitationem minus autem repellendus soluta nulla laudantium nobis! Excepturi, dolorem. Doloremque exercitationem dolores voluptatum sint. Perspiciatis reiciendis doloribus mollitia nisi.'
      )}
    </EntryBox>
  ))
