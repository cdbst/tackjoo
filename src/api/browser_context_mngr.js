
class BrowserContextManager{

    constructor(){
        this.add = this.add.bind(this);
        this.remove = this.remove.bind(this);
        this.get = this.get.bind(this);
        this.get_by_email = this.get_by_email.bind(this);
        this.get_file_data = this.get_file_data.bind(this);
        this.get_all_browser_contexts = this.get_all_browser_contexts.bind(this);
        this.get_all_logged_in_browser_contexts = this.get_all_logged_in_browser_contexts.bind(this);

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

    get_by_email(_email){
        for(const [key, browser_context] of Object.entries(this._browser_contexts_dict)){
            if(browser_context.email == _email) return browser_context;
        }
        return undefined;
    }

    get_all_browser_contexts(){

        let borwser_context_list = [];

        for (var key in this._browser_contexts_dict){
            borwser_context_list.push(this._browser_contexts_dict[key]);
        }
        return borwser_context_list;
    }

    get_all_logged_in_browser_contexts(){
        let borwser_context_list = this.get_all_browser_contexts();

        return borwser_context_list.filter((borwser_context) => {return borwser_context.is_login});
    }

    get_file_data(){
        
        let ids = Object.keys(this._browser_contexts_dict);

        let accounts_info = [];

        ids.forEach((id) =>{
            let browser_context = this._browser_contexts_dict[id];
            accounts_info.push({
                email : browser_context.email,
                pwd : browser_context.pwd,
                id : id
            });
        });

        return {
            'accounts' : accounts_info
        };
    }
}

module.exports.BrowserContextManager = new BrowserContextManager();