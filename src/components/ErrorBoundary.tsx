import React, { ComponentType } from 'react'

interface ErrorBoundaryProps {
  /** Reanders on error */
  error?: ComponentType
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends React.PureComponent<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    return this.state.hasError
      ? this.props.error
        ? React.createElement(this.props.error)
        : null
      : this.props.children
  }
}
