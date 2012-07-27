
I18N_SRC="http://requirejs.org/docs/release/1.0.0/minified/i18n.js"
I18N_DST="./org/requirejs/i18n.js"

# Configures/installs necessary components for use with Node.js, etc.
help:
	@echo "Please use \`make <target>' where <target> is one of"
	@echo "  install           Installs required dependencies to use the OT API"
	@echo "  node              Sets up the environment for Node.js support"
	@echo "  clean             Remove files created by the Makefile"

install: i18n

i18n:
	rm -rf org
	mkdir -p org/requirejs
	curl $(I18N_SRC) > $(I18N_DST)

node: i18n
	npm install requirejs

clean:
	rm -rf node_modules/
	rm -rf org/

