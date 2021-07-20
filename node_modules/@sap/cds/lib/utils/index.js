const cwd = process.env._original_cwd || process.cwd()
const path = require ('path'), { dirname, join, resolve, sep, relative } = path
const fs = require ('fs'), { lstat, access, rm, rmdir, readdir, unlink } = fs.promises
const rw = fs.constants.R_OK | fs.constants.W_OK
const cds = global.cds

module.exports = exports = {
  get uuid() { return $set (this, 'uuid', require('@sap/cds-foss').uuid) }
}

exports.local = (file) => '.' + sep + relative(cwd,file)
exports.path = path
exports.fs = fs

exports.readdir = async function (x) {
  const d = resolve (cds.root,x)
  return fs.promises.readdir(d)
}

exports.stat = async function (x) {
  const d = resolve (cds.root,x)
  return fs.promises.stat(d)
}

exports.exists = function exists (x) {
  if (x) {
    const y = resolve (cds.root,x)
    return fs.existsSync(y)
  }
}

exports.isdir = function isdir (x) {
  if (x) try {
    const y = resolve (cds.root,x)
    const ls = fs.lstatSync(y)
    if (ls.isDirectory()) return y
    if (ls.isSymbolicLink()) return isdir (join (dirname(y), fs.readlinkSync(y)))
  } catch(e){/* ignore */}
}

exports.isfile = function isfile (x) {
  if (x) try {
    const y = resolve (cds.root,x)
    const ls = fs.lstatSync(y)
    if (ls.isFile()) return y
    if (ls.isSymbolicLink()) return isfile (join (dirname(y), fs.readlinkSync(y)))
  } catch(e){/* ignore */}
}

exports.read = async function read (file, _encoding) {
  const f = resolve (cds.root,file)
  const src = await fs.promises.readFile (f, _encoding !== 'json' && _encoding || 'utf8')
  return _encoding === 'json' || !_encoding && f.endsWith('.json') ? JSON.parse(src) : src
}

exports.write = function write (file, data, o) {
  if (arguments.length === 1) return {to:f => write(f,file)}
  if (typeof data === 'object') data = JSON.stringify(data, null, ' '.repeat(o && o.spaces))
  const f = resolve (cds.root,file)
  return mkdirp (dirname(f)).then (()=> fs.promises.writeFile (f,data))
}

exports.mkdirp = async function mkdirp (dir) {
  const d = resolve (cds.root,dir)
  try { await access(d,rw) } catch(_) {
    await mkdirp (dirname(d))
    try { await fs.promises.mkdir(d) }
    catch(e) { if (e.code !== 'EEXIST' /*may still happen with parallel calls*/)  throw e }
  }
  return d
}

exports.rm = async function rm (x) {
  const y = resolve (cds.root,x)
  return unlink(y)
}

exports.rimraf = async function rimraf (dir) {
  if (rm) return rm (dir, {recursive:true,force:true}) //> added in Node 14
  const d = resolve(cds.root,dir)
  const entries = await readdir(d)
  await Promise.all (entries.map (async each => {
    const e = join (d,each)
    const ls = await lstat(e)
    return ls.isDirectory() ? rimraf(e) : unlink(e)
  }))
  return rmdir(d)
}

exports.copy = async function copy (x,y) {
  const src = resolve (cds.root,x)
  const dst = resolve (cds.root,y)
  await mkdirp (dirname(dst))
  if (isdir(src)) {
    const entries = await readdir(src)
    return Promise.all (entries.map (async each => {
      const e = join (src,each)
      const f = join (src,each)
      return copy (e,f)
    }))
  } else {
    return fs.promises.copyFile (src,dst)
  }
}

exports.find = function find (base, patterns='*', filter=()=>true) {
  const files=[];  base = resolve (cds.root,base)
  if (typeof patterns === 'string')  patterns = patterns.split(',')
  if (typeof filter === 'string')  filter = this[filter]
  patterns.forEach (pattern => {
    const star = pattern.indexOf('*')
    if (star >= 0) {
      const head = pattern.slice(0,star).replace(/[^/\\]*$/,'')
      const dir = join (base,head)
      try {
        const ls = fs.lstatSync(dir)
        if (ls.isDirectory()) {
          const [,suffix,tail] = /([^/\\]*)?(?:.(.*))?/.exec (pattern.slice(star+1))
          const prefix = pattern.slice(head.length,star)
          let entries = fs.readdirSync(dir) //.filter (_filter)
          if (prefix)  entries = entries.filter (e => e.startsWith(prefix));  if (!entries.length) return
          if (suffix)  entries = entries.filter (e => e.endsWith(suffix));  if (!entries.length) return
          let paths = entries.map (e=>join(dir,e))
          if (filter)  paths = paths.filter (filter);  if (!paths.length) return
          if (tail)  for (let _files of paths.map (e=>find (e,tail,filter)))  files.push (..._files)
          else  files.push (...paths)
        }
      } catch(e) {/* ignore */}
    } else {
      const file = join (base, pattern)
      if (fs.existsSync(file))  files.push (file)
    }
  })
  return files
}

/** @type <T>(o,p,v:T) => T */
const $set = (o,p,v) => { Object.defineProperty(o,p,{value:v}); return v }
const { mkdirp, isdir } = exports
