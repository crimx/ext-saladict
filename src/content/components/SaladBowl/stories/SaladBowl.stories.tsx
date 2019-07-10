import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { withKnobs, boolean, number } from '@storybook/addon-knobs'
import { SaladBowl, SaladBowlShadow, SaladBowlPortal } from '../index'

storiesOf('Content|SaladBowl', module)
  .addDecorator(withKnobs)
  .add('SaladBowl', () => (
    <>
      <style>{require('../style.shadow.scss').toString()}</style>
      <SaladBowl
        mouseX={number('mouseX', 0)}
        mouseY={number('mouseY', 0)}
        withAnimation={boolean('Animation', true)}
        enableHover={boolean('Enable hover', true)}
        onChange={action('onChange')}
      />
    </>
  ))
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
  .add(
    'Bowl Playground',
    () => {
      const [{ mouseX, mouseY }, setCoord] = useState({ mouseX: 0, mouseY: 0 })
      return (
        <div
          style={{ height: 200, background: '#c5d3e2' }}
          onClick={e =>
            setCoord({
              mouseX: e.clientX,
              mouseY: e.clientY
            })
          }
        >
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
    },
    {
      info: 'Click in grey area and the bowl follows.'
    }
  )
