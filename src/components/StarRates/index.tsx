import React from 'react'

export interface StarRatesProps {
  className?: string
  rate?: number
  width?: number
  gutter?: number
}

export default class StarRates extends React.PureComponent<StarRatesProps> {
  render () {
    const className = this.props.className || 'widget-StarRates'
    const rate = Number(this.props.rate) % 6 || 0
    const width = Number(this.props.width) || 20
    const gutter = Number(this.props.gutter) || 5

    return (
      <div className={className}>
        {Array.from(Array(5)).map((_, i) => (
          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 426.67 426.67'
            key={i + rate}
            width={width}
            style={{ marginRight: i === 4 ? '' : gutter }}
          >
            <path fill={i < rate ? '#FAC917' : '#d1d8de'} d='M213.33 10.44l65.92 133.58 147.42 21.42L320 269.4l25.17 146.83-131.84-69.32-131.85 69.34 25.2-146.82L0 165.45l147.4-21.42' />
          </svg>
        ))}
      </div>
    )
  }
}
