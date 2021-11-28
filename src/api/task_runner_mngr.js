const Mutex = require('async-mutex').Mutex;

class TaskRunnerManager{

    constructor(){

        this.__task_runner_dict = {};
        this.__browser_context_mutex_dict = {};
    }

    async acquire_browser_context_mutex(browser_context_id){

        if(browser_context_id in this.__browser_context_mutex_dict == false){
            this.__browser_context_mutex_dict[browser_context_id] = {
                mutex : undefined,
                release : undefined
            };
            this.__browser_context_mutex_dict[browser_context_id].mutex = new Mutex();
        }

        const release = await this.__browser_context_mutex_dict[browser_context_id].mutex.acquire();
        this.__browser_context_mutex_dict[browser_context_id].release = release;
    }

    release_browser_context_mutex(browser_context_id){
        this.__browser_context_mutex_dict[browser_context_id].release();
    }

    async add(task_runner){
        this.__task_runner_dict[task_runner.task_info._id] = task_runner;
        await this.acquire_browser_context_mutex(task_runner.browser_context.id);
    }

    remove(_id){
        if(_id in this.__task_runner_dict == false) return false;
        this.release_browser_context_mutex(this.__task_runner_dict[_id].browser_context.id);
        delete this.__task_runner_dict[_id];
        return true;
    }

    get(_id){
        if(_id in this.__task_runner_dict == false) return undefined;
        return this.__task_runner_dict[_id];
    }

    get_all_task_runner(){

        let task_runner_list = [];

        for (var key in this.__task_runner_dict){
            task_runner_list.push(this.__task_runner_dict[key]);
        }
        return task_runner_list;
    }

    get_all_running_task_runner(){
        let task_runner_list = this.get_all_task_runner();
        return task_runner_list.filter((task_runner) => {return task_runner.running});
    }

}

let taskRunnerManager = new TaskRunnerManager();

module.exports.taskRunnerManager = taskRunnerManager;