import DOMPurify from 'dompurify'
import axios, { AxiosRequestConfig } from 'axios'

export function fetchDOM(
  url: string,
  config: AxiosRequestConfig = {}
): Promise<DocumentFragment> {
  return axios(url, {
    ...config,
    transformResponse: [data => data],
    responseType: 'document'
  }).then(({ data }) => DOMPurify.sanitize(data, { RETURN_DOM_FRAGMENT: true }))
}

/** about 6 time faster as it typically takes less than 5ms to parse a DOM */
export function fetchDirtyDOM(
  url: string,
  config: AxiosRequestConfig = {}
): Promise<Document> {
  return axios(url, {
    withCredentials: false,
    ...config,
    transformResponse: [data => data],
    responseType: 'document'
  }).then(({ data }) => data)
}

export function fetchPlainText(
  url: string,
  config: AxiosRequestConfig = {}
): Promise<string> {
  return axios(url, {
    withCredentials: false,
    ...config,
    // axios bug https://github.com/axios/axios/issues/907
    transformResponse: [data => data],
    responseType: 'text'
  }).then(({ data }) => data)
}
