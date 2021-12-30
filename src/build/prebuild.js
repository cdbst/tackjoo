const fs = require('fs');
const path = require('path');

const package_files = [
    'font.css',
    'index.css',
    'signin.css',
    'update.css',
    'update.js',
    'update.html',
    'package.json',
    'package-lock.json'
];

const package_dirs = [
    'common',
    'lib',
    'node_modules',
    'res'
];

const cleanup_files = [
    'index.min.js',
    'app.js',
    'task.js',
    'preload.js'
]

const cleanup_dirs = [
    'package',
    'dist'
]

function prebuild(){
    cleanup();
    update_package_json_version()
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

    cleanup_dirs.forEach((dir) =>{
        const __path = path.join('dist', dir);
        if(fs.existsSync(__path)){
            fs.rmSync(__path, { recursive: true, force: true });
        }
    });

    cleanup_files.forEach((file) =>{
        const __path = path.join('dist', file);
        if(fs.existsSync(__path)){
            fs.unlinkSync(__path);
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

function update_package_json_version(){

    if(process.env.BUILD_VER === undefined) return;

    const package_json_path = path.resolve(path.join(__dirname, '..', 'package.json'));

    const package_json_data = fs.readFileSync(package_json_path, { encoding: 'utf-8'});
    const package_json_obj = JSON.parse(package_json_data);
    package_json_obj.version = process.env.BUILD_VER;
    fs.writeFileSync(package_json_path, JSON.stringify(package_json_obj, null, 2));
}

module.exports.prebuild = prebuild;