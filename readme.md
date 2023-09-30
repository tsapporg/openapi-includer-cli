# openapi-includer-cli
Add `$includes` keyword support to OpenAPI specs to include files for certain parts of the spec - like paths - which `$ref` [normally does not support](https://swagger.io/docs/specification/using-ref/).

This source code is experimental and therefore unpublished on NPM; install directly from Github.

openapi-includer-cli looks for arrays of `$includes` kewords in your root OpenAPI specification file and generates a single `_api.yaml` file from them with the included content. Define your API in YAML-compliant but not OpenAPI-compliant specs and then use other software that is Open-API compliant to continue from there.

## Background
You currently can _not_ set paths outside of your root OpenAPI definition file. Because of this limitation - if you use multiple files to configure your OpenAPI definition - you must define _every_ API path twice (once in the referenced file and once in the root OpenAPI definition file):

    paths:
			/cart:
				$ref: ./paths/shop.yaml#/~1cart
			...

This OpenAPI definition would also fail (it's invalid YAML as well):

    paths:
			$ref: ./paths.shop.yaml
			$ref: ./paths.admin.yaml

This OpenAPI definition is valid but does not configure your API as you would expect:

    paths:
			- $ref: ./paths.shop.yaml
			- $ref: ./paths.admin.yaml

This is where this software comes in.

## Configure
Include other files in your main OpenAPI definition file:

    paths:
			$includes: 
				- ./paths.shop.yaml
				- ./paths.admin.yaml
				- ../../paths.relative.yaml
				- /home/ubuntu/paths.absolute.yaml

* Duplicate routes will be klobbered and the last one wins.
* `$include`d files with `$ref`s will have their relative `$ref`erences replaced for the proper path.
* Currently `$include`ing files with `$include` keywords does not work - recursion is not supported yet.

## Usage
From a terminal, run:

    npx ts-app-org/openapi-includer-cli ./dist ./your-openapi-spec.yaml

This generates a `_api.yaml` file in the "dist" directory. You'll also find copied and modified YAML files in "dist" dircectory.