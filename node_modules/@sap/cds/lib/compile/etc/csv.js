const { readFileSync } = require ('fs')

const SEPARATOR = /[,;\t]/
const CSV = module.exports = { read, parse }

function read (res) {
  try{
    return CSV.parse (readFileSync (res, 'utf-8'))
  } catch(e){/* ignore */}
}

function parse (csv) {
  if (csv[0] === BOM)  csv = csv.slice(1)
  let sep
  const lines = csv.split(/\s*\n/)
  const rows = [], headers = []
  for (let line of lines) {
    if (!rows.length && _ignoreLine (line))  continue
    if (!sep)  [sep] = SEPARATOR.exec(line)||[';']
    const values=[]; let val, currCol=0, c, inString=false
    for (let i=0; i<line.length; ) {
      c = line[i++]
      if (c === sep && !inString) {  // separator
        currCol++
        if (!rows.length && val !== undefined)  headers.push (currCol)     // skip column if header value is empty
        if (headers.includes(currCol))  values.push (_value4(val)) // skip value if column was skipped
        val = undefined //> start new val
      }
      else if (c === '"' && val === undefined) { // start quoted string
        val = ''
        inString = true
      }
      else if (c === '"' && inString) { // within quoted string
        if (line[i] === '"')  val += line[i++]  // escape quote:  "" > "
        else inString = false // stop string
      }
      else {  // normal char
        if (val === undefined)  val = ''
        val += c === '\\' ? '\\\\' : c
      }
    }
    // remaining value
    currCol++
    if (!rows.length && val !== undefined)  headers.push(currCol)  // skip column if header value is empty
    if ((val !== undefined || c === sep) && headers.includes(currCol))  values.push (_value4(val))
    if (values.length > 0)  rows.push (values)
  }
  return rows
}

function _value4 (val) { //NOSONAR
  if (val)  val = val.trim()
  if (val === 'true') return true
  if (val === 'false') return false
  else return val
}

function _ignoreLine(line) {
  return line[0] === '#' || !line.trim().length
}

const BOM = '\ufeff'
