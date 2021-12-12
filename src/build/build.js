const prebuild = require('./prebuild').prebuild;
const build_main = require('./build_main');
const build_renderer = require('./build_renderer');
const build_electron = require('./build_electron');
const build_electron_v2 = require('./build_electron_v2');

(async()=>{
    console.log('#step1 > waiting for prebuild..');
    prebuild();

    console.log('#step2 > waiting for bundling main process source codes..');
    let result = await build_main.bundle();
    if(result == false){
        console.error('# build fail !! - bundling main process codes.');
        process.exit(1);
    }

    console.log('#step3 > waiting for bundling renderer process source codes..');
    result = build_renderer.bundle();
    if(result == undefined){
        console.error('# build fail !! - bundling renderer process codes.');
        process.exit(1);
    }

    console.log('#step4 > waiting for bundling electron package..');
    //const outputs = await build_electron_v2.build();
    const outputs = await build_electron.bundle();
    if(outputs == undefined){
        console.log('# build fail !! - bundling electron package');
        process.exit(1);
    }

    console.log('# build complete !!');
})();