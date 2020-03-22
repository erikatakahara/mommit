const inquirer = require('inquirer'),
    { exec } = require('child_process'),
    authors = require('./authors');

module.exports = async function(opt) {
    const authorList = await authors.get();
    const prompts = [];
    if (!opt.message) {
        prompts.push({
            type: 'input',
            message: 'Commit message:',
            name: 'commit',
            validate: function(answer) {
                return answer.trim() === ''? 'You should write a message for your commit' : true;
            }
        })
    }
    prompts.push({
        type: 'checkbox',
        message: 'Select authors:',
        name: 'authors',
        choices: authorList.map(author => {
            return {
                name: author.name,
                value: author,
                checked: author.default
            };
        }),
        validate: function(answer) {
            if (answer.length < 1) {
                return 'You must choose at least one author.';
            }
            return true;
        }
    });
    const answers = await inquirer.prompt(prompts);

    let command = ['git commit'];

    if (opt.all) {
        command.push('-a');
    }

    if (opt.message) {
        command = command.concat(opt.message.map(message => `-m "${message}"`));
    } else {
        command.push(`-m "${answers.commit}"`);
    }

    await authors.default(answers.authors);
    command = command.concat(answers.authors.map(author => `-m "Co-authored-by: ${author.name} <${author.email}>"`));

    exec(command.join(' '), (err, stdout, stderr) => {
        console.log(`${stdout}`);
    });
};