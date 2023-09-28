lint:
	pnpm run eslint

lint+fix:
	pnpm run eslint:fix

.PHONY: test
test: build test-unit

test-unit:
	pnpm run test:unit

typecheck:
	pnpm run typecheck

clean:
	pnpm run clean

copy-templates:
	mkdir -p ./dist/templates
	cp -a ./src/templates/. ./dist/templates

check: typecheck lint test

.PHONY: build
build: typecheck clean copy-templates
	pnpm run build
	rm -rf ./dist/*.spec.js ./dist/**/*.spec.js ./dist/**/__mocks__

dist: build
	rm -rf /Users/se/www/exlab/expense-tracker/front/node_modules/@yobta/generator/bin
	cp -a ./bin/. /Users/se/www/exlab/expense-tracker/front/node_modules/@yobta/generator/bin
	rm -rf /Users/se/www/exlab/expense-tracker/front/node_modules/@yobta/generator/dist
	cp -a ./dist/. /Users/se/www/exlab/expense-tracker/front/node_modules/@yobta/generator/dist

i:
	rm -rf node_modules
	pnpm i
