const esbuild = require('esbuild');

async function bundle(){
    
    try{
        await esbuild.build({
            entryPoints: ['app.js', 'task.js', 'preload.js'],
            bundle: true,
            outdir: 'dist',
            minify: true,
            platform: 'node',
            //target : 'node14.17.0',
            external: ['electron']
        });
        return true;
    }catch(err){
        console.error(err);
        return false;
    }
}


module.exports.bundle = bundle;