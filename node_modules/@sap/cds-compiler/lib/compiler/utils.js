// Simple compiler utility functions

// This file contains small utility functions which do not access the complete
// XSN or functions instantiated using the XSN.

// Please do not add functions “for completeness”, this is not an API file for
// others but only by the core compiler.

'use strict';

// for links, i.e., properties starting with an underscore '_':

function pushLink( obj, prop, value ) {
  const p = obj[prop];
  if (p)
    p.push( value );
  else
    Object.defineProperty( obj, prop, { value: [ value ], configurable: true, writable: true } );
}

// for annotations:

function annotationVal( anno ) {
  return anno && (anno.val === undefined || anno.val); // XSN TODO: set val for anno short form
}
function annotationIsFalse( anno ) {                   // falsy, but not null (unset)
  return anno && (anno.val === false || anno.val === 0 || anno.val === '');
}

function annotateWith( art, anno, location = art.location, val = true, literal = 'boolean' ) {
  if (art[anno])  // do not overwrite user-defined including null
    return;
  art[anno] = {
    name: { path: [ { id: anno.slice(1), location } ], location },
    val,
    literal,
    location,
  };
}


module.exports = {
  pushLink,
  annotationVal,
  annotationIsFalse,
  annotateWith,
};
