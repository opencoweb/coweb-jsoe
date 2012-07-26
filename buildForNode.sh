#!/bin/bash

CURL_PATH=`which curl`
WGET_PATH=`which wget`

function fetch () {
	if [ -n "$WGET_PATH" ]; then
		wget "$1" -O "$2"
	elif [ -n "$CURL_PATH" ]; then
		curl "$1" > "$2"
	else
		echo "Unable to fetch, curl or wget not available."
		exit 1
	fi
}

I18N_SRC="http://requirejs.org/docs/release/1.0.0/minified/i18n.js"
I18N_DST="./org/requirejs/i18n.js"

rm -r ./org/requirejs 2>&1 > /dev/null
mkdir -p ./org/requirejs

fetch $I18N_SRC $I18N_DST

echo "Everything done."

