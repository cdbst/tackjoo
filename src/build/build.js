const prebuild = require('./prebuild').prebuild;
const build_main = require('./build_main');
const build_renderer = require('./build_renderer');
//const build_electron = require('./build_electron');
const build_electron_v2 = require('./build_electron_v2');

(async()=>{
    console.log('#step1 > waiting for prebuild..');
    prebuild();

    console.log('#step2 > waiting for bundling main process source codes..');
    build_main.bundle();

    console.log('#step3 > waiting for bundling renderer process source codes..');
    build_renderer.bundle();

    console.log('#step4 > waiting for bundling electron package..');
    const outputs = await build_electron_v2.build();
    //const outputs = await build_electron.bundle();
    if(outputs == undefined){
        console.log('# build fail !!');
        process.exit(1);
    }

    console.log('# build complete !!');
})();