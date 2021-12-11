const path = require('path');
const esbuild = require('esbuild');

bundle();

function bundle(){
    esbuild.build({
        entryPoints: ['app.js'],
        bundle: true,
        outfile: path.join('dist', 'app.min.js'),
        //outdir: 'dist',
        minify: true,
        platform: 'node',
        //target : 'node14.17.0',
        external: ['electron']
    }).catch((e) => {
        console.error(e);
        process.exit(1)
    });
}


