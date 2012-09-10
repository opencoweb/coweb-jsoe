
#Building a release version of coweb-jsoe

##Code organization

The source code of the operational transformation algorithm lives in
`/src/coweb/jsoe`. This code is included in all release packages as it is
essential to having OT.

The code in `/src/npm` is used to generate a Node.JS module.

The code in `/src/org` is 3rd party library code used by coweb-jsoe. See the
NOTICES file in the project root directory for licensing information.

##Building

The release packages are generated using scripts in this `/bin` directory. When
releasing a new version of coweb-jsoe, change all references to version
numbering. As of writing this README, there are three locations with version
information: `/src/coweb/jsoe/OperationEngine.js`, `/src/npm/package.json`, and
`/docs/conf.py`. Change the version number to that of what is about to be released.

###Build coweb-jsoe

The coweb-jsoe target contains only the source code required for creating an
`OTEngine` JavaScript object. Run `./bin/release-jsoe.sh` from the project root
directory. The script will warn if the release tarball already exists in `/dist`.
Use `--force` to overwrite any existing package in `/dist`.

###Build Node.JS coweb-jsoe module

The Node.JS module target is created by running `./bin/release-npm.sh` and works
similar to the above script. After creating the npm release target, run
`npm publish dist/npm/coweb-jsoe-$VERSION.tgz` to publish the target to npm's
central repository.

###Build documentation

You will need the sphinx docs tools for building the documentation. Navigate to
`/docs` and run `make` to see a list of available options. `make html` will
create an HTML version of the documentation.

