import createTestStore from '../__test_harness__/createTestStore'
import initHookTest from '../__test_harness__/initHookTest'

import useAsyncResourcesItem from '../useAsyncResourcesItem'

describe('useAsyncResource hook', () => {
  const initUseAsyncResourcesItemTest = (store, ...hookArgs) =>
    initHookTest(useAsyncResourcesItem, store, 'testResources', ...hookArgs)

  test('returns all relevant properties about a resource', async () => {
    const { store, apiMock } = createTestStore()
    store.doFetchItemOfTestResources(1)
    await apiMock.resolveFetchRequest(1)

    const { ref } = initUseAsyncResourcesItemTest(store, 1)

    expect(ref.current.item).toBe('One')
    expect(ref.current.itemIsLoading).toBe(false)
    expect(ref.current.itemIsPresent).toBe(true)
    expect(ref.current.itemError).toBe(null)
    expect(ref.current.itemIsReadyForRetry).toBe(false)
    expect(ref.current.itemErrorIsPermanent).toBe(false)
  })

  test('reflects data changes', async () => {
    const { store, apiMock } = createTestStore()
    store.doFetchItemOfTestResources(1)
    await apiMock.resolveFetchRequest(1)

    const { ref, act } = initUseAsyncResourcesItemTest(store, 1)

    await act(async () => {
      store.doFetchItemOfTestResources(1)
      await apiMock.resolveFetchRequest(1, 'BOOM')
    })

    expect(ref.current.itemError).toBe('BOOM')
  })

  describe('loading promise', () => {
    test('does not throw anything with default settings', () => {
      const { store } = createTestStore()
      const { ref } = initUseAsyncResourcesItemTest(store, 1)
      expect(ref.renderCount).toBe(1)
      expect(ref.error).toBe(null)
    })

    test('throws a promise when there is no data to show', () => {
      const { store } = createTestStore()
      const { ref } = initUseAsyncResourcesItemTest(store, 1, { throwPromises: true })

      expect(ref.renderCount).toBe(1)
      expect(ref.error).toBeInstanceOf(Promise)
    })

    test('resolves when data loading is completed', async () => {
      const { store, apiMock } = createTestStore()
      store.doFetchItemOfTestResources(1)

      const { ref, act } = initUseAsyncResourcesItemTest(store, 1, { throwPromises: true })

      await act(async () => {
        await apiMock.resolveFetchRequest(1)
      })

      expect(ref.renderCount).toBe(2)
      expect(ref.current.item).toBe('One')
      expect(ref.error).toBe(null)
    })

    test('resolves when data loading fails', async () => {
      const { store, apiMock } = createTestStore()
      store.doFetchItemOfTestResources(1)

      const { ref, act } = initUseAsyncResourcesItemTest(store, 1, { throwPromises: true })

      const promise = ref.error
      expect(promise).toBeInstanceOf(Promise)

      await act(async () => {
        await apiMock.resolveFetchRequest(1, 'error: BOOM')
      })

      await expect(promise).resolves
    })

    test('does not throw a promise when there is data to show', async () => {
      const { store, apiMock } = createTestStore()
      store.doFetchItemOfTestResources(1)
      await apiMock.resolveFetchRequest(1)

      const { ref, act } = initUseAsyncResourcesItemTest(store, 1, { throwPromises: true })

      act(() => {
        store.doFetchItemOfTestResources(1)
      })

      expect(ref.error).toBe(null)
    })

    test('always throws a promise when something is loading and "always" setting is on', async () => {
      const { store, apiMock } = createTestStore()
      store.doFetchItemOfTestResources(1)
      await apiMock.resolveFetchRequest(1)

      const { ref, act } = initUseAsyncResourcesItemTest(store, 1, { throwPromises: 'always' })

      act(() => {
        store.doFetchItemOfTestResources(1)
      })

      expect(ref.error).toBeInstanceOf(Promise)
    })
  })

  describe('thrown error', () => {
    test('throws an error when there is no data to show due to an error', async () => {
      const { store, apiMock } = createTestStore()
      store.doFetchItemOfTestResources(1)
      await apiMock.resolveFetchRequest(1, 'BANG')

      const { ref } = initUseAsyncResourcesItemTest(store, 1, { throwErrors: true })
      expect(ref.error).toBeTruthy()
      expect(ref.error.originalError).toBe('BANG')
    })

    test('forwards permanent property', async () => {
      const { store, apiMock } = createTestStore()
      store.doFetchItemOfTestResources(1)
      await apiMock.resolveFetchRequest(1, { message: 'BANG', permanent: 'Yes!' })

      const { ref } = initUseAsyncResourcesItemTest(store, 1, { throwErrors: true })
      expect(ref.error.permanent).toBe(true)
    })

    test('indicates timestamp for next retry', async () => {
      const { store, apiMock } = createTestStore()
      store.doFetchItemOfTestResources(1)
      await apiMock.resolveFetchRequest(1, { message: 'BANG' })

      const { ref } = initUseAsyncResourcesItemTest(store, 1, { throwErrors: true })
      expect(ref.error.retryAt).toBeTruthy()
    })

    test('allows a manual retry', async () => {
      const { store, apiMock } = createTestStore()
      store.doFetchItemOfTestResources(1)
      await apiMock.resolveFetchRequest(1, { message: 'BANG' })

      const { ref, act } = initUseAsyncResourcesItemTest(store, 1, { throwErrors: true })
      expect(ref.error.retry).toBeDefined()

      await act(async () => {
        ref.error.retry()
        await apiMock.resolveFetchRequest(1)
      })

      expect(ref.error).toBe(null)
      expect(ref.current.item).toBe('One')
    })
  })

  describe('settings', () => {
    let defaults = null

    beforeEach(() => {
      defaults = useAsyncResourcesItem.defaults
    })

    afterEach(() => {
      useAsyncResourcesItem.defaults = defaults
    })

    test('allows to enable throwing promises and errors', async () => {
      useAsyncResourcesItem.defaults = { throwErrors: true, throwPromises: true }

      const { store, apiMock } = createTestStore()
      const { ref, act } = initUseAsyncResourcesItemTest(store, 1)

      expect(ref.error).toBeInstanceOf(Promise)

      await act(async () => {
        store.doFetchItemOfTestResources(1)
        await apiMock.resolveFetchRequest(1, 'error')
      })

      expect(ref.error).toBeTruthy()
    })
  })

  describe('eager fetching', () => {
    test('starts fetching if item is pending', async () => {
      const { store, apiMock } = createTestStore()
      const { ref, act } = initUseAsyncResourcesItemTest(store, 1, { eagerFetch: true })

      await act(async () => {}) // wait for effect to settle
      expect(ref.current.itemIsLoading).toBe(true)
    })
  })
})
