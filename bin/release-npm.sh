
if [ ! -e src/coweb/jsoe/OperationEngine.js ]; then
    echo "Please run this script from the root project directory. Eg. \`./bin/script.sh\`"
    exit 1
fi

JSOE_VERSION=`grep VERSION src/coweb/jsoe/OperationEngine.js`
JSOE_VERSION=${JSOE_VERSION#*\"}
JSOE_VERSION=${JSOE_VERSION%\"*}

JSOE_ROOT=`pwd`
TMPDIR=`mktemp -d -t cowebjsoeXXXXXX`
RELEASE_NAME=coweb-jsoe-$JSOE_VERSION
RELEASE_FILE=./dist/npm/$RELEASE_NAME.tgz

FORCE=false
for arg in "$@"; do
    if [ "--force" == $arg ]; then
        FORCE=true
    else
        echo "Unknown option \"$arg\""
        exit 1
    fi
done

echo "Going to build NPM package for coweb-jsoe $JSOE_VERSION..."

if [ -e $RELEASE_FILE ]; then
    if $FORCE; then
        echo "  Overwriting $RELEASE_FILE"
        rm -rf $RELEASE_TARBALL
    else
        echo "Cannot continue build: $RELEASE_FILE already exists! Use --force to overwrite."
        exit 1
    fi
fi

mkdir -p ./dist/npm
cp -r src/* $TMPDIR
cd $TMPDIR
mv npm/* .
rm -rf npm
npm pack
cd $JSOE_ROOT

mv $TMPDIR/$RELEASE_NAME.tgz $RELEASE_FILE
echo "NPM package created at $RELEASE_FILE"

echo "Cleanup temporary files."
rm -rf $TMPDIR

