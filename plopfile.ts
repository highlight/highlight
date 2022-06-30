import { NodePlopAPI } from 'plop';

export default function (plop: NodePlopAPI) {
    // create your generators here
    plop.setGenerator('basics', {
        description: 'this is a skeleton plopfile',
        prompts: [], // array of inquirer prompts
        actions: [], // array of actions
    });
}
