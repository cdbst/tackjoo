
class BrowserContextManager{

    constructor(){
        this.add = this.add.bind(this);
        this.remove = this.remove.bind(this);
        this.get = this.get.bind(this);
        this.get_file_data = this.get_file_data.bind(this);
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

    get_file_data(){
        
        let ids = Object.keys(this._browser_contexts_dict);

        let accounts_info = [];

        ids.forEach((id) =>{
            let browser_context = this._browser_contexts_dict[id];
            accounts_info.push({
                email : browser_context.email,
                pwd : browser_context.pwd
            });
        });

        return {
            'accounts' : accounts_info
        };
    }
}

let browserCxtMngr = new BrowserContextManager();

module.exports.browserCxtMngr = browserCxtMngr;