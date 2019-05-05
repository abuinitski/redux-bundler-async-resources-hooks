export default function AsyncResourceError(name, originalError, { permanent, retryAt, retry }) {
  const message = `${name} fetch failed`

  Error.call(this, message)

  this.name = 'AsyncResourceError'
  this.message = message
  this.resourceName = name
  this.originalError = originalError
  this.permanent = Boolean(permanent)
  this.retryAt = retryAt
  this.retry = retry

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, AsyncResourceError)
  } else {
    this.stack = new Error().stack
  }
}

AsyncResourceError.prototype = Object.create(Error.prototype)
