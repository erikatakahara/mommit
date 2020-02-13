const inquirer = require('inquirer'),
    { exec } = require('child_process'),
    authors = require('./authors');

module.exports = async function(message) {
    const authorList = await authors.get();
    const prompts = [];
    if (!message) {
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
    await authors.default(answers.authors);
    const formattedAuthors = answers.authors.map(author => { return `-m "Co-authored-by: ${author.name} <${author.email}>"` }).join(' ');
    exec(`git commit -m "${message || answers.commit}" ${formattedAuthors}`, (err, stdout, stderr) => {
        console.log(`${stdout}`);
    });
};