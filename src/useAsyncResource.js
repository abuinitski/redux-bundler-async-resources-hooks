import { useMemo, useEffect } from 'react'

import { useConnect, useReduxBundlerStore } from 'redux-bundler-hook'

import useAsyncResourceKeys from './useAsyncResourceKeys'
import AsyncResourceError from './AsyncResourceError'
import checkThrows from './checkThrows'

useAsyncResource.defaults = { throwPromises: false, throwErrors: false }

export default function useAsyncResource(name, settings = { ...useAsyncResource.defaults, eagerFetch: false }) {
  // good performance optimization could be to only limit watched selectors to a certain minimal needed set
  // though need to profile first – not sure even such performance might be an issue here

  const { selectors, keys, actionCreators } = useAsyncResourceKeys(name)
  const selectorsArray = useMemo(() => Object.values(selectors), [name])
  const store = useReduxBundlerStore()
  const values = useConnect(...selectorsArray)

  maybeEagerFetch(values, keys, actionCreators, store, settings)

  const { throwPromise, throwError } = checkThrows(values, keys, settings)
  if (throwPromise) {
    throw makeResourcePromise(values, keys, selectors, store, settings)
  }
  if (throwError) {
    throw makeResourceError(name, values, keys, actionCreators, store)
  }

  return values
}

function maybeEagerFetch(values, keys, actionCreators, store, settings) {
  const pending = values[keys.isPendingForFetch]

  useEffect(() => {
    if (settings.eagerFetch && pending) {
      store[actionCreators.doFetch]()
    }
  }, [settings.eagerFetch, pending])
}

function makeResourcePromise(values, keys, selectors, store, settings) {
  let state = values

  return new Promise(resolve => {
    const unsubscribe = store.subscribeToSelectors(Object.values(selectors), changes => {
      state = {
        ...state,
        ...changes,
      }
      if (!checkThrows(state, keys, settings).throwPromise) {
        resolve()
        unsubscribe()
      }
    })
  })
}

function makeResourceError(name, values, keys, actionCreators, store) {
  return new AsyncResourceError(name, values[keys.error], {
    permanent: values[keys.errorIsPermanent],
    retryAt: values[keys.retryAt],
    retry: () => store[actionCreators.doFetch](),
  })
}
