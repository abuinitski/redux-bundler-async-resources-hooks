import { useMemo, useContext } from 'react'

import useConnect from './useConnect'
import { ReduxBundlerContext } from 'redux-bundler-hook'

export default function useAsyncResource(name, settings = { throwPromises: false, throwErrors: false }) {
  const { store } = useContext(ReduxBundlerContext)
  const { selectors, keys } = useNames(name)
  const data = useConnect(store, ...selectors)

  const dataIsPresent = data[keys.isPresent]
  const dataIsLoading = data[keys.isLoading]
  const dataError = data[keys.error]

  // data  error  loading    |    ++promises   |    +promises    |     -promises      |    ++errors      |    +errors     |    -errors    |
  //  -      -       -       |        X                 X                             |                                                   |
  //  -      -       +       |        X                 X                             |                                                   |
  //  -      +       -       |        X                 X                             |      X                   X                        |
  //  -      +       +       |        X                 X                             |      X                                            |
  //  +      -       -       |                                                        |                                                   |
  //  +      -       +       |        X                                               |                                                   |
  //  +      +       -       |                                                        |      X                                            |
  //  +      +       +       |        X                                               |      X                                            |

  if (settings.throwPromises) {
    if (settings.throwPromises === 'always' && dataIsLoading) {
      throwPromise(store, keys)
    }

    if (!dataIsPresent) {
      throwPromise(store, keys)
    }
  }

  if (settings.throwErrors && !dataIsPresent && )

  return data
}

function throwPromise(store, keys) {}

function throwError(data, keys) {}

function useNames(name) {
  return useMemo(() => {
    const {
      dataSelector,
      dataKey,
      loadingSelector,
      loadingKey,
      presentSelector,
      presentKey,
      errorSelector,
      errorKey,
      readyForRetrySelector,
      readyForRetryKey,
      errorIsPermanentSelector,
      errorIsPermanentKey,
    } = makeSelectorNames(name)

    return {
      selectors: [
        dataSelector,
        loadingSelector,
        presentSelector,
        errorSelector,
        readyForRetrySelector,
        errorIsPermanentSelector,
      ],
      keys: {
        data: dataKey,
        isLoading: loadingKey,
        isPresent: presentKey,
        error: errorKey,
        isReadyForRetry: readyForRetryKey,
        errorIsPermanent: errorIsPermanentKey,
      },
    }
  }, [name])
}

function makeSelectorNames(name) {
  const upName = name.charAt(0).toUpperCase() + name.slice(1)

  return {
    dataSelector: `select${upName}`,
    dataKey: name,
    loadingSelector: `select${upName}IsLoading`,
    loadingKey: `${name}IsLoading`,
    presentSelector: `select${upName}IsPresent`,
    presentKey: `${name}IsPresent`,
    errorSelector: `select${upName}Error`,
    errorKey: `${name}Error`,
    readyForRetrySelector: `select${upName}IsReadyForRetry`,
    readyForRetryKey: `${name}IsReadyForRetry`,
    errorIsPermanentSelector: `select${upName}ErrorIsPermanent`,
    errorIsPermanentKey: `${name}ErrorIsPermanent`,
  }
}
