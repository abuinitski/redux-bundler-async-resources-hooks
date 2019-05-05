# Redux-Bundler Async Resources Hooks

![](https://img.shields.io/npm/v/redux-bundler-async-resources-hooks.svg) ![](https://img.shields.io/npm/dt/redux-bundler-async-resources-hooks.svg) [![CircleCI](https://circleci.com/gh/abuinitski/redux-bundler-async-resources-hooks/tree/master.svg?style=svg)](https://circleci.com/gh/abuinitski/redux-bundler-async-resources-hooks/tree/master)

React bindings to [redux-bundler-async-resources](https://github.com/abuinitski/redux-bundler-async-resources-hooks)

## Installation

```
npm install --save redux-bundler-hook redux-bundler-async-resources redux-bundler-async-resources-hooks
```

## Usage

(assuming you've used `createAsyncResourceBundle` for "hotCarDeals" and `createAsyncResourcesBundle` for "carDeals" on a specific car id)

```javascript
import React from 'react'
import { useConnect } from 'redux-bundler-hook'
import { useAsyncResource, useAsyncResourcesItem } from 'redux-bundler-async-resources-hooks'

// ... other imports

export default function MyAutomarketDashboard() {
  const { currentCarId } = useConnect('selectCurrentCarId')

  const { hotCarDeals, hotCarDealsIsLoading, hotCarDealsError } = useAsyncResource('hotCarDeals')

  const {
    item: currentCarDeals,
    itemIsLoading: currentCarDealsLoading,
    itemError: currentCarDealsError,
  } = useAsyncResourcesItem('carDeals', currentCarId)

  return (
    <>
      <h1>Here are some deals for you on this car:</h1>
      <CarDealsList deals={currentCarDeals} loading={currentCarDealsLoading} error={currentCarDealsError} />
      <h1>Also take a look at these hot deals:</h1>
      <CarDealsList deals={hotCarDeals} loading={hotCarDealsIsLoading} error={hotCarDealsError} />
    </>
  )
}
```

Hooks above will provide you all fields matching selectors that bundles are capable of.

## Using with Suspense and Error Boundaries

**Warning: using Suspense or Error boundaries assumes throwing things. Make sure these hooks are the only ones or the last ones you use within a single component in order to respect [Rules of Hooks](https://reactjs.org/docs/hooks-rules.html).**

Both hooks receive one last `settings` parameter which can have following fields (all disabled by default):

- `throwErrors` – if truthy, will throw an error for you when there is an error and there is no past data to show. Setting it to `"always"` will always throw if there is an active error.
- `throwPromises` – if truthy, will throw a promise when item is loading and there is no data to show. Setting it to "always" will always throw a promise if item is loading or refreshing.
- `eagerFetch` – see below

##### Using errors

Error boundary can implement a proper "wait-retry" mechanism. Instead of throwing original error, hook will throw an instance of `AsyncResourceError` which will have following properties:

- `resourceName` – which should be self-explanatory
- `originalError` – an instance of original exception that bundle's `getPromise` rejected with
- `permanent` – translated from original error
- `retryAt` – a timestamp at which bundle will attempt next retry for this item
- `retry` – method that can force-trigger a fetch on an item

##### Enabling default behavior

Default values for `throwErrors` and `throwPromises` can be overridden per hook. If you prefer to always use error boundaries and/or suspenses, you can do the following early before any react code is on:

```javascript
import { useAsyncResource, useAsyncResourcesItem } from 'redux-bundler-async-resources-hooks'

useAsyncResource.defaults = { throwErrors: true, throwPromises: true }
useAsyncResourcesItem.defaults = { throwErrors: true, throwPromises: true }
```

## Eager fetch

When setting `eagerFetch` to a truthy value in hooks `settings` parameter, hook will fire an effect which would trigger fetch actions on the item when it is pending for fetch.

It is on-purpose impossible to override with setting with a default.
