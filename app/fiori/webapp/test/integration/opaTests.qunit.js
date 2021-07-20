/* global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function() {
	"use strict";

	sap.ui.require([
		"ns/fiori/test/integration/AllJourneys"
	], function() {
		QUnit.start();
	});
});