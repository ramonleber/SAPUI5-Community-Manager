'use strict';


// ------------------------------------------------------------------------------
// Only to be used with validator.js - a correct this value needs to be provided!
// ------------------------------------------------------------------------------

// This set of checks are candidates to be moved to a linter

/**
 * `@Core.MediaType` must be assigned to elements of certain types
 *
 * @param {CSN.Element} member Member to be checked
 */
function checkCoreMediaTypeAllowence(member) {
  const allowedCoreMediaTypes = [
    'cds.String',
    'cds.LargeString',
    'cds.hana.VARCHAR',
    'cds.hana.CHAR',
    'cds.Binary',
    'cds.LargeBinary',
    'cds.hana.CLOB',
    'cds.hana.BINARY',
  ];
  if (member['@Core.MediaType'] && member.type && !allowedCoreMediaTypes.includes(member.type)) {
    this.warning(null, member.$path, { names: [ 'Edm.String', 'Edm.Binary' ] },
                 'Element annotated with “@Core.MediaType” should be of a type mapped to $(NAMES)');
  }
}

/**
 * Make sure only one element in a definition is annotated with `@Core.MediaType`
 * This is only OData V2 relevant.
 *
 * @param {CSN.Artifact} artifact Definition to be checked
 * @param {string} artifactName The name of the artifact
 */
function checkForMultipleCoreMediaTypes(artifact, artifactName) {
  if (!this.csnUtils.getServiceName(artifactName))
    return;
  if (this.options.toOdata && this.options.toOdata.version === 'v2' && artifact.elements) {
    const mediaTypeElementsNames = Object.keys(artifact.elements)
      .filter(elementName => artifact.elements[elementName]['@Core.MediaType']);
    if (mediaTypeElementsNames.length > 1) {
      this.error(null, artifact.$path, { names: mediaTypeElementsNames },
                 `Multiple elements $(NAMES) annotated with “@Core.MediaType”, OData V2 allows only one`);
    }
  }
}

/**
 * Check if `@Aggregation.default` is assigned together with `@Analytics.Measure`
 *
 * @param {CSN.Element} member Member to be checked
 */
function checkAnalytics(member) {
  if (member['@Analytics.Measure'] && !member['@Aggregation.default']) {
    this.info(null, member.$path,
              'Annotation “@Analytics.Measure” expects “@Aggregation.default” to be assigned for the same element as well');
  }
}

/**
 * `@sap..` annotations should be of type boolean or string
 *
 * @param {(CSN.Artifact|CSN.Element)} node Member or artifact to be checked
 */
function checkAtSapAnnotations(node) {
  Object.keys(node).forEach((prop) => {
    if (prop.startsWith('@sap.') && typeof node[prop] !== 'boolean' && typeof node[prop] !== 'string')
      this.warning(null, node.$path, { name: prop }, 'Annotation $(NAME) must have a string or boolean value');
  });
}

/**
 * Annotations `@readonly` and `@insertonly` can't be assigned together
 *
 * @param {CSN.Artifact} artifact Artifact to be checked
 * @param {string} artifactName The name of the artifact
 */
function checkReadOnlyAndInsertOnly(artifact, artifactName) {
  if (!this.csnUtils.getServiceName(artifactName))
    return;
  if (artifact.kind && [ 'entity', 'view' ].includes(artifact.kind) && artifact['@readonly'] && artifact['@insertonly'])
    this.warning(null, artifact.$path, 'Annotations “@readonly” and “@insertonly” can\'t be assigned in combination');
}

module.exports = {
  checkCoreMediaTypeAllowence,
  checkForMultipleCoreMediaTypes,
  checkAnalytics,
  checkAtSapAnnotations,
  checkReadOnlyAndInsertOnly,
};
