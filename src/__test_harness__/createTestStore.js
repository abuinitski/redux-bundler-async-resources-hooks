import MockApiClient from './MockApiClient'
import { appTimeBundle, composeBundlesRaw, createReactorBundle } from 'redux-bundler'
import { createAsyncResourceBundle, createAsyncResourcesBundle } from 'redux-bundler-async-resources'

export default function createTestStore(settings = {}) {
  const apiMock = new MockApiClient()

  const apiMockBundle = {
    name: 'withApiClient',
    getExtraArgs: () => ({ apiClient: apiMock }),
  }

  const oneResourceBundle = createAsyncResourceBundle({
    name: 'testResource',
    getPromise: ({ apiClient }) => apiClient.fetchItem('testResource'),
    ...settings,
  })

  const multipleResourcesBundle = createAsyncResourcesBundle({
    name: 'testResources',
    getPromise: (itemId, { apiClient }) => apiClient.fetchItem(itemId),
    ...settings,
  })

  const storeFactory = composeBundlesRaw(appTimeBundle, createReactorBundle(), apiMockBundle, oneResourceBundle)

  return { store: storeFactory(), apiMock }
}
