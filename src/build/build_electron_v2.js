const path = require('path');
const builder = require('electron-builder');
const Platform = builder.Platform;
const package_json = require('../package.json');

const app_icon_path = path.join(path.join('.', 'build', 'icon.ico')); //base path : /src/dist/

async function build(){
    try {
        const result = await builder.build({
            targets: Platform.WINDOWS.createTarget(),
            projectDir : path.resolve(path.join('.', 'dist')),            
            config: {
                asar : true,
                appId : package_json.appid,
                copyright : package_json.copyright,
                win: {
                    icon : app_icon_path
                },
                nsis : {
                    installerIcon : app_icon_path,
                    uninstallerIcon : app_icon_path
                }
            }
        });

        return result;
    }catch(e){
        console.log(`Build fail: ${e.message}`);
        return undefined;
    }
}

module.exports.build = build;