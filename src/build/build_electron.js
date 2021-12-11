const packager = require('electron-packager');

const options = {
    platform : 'win32',
    arch : 'x64',
    out : '.',
    prune : true,
    //asar : true,
    appVersion : '0.1.0',
    dir : 'dist'
};


async function bundle() {
    const appPaths = await packager(options)
    console.log(`Electron app bundles created:\n${appPaths.join("\n")}`)
}

module.exports.bundle = bundle;
