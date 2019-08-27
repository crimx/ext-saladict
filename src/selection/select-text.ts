import { Observable, empty, of } from 'rxjs'
import { withLatestFrom, distinctUntilChanged, mergeMap } from 'rxjs/operators'
import { AppConfig } from '@/app-config'
import {
  createValidMouseupStream,
  createClickPeriodCountStream
} from './mouse-events'
import { isTypeField } from './helper'
import { isInDictPanel, isStandalonePage } from '@/_helpers/saladict'
import { getText, getSentence } from 'get-selection-more'
import { checkSupportedLangs } from '@/_helpers/lang-check'

export function createSelectTextStream(
  config$: Observable<AppConfig>,
  lastMousedown$: Observable<MouseEvent | Touch | null>
) {
  if (isStandalonePage()) {
    return empty()
  }

  const validMouseup$$ = createValidMouseupStream(config$, lastMousedown$)
  const clickPeriodCount$ = createClickPeriodCountStream(validMouseup$$)

  return validMouseup$$.pipe(
    withLatestFrom(clickPeriodCount$),
    mergeMap(([[mouseup, config, mousedown], clickCount]) => {
      const self = isInDictPanel(mousedown && mousedown.target)

      if (config.noTypeField && isTypeField(mousedown)) {
        return of(self)
      }

      const text = getText()

      if (!checkSupportedLangs(config.language, text)) {
        return of(self)
      }

      return of({
        text,
        context: getSentence(),
        clickCount,
        event: mouseup,
        self
      })
    }),
    distinctUntilChanged((oldVal, newVal) =>
      Boolean(
        // Always different if selection no valid
        typeof oldVal !== 'boolean' &&
          typeof newVal !== 'boolean' &&
          // Always different if double click.
          newVal.clickCount < 2 &&
          // Always different if no selection
          oldVal.text &&
          oldVal.context &&
          // Same selection. This could be caused by other widget on the page
          // that uses preventDefault which stops selection being cleared when clicked.
          // Ignore it so that the panel won't follow.
          oldVal.text === newVal.text &&
          oldVal.context === newVal.context
      )
    )
  )
}
