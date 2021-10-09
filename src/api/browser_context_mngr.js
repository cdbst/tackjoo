
class BrowserContextManager{

    constructor(){
        this._browser_contexts_dict = {};
    }

    add(browser_context){
        let duplicate = (browser_context.id in this._browser_contexts_dict);
        this._browser_contexts_dict[browser_context.id] = browser_context;
        return duplicate;
    }

    remove(_id){
        if(_id in this._browser_contexts_dict == false) return false;
        delete this._browser_contexts_dict[_id];
        return true;
    }

    get(_id){
        if(_id in this._browser_contexts_dict == false) return undefined;
        return this._browser_contexts_dict[_id];
    }
}

let browserCxtMngr = new BrowserContextManager();

module.exports.browserCxtMngr = browserCxtMngr;