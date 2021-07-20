const { struct, type } = require ('./classes')

class entity extends struct   {
  is (kind) { return kind === 'entity' || kind === 'view' && !!this.query || super.is(kind) }
  get keys() {
    return this.own('_keys') || this.set('_keys', this._elements (e => e.key))
  }
  get associations() {
    return this.own('_associations') || this.set('_associations', this._elements (e => e instanceof Association))
  }
  get compositions() {
    return this.own('_compositions') || this.set('_compositions', this._elements (e => e instanceof Composition))
  }
  get texts() {
    return this.own('_texts') || this.set('_texts', {__proto__:this, name: this.name + '.texts' })
  }
  get drafts() {
    return this.own('_drafts') || this.set('_drafts',
      this.elements.HasDraftEntity && { name: this.name + '_drafts', keys: this.keys }
    )
  }
  _elements (filter) {
    const {elements} = this, dict={}; let any
    for (let e in elements) if (filter(elements[e])) (any = dict)[e] = elements[e]
    return any
  }
}

class Association extends type {

  is(kind) { return kind === 'Association' || super.is(kind) }
  get isAssociation(){ return true }

  get is2many() { return !this.is2one }
  get is2one() {
    let c = this.cardinality
    return !c || c.max === 1 || (!c.max && !c.targetMax) || c.targetMax === 1
  }

  set _elements(k) { this.set('_elements', k) }
  get _elements() {
    const { keys } = this
    if (!keys) return (this._elements = undefined)
    const fks = {},{ elements } = this._target
    for (let k of keys) fks[k.as || k.ref[0]] = elements[k.ref[0]]
    return (this._elements = fks)
  }

  set _keys(k) { this.set('keys', k) }
  get _keys() {
    if (this.keys) return (this._keys = this.keys)
    if (this.on || this.is2many || !this._target) return (this._keys = undefined)
    const keys = [],
      tks = this._target.keys
    for (let k in tks) keys.push({ ref: [tks[k].name] })
    return (this._keys = keys)
  }
}


class Composition extends Association {

  is(kind) { return kind === 'Composition' || super.is(kind) }
  get isComposition(){ return true }
  get isManagedComposition(){ return this._target && this._target.kind !== 'entity' }

}


module.exports = { entity, Association, Composition }
