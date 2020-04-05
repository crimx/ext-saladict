import i18next, { TFunction } from 'i18next'
import { i18nLoader, Namespace } from '@/_helpers/i18n'
import { BehaviorSubject, Observable } from 'rxjs'
import { switchMap } from 'rxjs/operators'

export class I18nManager {
  private static instance: I18nManager

  static async getInstance() {
    if (!I18nManager.instance) {
      const instance = new I18nManager()
      I18nManager.instance = instance

      instance.i18n = await i18nLoader()
      instance.i18n$$.next(instance.i18n)
    }
    return I18nManager.instance
  }

  i18n: i18next.i18n

  readonly i18n$$: BehaviorSubject<i18next.i18n>

  // singleton
  private constructor() {
    this.i18n = i18next

    this.i18n$$ = new BehaviorSubject(this.i18n)

    this.i18n.on('languageChanged', () => {
      this.i18n$$.next(this.i18n)
    })
  }

  getFixedT$(ns: Namespace | Namespace[]): Observable<TFunction> {
    return this.i18n$$.pipe(
      switchMap(async i18n => {
        await this.i18n.loadNamespaces(ns)
        return i18n.getFixedT(i18n.language, ns)
      })
    )
  }
}
