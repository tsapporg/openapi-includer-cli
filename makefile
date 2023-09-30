install:
	npm install -g ../ts-npm
	ts-npm install

superclean:
	make clean
	npx shx rm -f ./package.json
	npx shx rm -rf node_modules

tests:
	make test/unit 
	make test/functional
test/unit:
	@echo 'TODO'
test/functional:
	npx shx rm -rf ./src/test/dist
	npx shx rm -f \
		./src/test/_api.yaml \
		./src/test/api.ts \
		/tmp/paths4.yaml \
		/tmp/api.model4.get.yaml
	npx shx cp ./src/test/paths4.yaml /tmp/
	npx shx cp ./src/test/api.model4.get.yaml /tmp/
	node --loader ts-node/esm \
		--experimental-specifier-resolution=node --experimental-modules --no-warnings \
		./src/main.ts ./src/test/dist ./src/test/openapi-spec/api.yaml
	make build/openapi

build/openapi:
	npx openapi-typescript ./src/test/_api.yaml --output ./src/test/api.ts