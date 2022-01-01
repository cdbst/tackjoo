const Tesseract  = require('tesseract.js');

class OCREngine{
    constructor(){
        this.worker = Tesseract.createWorker();

        (async()=>{
            await this.worker.load();
            await this.worker.loadLanguage('eng');
            await this.worker.initialize('eng');
            await this.worker.setParameters({
                tessedit_char_whitelist: '0123456789',
                preserve_interword_spaces: '0',
            });
        })();
    }

    async get_text(image){
        const { data: { text } } = await this.worker.recognize(image);
        return text;
    }
}

module.exports.OCREngine = new OCREngine();