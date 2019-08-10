import React, { FC } from 'react'
import { Word } from '@/_helpers/record-manager'
import { useTranslate } from '@/_helpers/i18n'

export interface WordCardsProps {
  words: Word[]
  onCardDelete: (word: Word) => any
}

export const WordCards: FC<WordCardsProps> = ({ words, onCardDelete }) => {
  const { t } = useTranslate(['common', 'content'])

  return (
    <aside className="wordCards">
      <header>
        <h1 className="wordCards-Title">
          {t('content:wordEditor.wordCardsTitle')}
        </h1>
      </header>
      <ul className="wordCards-CardList">
        {words.map(word => (
          <li className="wordCards-Card" key={word.date}>
            <button
              type="button"
              className="wordCards-CardClose"
              onClick={() => onCardDelete(word)}
            >
              &times;
            </button>
            <h2 className="wordCards-CardTitle">{word.text}</h2>
            {word.trans && (
              <div className="wordCards-CardItem">
                <svg
                  className="wordCards-CardItem_Icon"
                  width="18"
                  height="18"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 469.333 469.333"
                >
                  <title>{t('note.trans')}</title>
                  <path d="M253.227 300.267L199.04 246.72l.64-.64c37.12-41.387 63.573-88.96 79.147-139.307h62.507V64H192V21.333h-42.667V64H0v42.453h238.293c-14.4 41.173-36.907 80.213-67.627 114.347-19.84-22.08-36.267-46.08-49.28-71.467H78.72c15.573 34.773 36.907 67.627 63.573 97.28l-108.48 107.2L64 384l106.667-106.667 66.347 66.347 16.213-43.413zM373.333 192h-42.667l-96 256h42.667l24-64h101.333l24 64h42.667l-96-256zm-56 149.333L352 248.853l34.667 92.48h-69.334z" />
                </svg>
                <span className="wordCards-CardItem_Cont">{word.trans}</span>
              </div>
            )}
            {word.context && (
              <div className="wordCards-CardItem">
                <svg
                  className="wordCards-CardItem_Icon"
                  width="18"
                  height="18"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 95.333 95.332"
                >
                  <title>{t('note.context')}</title>
                  <path d="M 36.587 45.263 C 35.07 44.825 33.553 44.605 32.078 44.605 C 29.799 44.605 27.898 45.125 26.423 45.763 C 27.844 40.559 31.259 31.582 38.061 30.57 C 38.69 30.476 39.207 30.021 39.379 29.408 L 40.864 24.09 C 40.99 23.641 40.916 23.16 40.66 22.77 C 40.403 22.38 39.991 22.119 39.529 22.056 C 39.027 21.987 38.515 21.952 38.009 21.952 C 29.844 21.952 21.759 30.474 18.347 42.675 C 16.344 49.833 15.757 60.595 20.686 67.369 C 23.445 71.16 27.472 73.183 32.657 73.385 L 32.717 73.386 C 39.114 73.386 44.783 69.079 46.508 62.915 C 47.538 59.229 47.073 55.364 45.196 52.029 C 43.338 48.731 40.28 46.327 36.581 45.263 Z M 76.615 52.029 C 74.758 48.731 71.699 46.327 68.002 45.263 C 66.484 44.823 64.968 44.604 63.492 44.604 C 61.214 44.604 59.311 45.121 57.838 45.76 C 59.259 40.553 62.673 31.579 69.475 30.564 C 70.102 30.47 70.619 30.016 70.793 29.402 L 72.28 24.085 C 72.403 23.635 72.332 23.155 72.073 22.764 C 71.814 22.373 71.401 22.113 70.942 22.049 C 70.438 21.981 69.928 21.946 69.417 21.946 C 61.253 21.946 53.169 30.467 49.755 42.669 C 47.752 49.827 47.166 60.59 52.101 67.364 C 54.858 71.153 58.887 73.178 64.069 73.379 C 64.091 73.38 64.111 73.381 64.134 73.381 C 70.527 73.381 76.198 69.074 77.923 62.908 C 78.953 59.224 78.485 55.358 76.609 52.022 Z" />
                </svg>
                <span className="wordCards-CardItem_Cont">{word.context}</span>
              </div>
            )}
            {word.note && (
              <div className="wordCards-CardItem">
                <svg
                  className="wordCards-CardItem_Icon"
                  width="18"
                  height="18"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 35.738 35.738"
                >
                  <title>{t('note.note')}</title>
                  <path d="M0 35.667S11.596-1.403 35.738.117c0 0-2.994 4.85-10.55 6.416 0 0 3.517.43 6.368-.522 0 0-1.71 5.517-11.025 6.275 0 0 5.135 1.33 7.416.57 0 0-.62 4.11-10.102 6.154-.562.12-4.347 1.066-1.306 1.447 0 0 4.37.763 5.514.38 0 0-3.743 5.608-12.927 5.133-.903-.048-1.332 0-1.332 0L0 35.666z" />
                </svg>
                <span className="wordCards-CardItem_Cont">{word.note}</span>
              </div>
            )}
            <div className="wordCards-CardFooter">
              {word.favicon && (
                <img className="wordCards-Favicon" src={word.favicon} />
              )}
              <a
                className="wordCards-URL"
                href={word.url}
                target="_blank"
                rel="nofollow noopener noreferrer"
                title={word.title}
              >
                {word.title}
              </a>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default WordCards
