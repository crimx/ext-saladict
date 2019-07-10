import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { withKnobs, boolean, number } from '@storybook/addon-knobs'
import { SaladBowl, SaladBowlShadow } from '../index'

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
      onEntered={action('onEntered')}
    />
  ))
