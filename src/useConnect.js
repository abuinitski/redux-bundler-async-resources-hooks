import { useState, useMemo, useEffect, useRef } from 'react'

// TODO: clean me up after https://github.com/mpeyper/react-hooks-testing-library/issues/60 is resolved

export default function useConnect(store, ...args) {
  const [keysToWatch, actions] = useMemo(() => cookArguments(store, args), args)

  const [state, setState] = useState(() => store.select(keysToWatch))

  const prevKeysToWatchRef = useRef(keysToWatch)

  useEffect(() => {
    if (prevKeysToWatchRef.current !== keysToWatch) {
      prevKeysToWatchRef.current = keysToWatch
      setState(store.select(keysToWatch))
    }

    return store.subscribeToSelectors(keysToWatch, changes => {
      setState(currentState => ({ ...currentState, ...changes }))
    })
  }, [keysToWatch])

  if (prevKeysToWatchRef.current !== keysToWatch) {
    return {
      ...actions,
      ...store.select(keysToWatch),
    }
  }

  return {
    ...actions,
    ...state,
  }
}

function cookArguments(store, args) {
  const keysToWatch = []
  const actions = {}

  args.forEach(keyName => {
    if (keyName.slice(0, 6) === 'select') {
      keysToWatch.push(keyName)
      return
    }

    if (keyName.slice(0, 2) === 'do') {
      actions[keyName] = (...args) => {
        if (store.action) {
          return store.action(keyName, args)
        }
        return store[keyName](...args)
      }
      return
    }

    throw Error(`Can Not Connect: ${keyName}`)
  })

  return [keysToWatch, actions]
}
