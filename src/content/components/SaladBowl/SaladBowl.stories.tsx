import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { jsxDecorator } from 'storybook-addon-jsx'
import { withPropsTable } from 'storybook-addon-react-docgen'
import { withKnobs, boolean, number } from '@storybook/addon-knobs'
import { SaladBowl } from './SaladBowl'
import { SaladBowlPortal } from './SaladBowl.portal'
import { withLocalStyle } from '@/_helpers/storybook'

storiesOf('Content Scripts|SaladBowl', module)
  .addDecorator(withPropsTable)
  .addDecorator(jsxDecorator)
  .addDecorator(withKnobs)
  .add(
    'SaladBowl',
    () => (
      <SaladBowl
        mouseX={number('mouseX', 0)}
        mouseY={number('mouseY', 0)}
        withAnimation={boolean('Animation', true)}
        enableHover={boolean('Enable hover', true)}
        onActive={action('onActive')}
        onHover={action('onActive')}
      />
    ),
    {
      decorators: [withLocalStyle(require('./SaladBowl.shadow.scss'))],
      jsx: { skip: 1 }
    }
  )
  .add('SaladBowlPortal', () => (
    <SaladBowlPortal
      show={boolean('Show', true)}
      mouseX={number('mouseX', 0)}
      mouseY={number('mouseY', 0)}
      withAnimation={boolean('Animation', true)}
      enableHover={boolean('Enable hover', true)}
      onActive={action('onActive')}
    />
  ))
  .add('Bowl Playground', () =>
    React.createElement(() => {
      const [{ mouseX, mouseY }, setCoord] = useState({
        mouseX: 0,
        mouseY: 0
      })
      return (
        <div
          style={{ height: '100vh', background: '#5caf9e', overflow: 'hidden' }}
          onClick={e =>
            setCoord({
              mouseX: e.clientX,
              mouseY: e.clientY
            })
          }
        >
          <p style={{ textAlign: 'center', color: '#fff', userSelect: 'none' }}>
            CLICK AROUND AND SEE THE BOWL FOLLOWS
          </p>
          <SaladBowlPortal
            show
            mouseX={mouseX}
            mouseY={mouseY}
            withAnimation={boolean('Animation', true)}
            enableHover={boolean('Enable hover', true)}
            onActive={action('onActive')}
          />
        </div>
      )
    })
  )
