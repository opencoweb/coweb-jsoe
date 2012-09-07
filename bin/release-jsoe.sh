
if [ ! -e src/coweb/jsoe/OperationEngine.js ]; then
    echo "Please run this script from the root project directory. Eg. \`./bin/script.sh\`"
    exit 1
fi

JSOE_VERSION=`grep VERSION src/coweb/jsoe/OperationEngine.js`
JSOE_VERSION=${JSOE_VERSION#*\"}
JSOE_VERSION=${JSOE_VERSION%\"*}

JSOE_ROOT=`pwd`
TMPDIR=`mktemp -d -t cowebjsoeXXXXXX`
RELEASE_NAME=jsoe-$JSOE_VERSION
RELEASE_TARBALL_DIR=./dist/jsoe
RELEASE_TARBALL=$RELEASE_TARBALL_DIR/$RELEASE_NAME.tar

FORCE=false
for arg in "$@"; do
    if [ "--force" == $arg ]; then
        FORCE=true
    fi
done

echo "Going to build $JSOE_VERSION..."

if [ -e $RELEASE_TARBALL ]; then
    if $FORCE; then
        echo "  Overwriting $RELEASE_TARBALL"
        rm -rf $RELEASE_TARBALL
    else
        echo "Cannot continue build: $RELEASE_TARBALL already exists! Use --force to overwrite."
        exit 1
    fi
fi

mkdir -p $RELEASE_TARBALL_DIR
mkdir -p  $TMPDIR/$RELEASE_NAME/coweb/jsoe
cp -r src/coweb $TMPDIR/$RELEASE_NAME
cp -r src/org $TMPDIR/$RELEASE_NAME
cd $TMPDIR
tar -cf $JSOE_ROOT/$RELEASE_TARBALL ./
echo "Created $RELEASE_TARBALL"
cd $JSOE_ROOT

echo "Cleanup temporary files."
rm -rf $TMPDIR

