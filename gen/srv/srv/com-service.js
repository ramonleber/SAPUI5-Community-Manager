module.exports = (srv) => {

  const Buckets = 'my.communitymanager.Buckets'

  // Set level of bucket. True -> Full, False -> Empty
  srv.before ('CREATE', 'CallsForDisposal', async (req) => {
    console.log('Before')
    const disposal = req.data
    if (disposal.level == 1)  console.log('level = true')
    if (disposal.level == 0)  console.log('level = false')
    const tx = cds.transaction(req)
    const affectedRows = await tx.run (
      UPDATE (Buckets)
        .set ({ level: disposal.level})
        .where ({ ID: disposal.bucket_ID})
    )
  })
}