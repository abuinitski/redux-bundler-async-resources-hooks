import { useMemo } from 'react'
import { makeAsyncResourceBundleKeys } from 'redux-bundler-async-resources'

export default function useAsyncResourceKeys(name) {
  return useMemo(() => makeAsyncResourceBundleKeys(name), [name])
}
