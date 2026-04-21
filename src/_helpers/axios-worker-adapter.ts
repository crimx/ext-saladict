import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

const buildURL = require('axios/lib/helpers/buildURL')
const buildFullPath = require('axios/lib/core/buildFullPath')

type AxiosLikeError = Error & {
  config?: AxiosRequestConfig
  code?: string
  request?: any
  response?: AxiosResponse
  isAxiosError?: boolean
  toJSON?: () => object
}

function isMv3ExtensionWorker() {
  if (typeof document !== 'undefined') {
    return false
  }

  if (
    typeof browser === 'undefined' ||
    !browser.runtime ||
    !browser.runtime.getManifest
  ) {
    return false
  }

  return browser.runtime.getManifest().manifest_version === 3
}

function createAxiosLikeError(
  message: string,
  config: AxiosRequestConfig,
  code?: string,
  request?: any,
  response?: AxiosResponse
): AxiosLikeError {
  const error = new Error(message) as AxiosLikeError
  error.config = config
  error.request = request
  error.response = response
  error.isAxiosError = true

  if (code) {
    error.code = code
  }

  error.toJSON = function() {
    return {
      message: this.message,
      name: this.name,
      stack: this.stack,
      config: this.config,
      code: this.code
    }
  }

  return error
}

function headersToObject(headers: Headers) {
  const parsed: { [name: string]: string } = {}

  headers.forEach((value, key) => {
    parsed[key] = parsed[key] ? `${parsed[key]}, ${value}` : value
  })

  return parsed
}

function shouldResolveResponse(
  config: AxiosRequestConfig,
  response: AxiosResponse
) {
  if (!response.status || !config.validateStatus) {
    return response.status >= 200 && response.status < 300
  }

  return config.validateStatus(response.status)
}

function toBodyInit(data: AxiosRequestConfig['data']): BodyInit | undefined {
  if (data == null) {
    return undefined
  }

  return data as BodyInit
}

async function readResponseData(
  response: Response,
  config: AxiosRequestConfig
) {
  switch (config.responseType) {
    case 'arraybuffer':
      return response.arrayBuffer()
    case 'blob':
      return response.blob()
    case 'json':
    case 'text':
    case undefined:
      return response.text()
    default:
      return response.text()
  }
}

const extensionWorkerAdapter = async (
  config: AxiosRequestConfig
): Promise<AxiosResponse> => {
  const controller = new AbortController()
  let cancelError: any
  let didTimeout = false

  const timeoutId =
    config.timeout && config.timeout > 0
      ? setTimeout(() => {
          didTimeout = true
          controller.abort()
        }, config.timeout)
      : null

  if (config.cancelToken) {
    config.cancelToken.promise.then(cancel => {
      cancelError = cancel
      controller.abort()
    })
  }

  const headers = {
    ...(config.headers as { [name: string]: string } | undefined)
  }

  if (config.auth) {
    const username = config.auth.username || ''
    const password = config.auth.password
      ? unescape(encodeURIComponent(config.auth.password))
      : ''
    headers.Authorization = 'Basic ' + btoa(`${username}:${password}`)
  }

  const method = (config.method || 'get').toUpperCase()
  const url = buildURL(
    buildFullPath(config.baseURL, config.url),
    config.params,
    config.paramsSerializer
  )

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: ['GET', 'HEAD'].includes(method)
        ? undefined
        : toBodyInit(config.data),
      signal: controller.signal,
      credentials: config.withCredentials ? 'include' : 'same-origin'
    })

    const axiosResponse: AxiosResponse = {
      data: await readResponseData(response, config),
      status: response.status,
      statusText: response.statusText,
      headers: headersToObject(response.headers),
      config,
      request: response
    }

    if (shouldResolveResponse(config, axiosResponse)) {
      return axiosResponse
    }

    throw createAxiosLikeError(
      `Request failed with status code ${response.status}`,
      config,
      undefined,
      response,
      axiosResponse
    )
  } catch (error) {
    if (cancelError) {
      throw cancelError
    }

    if (didTimeout) {
      throw createAxiosLikeError(
        config.timeoutErrorMessage ||
          `timeout of ${config.timeout || 0}ms exceeded`,
        config,
        'ECONNABORTED'
      )
    }

    if (error && error.isAxiosError) {
      throw error
    }

    throw createAxiosLikeError('Network Error', config)
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }
}

if (isMv3ExtensionWorker() && typeof axios.defaults.adapter !== 'function') {
  axios.defaults.adapter = extensionWorkerAdapter
}

export {}
