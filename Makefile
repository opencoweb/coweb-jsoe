
.PHONY: help node clean

# Configures/installs necessary components for use with Node.js, etc.
help:
	@echo "Please use \`make <target>' where <target> is one of"
	@echo "  node              Sets up the environment for Node.js support"
	@echo "  clean             Remove files created by the Makefile"

node:
	npm install requirejs

clean:
	rm -rf node_modules/

