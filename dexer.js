"use strict";

/*;
	@module-license:
		The MIT License (MIT)
		@mit-license

		Copyright (@c) 2017 Richeve Siodina Bebedor
		@email: richeve.bebedor@gmail.com

		Permission is hereby granted, free of charge, to any person obtaining a copy
		of this software and associated documentation files (the "Software"), to deal
		in the Software without restriction, including without limitation the rights
		to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
		copies of the Software, and to permit persons to whom the Software is
		furnished to do so, subject to the following conditions:

		The above copyright notice and this permission notice shall be included in all
		copies or substantial portions of the Software.

		THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
		IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
		FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
		AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
		LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
		OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
		SOFTWARE.
	@end-module-license

	@module-configuration:
		{
			"package": "dexer",
			"path": "dexer/dexer.js",
			"file": "dexer.js",
			"module": "dexer",
			"author": "Richeve S. Bebedor",
			"contributors": [
				"John Lenon Maghanoy <johnlenonmaghanoy@gmail.com>"
			],
			"eMail": "richeve.bebedor@gmail.com",
			"repository": "https://github.com/volkovasystems/dexer.git",
			"test": "dexer-test.js",
			"global": true
		}
	@end-module-configuration

	@module-documentation:
		Serve index HTML file.
	@end-module-documentation

	@include:
		{
			"clazof": "clazof",
			"express": "express",
			"falzy": "falzy",
			"handlebar": "handlebars",
			"harden": "harden",
			"lire": "lire",
			"kept": "kept",
			"offcache": "offcache",
			"Olivant": "olivant",
			"path": "path",
			"protype": "protype",
			"RateLimit": "express-rate-limit",
			"truly": "truly",
			"truu": "truu"
		}
	@end-include
*/

require( "olivant" );

const clazof = require( "clazof" );
const express = require( "express" );
const falzy = require( "falzy" );
const handlebar = require( "handlebars" );
const harden = require( "harden" );
const lire = require( "lire" );
const kept = require( "kept" );
const offcache = require( "offcache" );
const path = require( "path" );
const protype = require( "protype" );
const RateLimit = require( "express-rate-limit" );
const truly = require( "truly" );
const truu = require( "truu" );

harden( "DEFAULT_INDEX_HANDLER_PATH", "/" );
harden( "DEFAULT_CLIENT_PATH", "client" );
harden( "DEFAULT_INDEX", "index.html" );
harden( "DEFAULT_REDIRECT_PATH", "/view/status/page" );

/*;
	@option:
		{
			"middleware": "APP",
			"rootPath": "string",
			"clientPath": "string",
			"index": "string",
			"data": "object",
			"redirect": "string"
		}
	@end-option
*/
const dexer = function dexer( option ){
	/*;
		@meta-configuration:
			{
				"option:required": "object"
			}
		@end-meta-configuration
	*/

	option = option || { };

	let middleware = option.middleware || global.APP || express( );
	if( falzy( middleware ) ){
		throw new Error( "no given middleware" );
	}

	if( !protype( middleware.get, FUNCTION ) ){
		throw new Error( "given middleware has no get method" );
	}

	let rootPath = option.rootPath || process.cwd( );
	if( falzy( rootPath ) || !protype( rootPath, STRING ) ){
		throw new Error( "invalid root path" );
	}

	let clientPath = option.clientPath || DEFAULT_CLIENT_PATH;
	if( falzy( clientPath ) || !protype( clientPath, STRING ) ){
		throw new Error( "invalid client path" );
	}

	let index = option.index || DEFAULT_INDEX;
	if( falzy( index ) || !protype( index, STRING ) ){
		throw new Error( "invalid index" );
	}

	let redirect = option.redirect || DEFAULT_REDIRECT_PATH;
	if( falzy( redirect ) || !protype( redirect, STRING ) ){
		throw new Error( "invalid redirect" );
	}

	let data = option.data;
	if( truly( data ) && !protype( data, OBJECT ) ){
		throw new Error( "invalid data" );
	}

	let indexPath = option.indexPath || "";

	let filePath = path.resolve( rootPath, clientPath, indexPath, index );

	if( !kept( filePath, true ) ){
		Fatal( "index does not exist", filePath );

		return middleware;
	}

	let handlerPath = DEFAULT_INDEX_HANDLER_PATH;
	if( truly( indexPath ) ){
		handlerPath = `/${ indexPath }/${ index }`;
	}

	handlerPath = handlerPath.replace( /\/+/g, "/" );

	let limit = truu( option.limit )? option.limit : { "max": 3 };

	limit.handler = function limit( request, response, next ){
		Redundant( `multiple request to ${ handlerPath }` )
			.silence( )
			.prompt( )
			.send( response );
	};

	let rateLimit = new RateLimit( limit );

	middleware.get( handlerPath, rateLimit, function index( request, response ){
		lire( filePath )
			( function done( error, index ){
				if( clazof( error, Error ) ){
					Issue( "reading index", error )
						.prompt( )
						.redirect( redirect )
						.send( response );

				}else if( truly( index ) ){
					if( truu( data ) ){
						try{
							index = handlebar.compile( index )( data );

						}catch( error ){
							Issue( "processing index", error, data )
								.prompt( )
								.redirect( redirect )
								.send( response );

							return;
						}
					}

					offcache( response )
						.set( "Content-Type", "text/html" )
						.send( index );

				}else{
					Warning( "empty index", handlerPath )
						.prompt( )
						.redirect( redirect )
						.send( response );
				}
			} );
	} );

	Prompt( `index service for ${ handlerPath } is now active` )
		.remind( `serving ${ filePath }` );

	return middleware;
};

module.exports = dexer;
