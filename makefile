install:
	if [ -d ../ts-npm ]; then \
		npm install -g ../ts-npm; \
	else \
		npm install -g tsapporg/ts-npm; \
	fi;

	ts-npm install

tests:
	make package/cli -f makefile.shared
	
	npx shx rm -f ./test/**/out/_api.yaml
	npx shx rm -f ./test/**/out/_api.ts
	npx shx rm -rf ./test/**/out/_types

	./dist/index-macos \
		--absolute-input-openapi-def-path=$(shell pwd)/test/test2/api.yaml \
		--absolute-output-openapi-def-path=$(shell pwd)/test/test2/out/_api.yaml

# node --experimental-specifier-resolution=node \
# 	--experimental-modules --no-warnings --loader ts-node/esm \
# 	./src/index.ts \
# 	--absolute-input-openapi-def-path=$(shell pwd)/test/test2/api.yaml \
# 	--absolute-output-openapi-def-path=$(shell pwd)/test/test2/out/_api.yaml

# npx ts-node --script-mode --esm --project tsconfig.json src/index.ts \
# 	--absolute-input-openapi-def-path=$(shell pwd)/test/test2/api.yaml \
# 	--absolute-output-openapi-def-path=$(shell pwd)/test/test2/out/_api.yaml

	make build/types

build/types:
# For API client...
	npx openapi-typescript ./test/test2/out/_api.yaml --output ./test/test2/out/_api.ts

# For HTTP routing...
	npx openapi-ts-backend generate-types $(shell pwd)/test/test2/out/_api.yaml $(shell pwd)/test/test2/out/_types