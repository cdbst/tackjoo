const fs = require('fs');
const path = require('path');
const Mutex = require('async-mutex').Mutex;
const si = require('systeminformation');
const jwt = require('jsonwebtoken');

class UserFileManager{

    constructor(){

        this.file_mutex = new Mutex();
        this.user_file_secret = '0e81956a-4f44-48c3-aacc-afa3292dd46e';

        const release = this.file_mutex.acquire();
        si.baseboard((data) =>{
            try{
                if(data.serial == undefined) return;
                this.user_file_secret = data.serial;
            }finally{
                release();
            }
        });
    }

    __read(path){
        return new Promise((resolve, reject) =>{
            fs.readFile(path, {encoding: 'utf8'}, (err, data) =>{
                if(err){
                    reject(err);
                }else{
                    resolve(data);
                }
            })
        });
    }

    async read(path){

        let release = undefined;

        try{
            release = await this.file_mutex.acquire();
            const raw_file_data = await this.__read(path);
            const decrypted_file_data = this.__decrypt_json(raw_file_data);
            return decrypted_file_data;
        }catch(err){
            return undefined;
        }finally{
            if(release !== undefined) release();
        }
        
    }

    __mkdir(dir_path){
        return new Promise((resolve, reject) =>{
            fs.mkdir(dir_path, {recursive : true}, (err, path)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(path);
                }
            })
        });
    }

    __write(path, data){
        return new Promise((resolve, reject) =>{
            fs.writeFile(path, data, (err)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(true);
                }
            });
        });
    }

    async write(path, data){

        let release = undefined;

        try{
            release = await this.file_mutex.acquire();

            if(fs.existsSync(path) == false){
                await this.__mkdir(path.dirname(path));
            }

            const encrypted_data = this.__encrypt_json(data);
            await this.__write(path, encrypted_data);

            return true;
        }catch(err){
            return false;
        }finally{
            if(release !== undefined) release();
        }
        
    }

    delete(_path){
        if(fs.existsSync(_path) == false) return false;

        try{
            fs.rmSync(_path);
            return true;
        }catch(err){
            return false;
        }
    }

    __encode_base64(_data){
        return Buffer.from(_data, "utf8").toString('base64');
    }
    
    __decode_base64(_data){
        return Buffer.from(_data, 'base64').toString('utf8');
    }

    __encrypt_json(_json_data){
        return jwt.sign(_json_data, this.user_file_secret);
    }

    __decrypt_json(_encrypt_data){
        return jwt.verify(_encrypt_data, this.user_file_secret);
    }
}

module.exports.UserFileManager = new UserFileManager();