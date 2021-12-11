const packager = require('electron-packager');
const path = require('path');
var package_json = require('../package.json');

const options = {
    platform : 'win32',
    arch : 'x64',
    out : path.resolve(path.join('.', 'dist', 'package')),
    prune : true,
    asar : true,
    appVersion : package_json.version,
    dir : path.resolve(path.join('.', 'dist')),
    overwrite : true
};

async function bundle() {
    try{
        const package_path = await packager(options);
        console.log(`Electron app bundles created:\n${package_path.join("\n")}`);
        //await pack_asar(package_path[0]);
    }catch(e){
        console.log(e);
    }
}

module.exports.bundle = bundle;
