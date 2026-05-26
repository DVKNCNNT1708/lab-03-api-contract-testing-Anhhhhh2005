.PHONY: install lint mock mock-vision mock-camera mock-all local-vision test-mock test-local test-html test-ci clean

install:
	npm install

lint:
	npm run lint:contracts

mock: mock-vision

mock-vision:
	npm run mock:vision

mock-camera:
	npm run mock:camera

mock-all:
	npm run mock:all

local-vision:
	npm run local:vision

test-mock:
	npm run test:mock

test-local:
	npm run test:local

test-html:
	npm run test:html

test-ci:
	npm run test:ci

clean:
	rm -f reports/*.xml reports/*.html reports/*.json prism*.log
