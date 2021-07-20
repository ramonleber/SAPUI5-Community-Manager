const vcapApplication = process.env.VCAP_APPLICATION && JSON.parse(process.env.VCAP_APPLICATION)

module.exports = {
  appName: vcapApplication && vcapApplication.application_name,
  appID: vcapApplication && vcapApplication.application_id,
  appURL:
    vcapApplication &&
    vcapApplication.application_uris &&
    vcapApplication.application_uris[0] &&
    `https://${vcapApplication.application_uris[0].replace(/^https?:\/\//, '')}`
}
