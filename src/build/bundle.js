const prebuild = require('./prebuild').prebuild;
const build_main = require('./build_main');
const build_renderer = require('./build_renderer');
const build_electron = require('./build_electron');

(async()=>{
    console.log('#step1 > waiting for prebuild..');
    prebuild();
    console.log('#step2 > waiting for bundling main process source codes..');
    build_main.bundle();
    console.log('#step3 > waiting for bundling renderer process source codes..');
    build_renderer.bundle();
    console.log('#step4 > waiting for bundling electron package..');
    await build_electron.bundle();
})();