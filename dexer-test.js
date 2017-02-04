"use strict";

const dexer = require( "./dexer.js" );

console.log( dexer( {
	"app": "APP",
	"path": "string",
	"index": "string",
	"data": { "name": "simple" },
	"redirect": "string"
} ) );
