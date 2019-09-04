import React from 'react'
import { withTranslation, WithTranslation } from 'react-i18next'
import { Word } from '@/_helpers/record-manager'

interface NotebookProps {
  word?: Word
  hasError: boolean
}

const wrapperStyle: React.CSSProperties = {
  textAlign: 'center',
  margin: '10px 20px',
  fontSize: 14
}

export class Notebook extends React.Component<NotebookProps & WithTranslation> {
  componentDidMount() {
    setTimeout(() => {
      window.close()
    }, 3000)
  }

  renderError() {
    return (
      <div style={wrapperStyle}>
        <p>
          <svg
            width="100"
            height="100"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 426.667 426.667"
          >
            <path
              fill="#f05228"
              d="M213.333 0C95.514 0 0 95.514 0 213.333s95.514 213.333 213.333 213.333 213.333-95.514 213.333-213.333S331.153 0 213.333 0zm117.662 276.689l-54.302 54.306-63.36-63.356-63.36 63.36-54.302-54.31 63.356-63.356-63.356-63.36 54.302-54.302 63.36 63.356 63.36-63.356 54.302 54.302-63.356 63.36 63.356 63.356z"
            />
          </svg>
        </p>
        <p>{this.props.t('notebook_error')}</p>
      </div>
    )
  }

  renderEmpty() {
    return (
      <div style={wrapperStyle}>
        <p>
          <svg
            width="100"
            height="100"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 426.667 426.667"
          >
            <g fill="#fac917">
              <path d="M213.338 0C95.509 0 0 95.497 0 213.325c0 117.854 95.509 213.342 213.338 213.342 117.82 0 213.329-95.488 213.329-213.342C426.667 95.497 331.157 0 213.338 0zm-.005 99.49c14.793 0 26.786 11.994 26.786 26.786s-11.998 26.782-26.786 26.782-26.786-11.994-26.786-26.782c0-14.792 11.994-26.786 26.786-26.786zm46.874 227.691H166.46v-40.183h20.087V206.64H166.46v-40.18h73.664v120.537h20.087v40.183h-.004z" />
              <path d="M325.935 394.449l93.615 25.08-25.084-93.611z" />
            </g>
          </svg>
        </p>
        <p>{this.props.t('notebook_empty')}</p>
      </div>
    )
  }

  renderSuccess(word: Word) {
    return (
      <div style={wrapperStyle}>
        <p>
          <svg
            width="100"
            height="100"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 426.667 426.667"
          >
            <path
              fill="#6ac259"
              d="M213.333 0C95.518 0 0 95.514 0 213.333s95.518 213.333 213.333 213.333c117.828 0 213.333-95.514 213.333-213.333S331.157 0 213.333 0zm-39.134 322.918l-93.935-93.931 31.309-31.309 62.626 62.622 140.894-140.898 31.309 31.309-172.203 172.207z"
            />
          </svg>
        </p>
        <p>
          {this.props.t('notebook_added')} 「{word.text}」
        </p>
      </div>
    )
  }

  render() {
    const { word, hasError } = this.props
    if (hasError) {
      return this.renderError()
    }
    if (word && word.text) {
      return this.renderSuccess(word)
    } else {
      return this.renderEmpty()
    }
  }
}

export default withTranslation()(Notebook)
