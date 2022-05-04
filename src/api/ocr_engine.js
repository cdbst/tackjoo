const Tesseract  = require('tesseract.js');
const common = require('../common/common');
const log = require('electron-log');
const { app } = require('electron');
const path = require('path');

const { Semaphore } = require("async-mutex");

class OCREngine{
    constructor(){

        this.worker_cnt = 5;
        
        this.__scheduler = Tesseract.createScheduler();
        this.__worker_semaphore = new Semaphore(this.worker_cnt);

        const app_path = app.getAppPath();

        (async()=>{

            for(var i = 0; i < this.worker_cnt; i++){

                const worker = Tesseract.createWorker({
                    logger: (m) => {
                        log.warn(common.get_log_str('ocr_engine.js', 'tesseract-logger', m.status))
                    },
                    workerPath: path.join(app_path, 'tesseract', 'worker', 'worker.min.js')
                });
                await worker.load();
                await worker.loadLanguage('eng');
                await worker.initialize('eng');
                await worker.setParameters({
                    tessedit_char_whitelist: '0123456789',
                    preserve_interword_spaces: '0',
                });
    
                this.__scheduler.addWorker(worker);
            }
        })();
    }

    async get_text(image){

        let _release = undefined;
        
        try{
            const [_, release] = await this.__worker_semaphore.acquire();
            _release = release;
            const { data: { text } } = await this.__scheduler.addJob('recognize', image);
            return text;
        }finally{
            if(_release !== undefined) _release();
        }
    }
}

module.exports.OCREngine = new OCREngine();