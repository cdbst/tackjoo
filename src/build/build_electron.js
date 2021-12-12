const packager = require('electron-packager');
const path = require('path');
const package_json = require('../package.json');
const zip = require('electron-installer-zip');

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
        const zip_path = await do_zip(package_path[0])
        return package_path.push(zip_path);
    }catch(err){
        console.log(err);
        return undefined;
    }
}

async function do_zip(package_path){

    const opts = {
        dir: package_path,
        out: path.resolve(path.join('.', 'dist', 'package', package_json.name + package_json.version + '.zip')),
    }

    return new Promise((resolve, rejects) =>{
        zip(opts, (err, res) => {
            if (err) {
                rejects(err);
            }
            resolve(res);
        });
    });
}

module.exports.bundle = bundle;
