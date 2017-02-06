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
			"fs": "fs",
			"handlebar": "handlebars",
			"lire": "lire",
			"offcache": "offcache",
			"Olivant": "olivant"
		}
	@end-include
*/

const fs = require( "fs" );
const handlebar = require( "handlebars" );
const lire = require( "lire" );
const offcache = require( "offcache" );
const Olivant = require( "olivant" );

/*;
	@option:
		{
			"app": "APP",
			"path": "string",
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

	let app = option.app;
	if( !app ){
		throw new Error( "no given app" );
	}

	if( typeof app.get != "function" ){
		throw new Error( "given app has no get method" );
	}

	let path = option.path;
	if( typeof path != "string" || !path ){
		throw new Error( "invalid path" );
	}

	let index = option.index;
	if( typeof index != "string" || !index ){
		throw new Error( "invalid index" );
	}

	let redirect = option.redirect;
	if( typeof redirect != "string" || !redirect ){
		throw new Error( "invalid redirect" );
	}

	let data = option.data;
	if( typeof data != "object" || !data ){
		throw new Error( "invalid data" );
	}

	app.get( path, function serveIndexHTML( request, response ){
		lire( index )
			( function onRead( error, indexHTML ){
				if( error ){
					Issue( "reading index html", error )
						.prompt( )
						.redirect( redirect )
						.send( response );

				}else if( indexHTML ){
					try{
						indexHTML = handlebar.compile( indexHTML )( data );

					}catch( error ){
						Issue( "processing index html", error )
							.prompt( )
							.redirect( redirect )
							.send( response );

						return;
					}

					offcache( response )
						.set( "Content-Type", "text/html" )
						.send( indexHTML );

				}else{
					Warning( "empty index html", error )
						.prompt( )
						.redirect( redirect )
						.send( response );
				}
			} );
	} );

	return app;
};

module.exports = dexer;
