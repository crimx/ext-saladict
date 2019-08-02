import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { jsxDecorator } from 'storybook-addon-jsx'
import { withPropsTable } from 'storybook-addon-react-docgen'
import { withKnobs, boolean, number } from '@storybook/addon-knobs'
import { SaladBowl } from './SaladBowl'
import { SaladBowlShadow } from './SaladBowl.shadow'
import { SaladBowlPortal } from './SaladBowl.portal'

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
        onChange={action('onChange')}
      />
    ),
    {
      decorators: [
        function withShadowStyle(fn) {
          return (
            <div>
              <style>{require('./style.shadow.scss').toString()}</style>
              {fn()}
            </div>
          )
        }
      ]
    }
  )
  .add('SaladBowlShadow', () => (
    <SaladBowlShadow
      show={boolean('Show', true)}
      mouseX={number('mouseX', 0)}
      mouseY={number('mouseY', 0)}
      withAnimation={boolean('Animation', true)}
      enableHover={boolean('Enable hover', true)}
      onChange={action('onChange')}
    />
  ))
  .add('SaladBowlPortal', () => (
    <SaladBowlPortal
      show={boolean('Show', true)}
      mouseX={number('mouseX', 0)}
      mouseY={number('mouseY', 0)}
      withAnimation={boolean('Animation', true)}
      enableHover={boolean('Enable hover', true)}
      onChange={action('onChange')}
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
            show={boolean('Show', true)}
            mouseX={mouseX}
            mouseY={mouseY}
            withAnimation={boolean('Animation', true)}
            enableHover={boolean('Enable hover', true)}
            onChange={action('onChange')}
          />
        </div>
      )
    })
  )
