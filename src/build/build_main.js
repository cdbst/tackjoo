const esbuild = require('esbuild');

function bundle(){
    esbuild.build({
        entryPoints: ['app.js', 'task.js'],
        bundle: true,
        outdir: 'dist',
        minify: true,
        platform: 'node',
        //target : 'node14.17.0',
        external: ['electron']
    }).catch((e) => {
        console.error(e);
        process.exit(1)
    });
}


module.exports.bundle = bundle;