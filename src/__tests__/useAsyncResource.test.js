import createTestStore from '../__test_harness__/createTestStore'
import initHookTest from '../__test_harness__/initHookTest'

import useAsyncResource from '../useAsyncResource'

describe('useAsyncResource hook', () => {
  const initUseAsyncResourceTest = (store, ...hookArgs) =>
    initHookTest(useAsyncResource, store, 'testResource', ...hookArgs)

  test('returns all relevant properties about a resource', async () => {
    const { store, apiMock } = createTestStore()
    store.doFetchTestResource()
    await apiMock.resolveFetchRequest('testResource')

    const { ref } = initUseAsyncResourceTest(store, 'testResource')

    expect(ref.current.testResource).toBe(':TestResource:')
    expect(ref.current.testResourceIsLoading).toBe(false)
    expect(ref.current.testResourceIsPresent).toBe(true)
    expect(ref.current.testResourceError).toBe(null)
    expect(ref.current.testResourceIsReadyForRetry).toBe(false)
    expect(ref.current.testResourceErrorIsPermanent).toBe(false)
  })

  test('reflects data changes', async () => {
    const { store, apiMock } = createTestStore()
    store.doFetchTestResource()
    await apiMock.resolveFetchRequest('testResource')

    const { ref, act } = initUseAsyncResourceTest(store, 'testResource')

    await act(async () => {
      store.doFetchTestResource()
      await apiMock.resolveFetchRequest('testResource', 'BOOM')
    })

    expect(ref.current.testResourceError).toBe('BOOM')
  })

  describe('loading promise', () => {
    test('throws a promise when there is no data to show', async () => {
      const { store } = createTestStore()
      const { ref, act } = initUseAsyncResourceTest(store, 'testResource', { throwPromises: true })
    })

    test.todo('resolves when data loading is completed')
  })

  // describe('thrown error', () => {
  //   test.todo('throws an error when there is no data to show due to an error')
  //
  //   test.todo('forwards permanent property')
  //
  //   test.todo('indicates timestamp for next retry')
  //
  //   test.todo('allows a manual retry')
  // })
  //
  // describe('settings', () => {
  //   test.todo('allows to disable throwing promises')
  //
  //   test.todo('allows to enable "always throw promise" mode')
  //
  //   test.todo('allows to disable throwing errors')
  //
  //   test.todo('allows to enable "always throw error" mode')
  // })
})
