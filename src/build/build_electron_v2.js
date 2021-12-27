const path = require('path');
const builder = require('electron-builder');
const Platform = builder.Platform;
const package_json = require('../package.json');

const app_icon_path = path.join(path.join('.', 'build', 'icon.ico')); //base path : /src/dist/

const RELEASE_REPO_NAME = 'sbkr_release';

async function build(){
    try {

        const build_cfg = {
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
        }
        
        if(process.env.BUILD_ENV === 'publish'){

            build_cfg.publish = "always";
            build_cfg.config.publish = {
                provider : 'github',
                repo : RELEASE_REPO_NAME,
                owner : package_json.author,
                vPrefixedTagName : true,
                protocol : 'https'
            }
        }

        const result = await builder.build(build_cfg);
        return result;
        
    }catch(e){
        console.log(`Build fail: ${e.message}`);
        return undefined;
    }
}

module.exports.build = build;