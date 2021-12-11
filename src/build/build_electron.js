const packager = require('electron-packager');
//const asar = require('asar');
const path = require('path');

const options = {
    platform : 'win32',
    arch : 'x64',
    out : path.resolve(path.join('.', 'dist', 'package')),
    prune : true,
    asar : true,
    appVersion : '0.1.0',
    dir : path.resolve(path.join('.', 'dist')),
    overwrite : true
};

bundle();

async function bundle() {
    try{
        const package_path = await packager(options);
        console.log(`Electron app bundles created:\n${package_path.join("\n")}`);
        //await pack_asar(package_path[0]);
    }catch(e){
        console.log(e);
    }
}

async function pack_asar(package_path){
    const src = path.join(package_path, 'resources', 'app');
    const dest = path.join(package_path, 'resources', 'app.asar');

    await asar.createPackageWithOptions(src, dest, {
        unpackDir : "**/{res}"
    });
}

module.exports.bundle = bundle;
