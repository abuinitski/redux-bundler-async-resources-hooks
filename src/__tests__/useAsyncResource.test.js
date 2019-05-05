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

    const { ref } = initUseAsyncResourceTest(store)

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

    const { ref, act } = initUseAsyncResourceTest(store)

    await act(async () => {
      store.doFetchTestResource()
      await apiMock.resolveFetchRequest('testResource', 'BOOM')
    })

    expect(ref.current.testResourceError).toBe('BOOM')
  })

  describe('loading promise', () => {
    test('does not throw anything with default settings', () => {
      const { store } = createTestStore()
      const { ref } = initUseAsyncResourceTest(store)
      expect(ref.renderCount).toBe(1)
      expect(ref.error).toBe(null)
    })

    test('throws a promise when there is no data to show', () => {
      const { store } = createTestStore()
      const { ref } = initUseAsyncResourceTest(store, { throwPromises: true })

      expect(ref.renderCount).toBe(1)
      expect(ref.error).toBeInstanceOf(Promise)
    })

    test('resolves when data loading is completed', async () => {
      const { store, apiMock } = createTestStore()
      store.doFetchTestResource()

      const { ref, act } = initUseAsyncResourceTest(store, { throwPromises: true })

      await act(async () => {
        await apiMock.resolveFetchRequest('testResource')
      })

      expect(ref.renderCount).toBe(2)
      expect(ref.current.testResource).toBe(':TestResource:')
      expect(ref.error).toBe(null)
    })

    test('resolves when data loading fails', async () => {
      const { store, apiMock } = createTestStore()
      store.doFetchTestResource()

      const { ref, act } = initUseAsyncResourceTest(store, { throwPromises: true })

      const promise = ref.error
      expect(promise).toBeInstanceOf(Promise)

      await act(async () => {
        await apiMock.resolveFetchRequest('testResource', 'error: BOOM')
      })

      await expect(promise).resolves
    })

    test('does not throw a promise when there is data to show', async () => {
      const { store, apiMock } = createTestStore()
      store.doFetchTestResource()
      await apiMock.resolveFetchRequest('testResource')

      const { ref, act } = initUseAsyncResourceTest(store, { throwPromises: true })

      act(() => {
        store.doFetchTestResource()
      })

      expect(ref.error).toBe(null)
    })

    test('always throws a promise when something is loading and "always" setting is on', async () => {
      const { store, apiMock } = createTestStore()
      store.doFetchTestResource()
      await apiMock.resolveFetchRequest('testResource')

      const { ref, act } = initUseAsyncResourceTest(store, { throwPromises: 'always' })

      act(() => {
        store.doFetchTestResource()
      })

      expect(ref.error).toBeInstanceOf(Promise)
    })
  })

  describe('thrown error', () => {
    test('throws an error when there is no data to show due to an error', async () => {
      const { store, apiMock } = createTestStore()
      store.doFetchTestResource()
      await apiMock.resolveFetchRequest('testResource', 'BANG')

      const { ref } = initUseAsyncResourceTest(store, { throwErrors: true })
      expect(ref.error).toBeTruthy()
      expect(ref.error.originalError).toBe('BANG')
    })

    test('forwards permanent property', async () => {
      const { store, apiMock } = createTestStore()
      store.doFetchTestResource()
      await apiMock.resolveFetchRequest('testResource', { message: 'BANG', permanent: 'Yes!' })

      const { ref } = initUseAsyncResourceTest(store, { throwErrors: true })
      expect(ref.error.permanent).toBe(true)
    })

    test('indicates timestamp for next retry', async () => {
      const { store, apiMock } = createTestStore()
      store.doFetchTestResource()
      await apiMock.resolveFetchRequest('testResource', { message: 'BANG' })

      const { ref } = initUseAsyncResourceTest(store, { throwErrors: true })
      expect(ref.error.retryAt).toBeTruthy()
    })

    test('allows a manual retry', async () => {
      const { store, apiMock } = createTestStore()
      store.doFetchTestResource()
      await apiMock.resolveFetchRequest('testResource', { message: 'BANG' })

      const { ref, act } = initUseAsyncResourceTest(store, { throwErrors: true })
      expect(ref.error.retry).toBeDefined()

      await act(async () => {
        ref.error.retry()
        await apiMock.resolveFetchRequest('testResource')
      })

      expect(ref.error).toBe(null)
      expect(ref.current.testResource).toBe(':TestResource:')
    })
  })

  describe('settings', () => {
    let defaults = null

    beforeEach(() => {
      defaults = useAsyncResource.defaults
    })

    afterEach(() => {
      useAsyncResource.defaults = defaults
    })

    test('allows to enable throwing promises and errors', async () => {
      useAsyncResource.defaults = { throwErrors: true, throwPromises: true }

      const { store, apiMock } = createTestStore()
      const { ref, act } = initUseAsyncResourceTest(store)

      expect(ref.error).toBeInstanceOf(Promise)

      await act(async () => {
        store.doFetchTestResource()
        await apiMock.resolveFetchRequest('testResource', 'error')
      })

      expect(ref.error).toBeTruthy()
    })
  })

  describe('eager fetching', () => {
    test('starts fetching if item is pending', async () => {
      const { store, apiMock } = createTestStore()
      const { ref, act } = initUseAsyncResourceTest(store, { eagerFetch: true })

      await act(async () => {}) // wait for effect to settle
      expect(ref.current.testResourceIsLoading).toBe(true)
    })
  })
})
