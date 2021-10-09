const fs = require('fs');
const path = require('path');

class UserFileManager{

    constructor(){
        this.read = this.read.bind(this);
        this.write = this.write.bind(this);
        this.__write = this.__write.bind(this);
        this.remove = this.remove.bind(this);
        this.exists = this.exists.bind(this);
        this.mkdir = this.mkdir.bind(this);
    }

    read(_path, __callback){

        fs.readFile(_path, 'utf8', (err, data) => {

            if(err){
                __callback(err, undefined);
                return;
            }

            try{
                let accounts_info = JSON.parse(data);
                __callback(undefined, accounts_info);
                
            }catch(err){
                __callback(err, undefined);
            }
        });
    }

    remove(_path, __callback){

        fs.unlink(_path, (err) => {
            __callback(err);
        });
    }

    exists(_path, __callback){

        fs.access(_path, fs.F_OK, (err) => {
            __callback(err);
        });
    }

    mkdir(_dir_path, __callback){
        fs.mkdir (_dir_path, { recursive: true }, (err)=>{
            __callback(err);
        });
    }

    write(_path, _data, __callback = undefined){

        let parent_dir = path.dirname(_path);

        let write_wrapper = function(){
            this.__write(_path, _data, __callback);
        }
        write_wrapper = write_wrapper.bind(this);

        this.exists(parent_dir, (err)=>{

            if(err){ // if not exists
                this.mkdir(parent_dir, (err)=>{
                    if(err){
                        __callback(err);
                        return;
                    }
                    write_wrapper();
                });
            }else{ // if exists
                write_wrapper();
            }
        });

    }

    __write(_path, _data, __callback){

        const data = JSON.stringify(_data);

        fs.writeFile(_path, data, (err) =>{ 
            __callback(err);
        });
    }
}

module.exports.UserFileManager = UserFileManager;