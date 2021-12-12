const path = require('path');
const electronInstaller = require('electron-winstaller');
const package_json = require('../package.json');

const out_dir = path.resolve(path.join('.', 'dist', 'package', 'installer'))

async function build(app_dir){
    try {
        await electronInstaller.createWindowsInstaller({
            appDirectory: app_dir,
            outputDirectory: out_dir,
            authors: package_json.author,
            exe: package_json.name + '.exe',
            version : package_json.version
        });
        console.log('Build Success!');
        return true;
    }catch(e){
        console.log(`Build fail: ${e.message}`);
        return false;
    }
}

module.exports.build = build;