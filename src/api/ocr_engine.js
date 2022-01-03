const Tesseract  = require('tesseract.js');
const common = require('../common/common');
const log = require('electron-log');

class OCREngine{
    constructor(){
        
        this.__scheduler = Tesseract.createScheduler();

        (async()=>{
            const worker = Tesseract.createWorker({
                logger: (m) => {
                    log.warn(common.get_log_str('ocr_engine.js', 'tesseract-logger', m.status))
                }
            });
            await worker.load();
            await worker.loadLanguage('eng');
            await worker.initialize('eng');
            await worker.setParameters({
                tessedit_char_whitelist: '0123456789',
                preserve_interword_spaces: '0',
            });

            this.__scheduler.addWorker(worker);
        })();
    }

    async get_text(image){
        const { data: { text } } = await this.__scheduler.addJob('recognize', image);
        return text;
    }
}

module.exports.OCREngine = new OCREngine();