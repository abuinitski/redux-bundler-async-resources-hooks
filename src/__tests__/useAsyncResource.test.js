import createTestStore from '../__test_harness__/createTestStore'
import initHookTest from '../__test_harness__/initHookTest'

import useAsyncResource from '../useAsyncResource'

describe('useAsyncResource hook', () => {
  const initUseAsyncResourceTest = (store, ...hookArgs) => initHookTest(useAsyncResource, store, ...hookArgs)

  test.todo('returns data item')

  test.todo('returns all relevant properties about a resource')

  test.todo('reflects data changes')

  test.todo('throws a promise when there is no data to show')

  test.todo('returns a promise when there is data to show but it is refreshing')

  test.todo('throws an error when there is no data to show due to an error')

  test.todo('returns an error when there is data to show but there is an active error')

  describe('loading promise', () => {
    test.todo('resolves when data loading is completed')
  })

  describe('thrown error', () => {
    test.todo('forwards permanent property')

    test.todo('indicates timestamp for next retry')

    test.todo('allows a manual retry')
  })

  describe('settings', () => {
    test.todo('allows to disable throwing promises')

    test.todo('allows to enable "always throw promise" mode')

    test.todo('allows to disable throwing errors')

    test.todo('allows to enable "always throw error" mode')
  })
})
