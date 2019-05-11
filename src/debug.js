const logger = loadDebug()

const NOOP = () => {}

export default function makeDebugLogger(module) {
  if (!logger) {
    return NOOP
  }
  return logger(module)
}

function loadDebug() {
  try {
    return require('debug')
  } catch {
    return null
  }
}
