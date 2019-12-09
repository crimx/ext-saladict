import i18next, { TFunction } from 'i18next'
import { i18nLoader, Namespace } from '@/_helpers/i18n'
import { BehaviorSubject, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export class I18nManager {
  private static instance: I18nManager

  static getInstance() {
    return I18nManager.instance || (I18nManager.instance = new I18nManager())
  }

  readonly i18n: i18next.i18n

  readonly i18n$$: BehaviorSubject<i18next.i18n>

  // singleton
  private constructor() {
    this.i18n = i18nLoader()

    this.i18n$$ = new BehaviorSubject(this.i18n)

    this.i18n.on('languageChanged', () => {
      this.i18n$$.next(this.i18n)
    })
  }

  getFixedT$$(ns: Namespace | Namespace[]): Observable<TFunction> {
    this.i18n.loadNamespaces(ns)
    return this.i18n$$.pipe(map(i18n => i18n.getFixedT(i18n.language, ns)))
  }
}
