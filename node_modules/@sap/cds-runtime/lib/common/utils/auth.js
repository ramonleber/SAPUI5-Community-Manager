const UNAUTHORIZED = { statusCode: 401, code: '401', message: 'Unauthorized' }
const FORBIDDEN = { statusCode: 403, code: '403', message: 'Forbidden' }

const getRequiresAsArray = definition => {
  if (!definition['@requires']) {
    return []
  }

  return Array.isArray(definition['@requires']) ? definition['@requires'] : [definition['@requires']]
}

module.exports = {
  UNAUTHORIZED,
  FORBIDDEN,
  getRequiresAsArray
}
