import { useMemo, useEffect } from 'react'
import { useConnect, useReduxBundlerStore } from 'redux-bundler-hook'
import { asyncResources, makeAsyncResourceBundleKeys } from 'redux-bundler-async-resources'

import useAsyncResourcesKeys from './useAsyncResourcesKeys'
import checkThrows from './checkThrows'
import AsyncResourceError from './AsyncResourceError'

useAsyncResourcesItem.defaults = { throwPromises: false, throwErrors: false }

const TransformedKeys = makeAsyncResourceBundleKeys('item').keys

export default function useAsyncResourcesItem(name, itemId, inputSettings = null) {
  const settings = {
    ...useAsyncResourcesItem.defaults,
    eagerFetch: false,
    ...inputSettings,
  }

  const { selectors: sourceSelectors, keys: sourceKeys, actionCreators } = useAsyncResourcesKeys(name)

  const store = useReduxBundlerStore()
  const storedState = useConnect(sourceSelectors.items)

  const item = storedState[sourceKeys.items][itemId]

  maybeEagerFetch(itemId, item, actionCreators, store, settings)

  const { throwValue, returnValue } = useMemo(() => {
    const transformedValues = makeItemValues(item)

    const { throwPromise, throwError } = checkThrows(transformedValues, TransformedKeys, settings)
    if (throwPromise) {
      return { throwValue: makeResourcePromise(itemId, sourceSelectors, sourceKeys, store, settings) }
    }
    if (throwError) {
      return { throwValue: makeResourceError(name, itemId, transformedValues, actionCreators, store) }
    }

    return { returnValue: transformedValues }
  }, [item])

  if (throwValue) {
    throw throwValue
  }

  return returnValue
}

function maybeEagerFetch(itemId, item, actionCreators, store, settings) {
  const pending = asyncResources.itemIsPendingForFetch(item)

  useEffect(() => {
    if (settings.eagerFetch && pending) {
      store[actionCreators.doFetch](itemId)
    }
  }, [settings.eagerFetch, pending])
}

function makeResourcePromise(itemId, selectors, keys, store, settings) {
  return new Promise(resolve => {
    const unsubscribe = store.subscribeToSelectors([selectors.items], changes => {
      const values = makeItemValues(changes[keys.items][itemId])

      if (!checkThrows(values, TransformedKeys, settings).throwPromise) {
        resolve()
        unsubscribe()
      }
    })
  })
}

function makeResourceError(name, itemId, transformedValues, actionCreators, store) {
  return new AsyncResourceError(name, transformedValues.itemError, {
    permanent: transformedValues.itemErrorIsPermanent,
    retryAt: transformedValues.itemRetryAt,
    retry: () => store[actionCreators.doFetch](itemId),
  })
}

function makeItemValues(item) {
  return {
    item: asyncResources.getItemData(item),
    itemIsPresent: asyncResources.itemIsPresent(item),
    itemIsLoading: asyncResources.itemIsLoading(item),
    itemIsPendingForFetch: asyncResources.itemIsPendingForFetch(item),
    itemError: asyncResources.getItemError(item),
    itemIsReadyForRetry: asyncResources.itemIsReadyForRetry(item),
    itemRetryAt: asyncResources.itemRetryAt(item),
    itemErrorIsPermanent: asyncResources.itemErrorIsPermanent(item),
    itemIsStale: asyncResources.itemIsStale(item),
  }
}
