export default function checkThrows(values, keys, settings) {
  let throwPromise = shouldThrowPromise(values, keys, settings.throwPromises)
  let throwError = shouldThrowError(values, keys, settings.throwErrors)

  if (throwPromise && throwError) {
    const someDataIsLoading = values[keys.isLoading]
    if (someDataIsLoading) {
      throwError = false
    } else {
      throwPromise = false
    }
  }

  return { throwError, throwPromise }
}

function shouldThrowPromise(values, keys, setting) {
  if (!setting) {
    return false
  }

  const isLoading = Boolean(values[keys.isLoading])
  const hasData = Boolean(values[keys.isPresent])

  return !hasData || (setting === 'always' && isLoading)
}

function shouldThrowError(values, keys, setting) {
  if (!setting) {
    return false
  }

  const hasError = Boolean(values[keys.error])
  const hasData = Boolean(values[keys.isPresent])

  return hasError && (setting === 'always' || !hasData)
}
