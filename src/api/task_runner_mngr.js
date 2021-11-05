
class TaskRunnerManager{

    constructor(){

        this._task_runner_dict = {};
    }

    add(task_runner){
        let duplicate = (task_runner.task_info._id in this._task_runner_dict);
        this._task_runner_dict[task_runner.task_info._id] = task_runner;
        return duplicate;
    }

    remove(_id){
        if(_id in this._task_runner_dict == false) return false;
        delete this._task_runner_dict[_id];
        return true;
    }

    get(_id){
        if(_id in this._task_runner_dict == false) return undefined;
        return this._task_runner_dict[_id];
    }

    get_all_task_runner(){

        let task_runner_list = [];

        for (var key in this._task_runner_dict){
            task_runner_list.push(this._task_runner_dict[key]);
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