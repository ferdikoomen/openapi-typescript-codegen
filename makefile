lint:
	pnpm run eslint

lint+fix:
	pnpm run eslint:fix

.PHONY: test
test: build test-unit coverage

test-unit:
	pnpm run test:unit

.PHONY: coverage
coverage:
	pnpm run codecov

typecheck:
	pnpm run typecheck

clean:
	pnpm run clean

copy-templates:
	mkdir -p ./dist/templates
	cp -r ./src/templates/ ./dist/

check: typecheck lint test

build: typecheck clean copy-templates
	pnpm run build
	rm -rf ./dist/*.spec.js ./dist/**/*.spec.js ./dist/**/__mocks__

i:
	rm -rf node_modules
	pnpm i

