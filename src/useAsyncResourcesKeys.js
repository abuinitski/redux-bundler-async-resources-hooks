import { useMemo } from 'react'
import { makeAsyncResourcesBundleKeys } from 'redux-bundler-async-resources'

export default function useAsyncResourcesKeys(name) {
  return useMemo(() => makeAsyncResourcesBundleKeys(name), [name])
}
