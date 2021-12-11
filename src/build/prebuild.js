const fs = require('fs');
const path = require('path');

const package_files = [
    'index.css',
    'package.json',
    'package-lock.json',
    'preload.js',
    'task.js'
];

const package_dirs = [
    'akam',
    'common',
    'lib',
    'node_modules',
    'res',
];

function prebuild(){
    cleanup();
    copy_package_files();
}

function cleanup(){

    package_files.forEach((file) =>{
        const __path = path.join('dist', file);
        if(fs.existsSync(__path)){
            fs.unlinkSync(__path);
        }
    });

    package_dirs.forEach((dir) =>{
        const __path = path.join('dist', dir);
        if(fs.existsSync(__path)){
            fs.rmSync(__path, { recursive: true, force: true });
        }
    });
}

function copy_package_files(){
    package_files.forEach((file) =>{
        copyFileSync(file, path.join('dist', file));
    });

    package_dirs.forEach((dir) =>{
        copyFolderRecursiveSync(dir, path.join('dist'));
    });
}

function copyFileSync( source, target ) {

    var targetFile = target;

    // If target is a directory, a new file with the same name will be created
    if ( fs.existsSync( target ) ) {
        if ( fs.lstatSync( target ).isDirectory() ) {
            targetFile = path.join( target, path.basename( source ) );
        }
    }

    fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync( source, target ) {
    var files = [];

    // Check if folder needs to be created or integrated
    var targetFolder = path.join( target, path.basename( source ) );
    if ( !fs.existsSync( targetFolder ) ) {
        fs.mkdirSync( targetFolder );
    }

    // Copy
    if ( fs.lstatSync( source ).isDirectory() ) {
        files = fs.readdirSync( source );
        files.forEach( function ( file ) {
            var curSource = path.join( source, file );
            if ( fs.lstatSync( curSource ).isDirectory() ) {
                copyFolderRecursiveSync( curSource, targetFolder );
            } else {
                copyFileSync( curSource, targetFolder );
            }
        } );
    }
}

module.exports.prebuild = prebuild;