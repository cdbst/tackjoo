const path = require('path');
const fs = require('fs');

class FileCache{
    constructor(){
        this.__cache_dict = {};
    }

    cache(file_path){
        file_path = path.resolve(file_path);
        this.__cache_dict[file_path] = fs.readFileSync(file_path, { encoding: 'utf8' });
        return this.__cache_dict[file_path];
    }

    get(file_path){
        if(file_path in this.__cache_dict == false) return undefined;
        return this.__cache_dict[file_path];
    }

}

module.exports.FileCache = new FileCache();