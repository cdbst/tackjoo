const fs = require('fs');
const path = require('path');
const Mutex = require('async-mutex').Mutex;

class UserFileManager{

    constructor(){
        this.read = this.read.bind(this);
        this.write = this.write.bind(this);
        this.__write = this.__write.bind(this);
        this.remove = this.remove.bind(this);
        this.exists = this.exists.bind(this);
        this.mkdir = this.mkdir.bind(this);
        this.__encode_base64 = this.__encode_base64.bind(this);
        this.__decode_base64 = this.__decode_base64.bind(this);

        this.file_mutex = new Mutex();
    }

    async read(_path, __callback){

        const release = await this.file_mutex.acquire();

        fs.readFile(_path, 'utf8', (err, data) => {

            release();

            if(err){
                __callback(err, undefined);
                return;
            }

            try{
                let decoded_data = this.__decode_base64(data);
                let data_obj = JSON.parse(decoded_data);
                __callback(undefined, data_obj);
                
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
        this.exists(parent_dir, async (err)=>{

            if(err){ // if not exists
                this.mkdir(parent_dir, async (err)=>{
                    if(err){
                        __callback(err);
                        return;
                    }
                    await this.__write(_path, _data, __callback)
                });
            }else{ // if exists
                await this.__write(_path, _data, __callback)
            }
        });

    }

    async __write(_path, _data, __callback){

        const data = JSON.stringify(_data);
        const encoded_data = this.__encode_base64(data);

        const release = await this.file_mutex.acquire();

        fs.writeFile(_path, encoded_data, (err) =>{ 
            release();
            __callback(err);
        });
    }

    __encode_base64(_data){
        return Buffer.from(_data, "utf8").toString('base64');
        
    }
    
    __decode_base64(_data){
        return Buffer.from(_data, 'base64').toString('utf8');
    }
}

module.exports.UserFileManager = UserFileManager;