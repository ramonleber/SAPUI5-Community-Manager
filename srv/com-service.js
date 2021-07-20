module.exports = (srv) => {

  const Buckets = 'my.communitymanager.Buckets'

  function sendRESTCall() {
  const https = require('http')
  const options = {
  hostname: '192.168.0.144',
  port: 5000,
  path: '/',
  method: 'GET'
  }
  const req = https.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`)
  res.on('data', d => {
    process.stdout.write(d)
  })
  })
  req.on('error', error => {
  console.error(error)
  })
  req.end()
  } 

  // Set level of bucket. True -> Full, False -> Empty
  srv.before ('CREATE', 'CallsForDisposal', async (req) => {
    const disposal = req.data
    const tx = cds.transaction(req)
    const affectedRows = await tx.run (
      UPDATE (Buckets)
        .set ({ level: disposal.level})
        .where ({ ID: disposal.bucket_ID})
    )
    if (disposal.level == 1){
      console.log('level = true')
      sendRESTCall()
    }  
    if (disposal.level == 0)  console.log('level = false')
  })
}