lint:
	pnpm run eslint

lint+fix:
	pnpm run eslint:fix

.PHONY: test
test: build test-unit test-e2e coverage

test-unit:
	pnpm run test:unit

test-e2e:
	pnpm run test:e2e

.PHONY: coverage
coverage:
	pnpm run codecov

typecheck:
	pnpm run typecheck

clean:
	pnpm run clean

check: typecheck lint test

build: typecheck clean
	pnpm run build
	pnpm run run

i:
	rm -rf node_modules
	pnpm i
