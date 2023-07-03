install:
	npm install -g ../ts-npm
	ts-npm install

superclean:
	make clean
	npx shx rm -f ./package.json
	npx shx rm -rf node_modules

clean:
	npx shx rm -f ./package-lock.json

tests:
	make test/unit 
	make test/functional
test/unit:
	@echo 'TODO'
test/functional:
	npx shx rm -f ./src/test/_api.yaml
	npx shx rm -f ./src/test/api.ts
	node --experimental-specifier-resolution=node --experimental-modules --no-warnings --loader ts-node/esm ./src/main.ts ./src/test/api.yaml
	make build/openapi

build/openapi:
	npx openapi-typescript ./src/test/_api.yaml --output ./src/test/api.ts