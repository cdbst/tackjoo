const path = require('path');
const builder = require('electron-builder');
const Platform = builder.Platform;
const package_json = require('../package.json');

async function build(){
    try {
        const result = await builder.build({
            targets: Platform.WINDOWS.createTarget(),
            projectDir : path.resolve(path.join('.', 'dist')),            
            config: {
                asar : true,
                appId : package_json.appid,
                // extraFiles : {
                //     from
                // }
            }
        });

        return result;
    }catch(e){
        console.log(`Build fail: ${e.message}`);
        return undefined;
    }
}

module.exports.build = build;