const cds = require('../../../../cds')
const { toODataResult } = require('../utils/result')

module.exports = (req, res, next) => {
  const _ = {
    req: req.getIncomingRequest(),
    odataReq: req
  }
  const user = new cds.User()
  Object.defineProperty(user, '_req', { enumerable: false, value: _.req })
  const locale = user.locale
  next(null, toODataResult(locale))
}
