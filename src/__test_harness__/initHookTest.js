import React from 'react'
import { renderHook, act } from 'react-hooks-testing-library'

import { ReduxBundlerProvider } from 'redux-bundler-hook'

export default function initHookTest(hook, store, ...initialHookArguments) {
  let hookArgs = initialHookArguments

  const wrapper = ({ children }) => <ReduxBundlerProvider store={store}>{children}</ReduxBundlerProvider>

  const ref = {
    current: undefined,
    renderCount: 0,
  }

  const { rerender } = renderHook(
    () => {
      try {
        ref.current = hook(...hookArgs)
        ref.error = null
      } catch (e) {
        ref.current = null
        ref.error = e
      } finally {
        ref.renderCount += 1
      }
    },
    { wrapper }
  )

  return {
    ref,
    store,
    act,
    rerender: (...nextHookArgs) => {
      hookArgs = nextHookArgs
      rerender()
    },
  }
}
