const fs = require('fs').promises,
    homedir = require('os').homedir(),
    mommitFile = `${homedir}/.mommit`,
    inquirer = require('inquirer');

const get = async () => {
    try {
        let authors = await fs.readFile(`${homedir}/.mommit`);
        return JSON.parse(authors);
    } catch (e) {
        return [];
    }
};

const add = async () => {
    const answer = await inquirer.prompt([{
        type: 'input',
        message: 'Author name:',
        name: 'name',
        validate: function(answer) {
            return answer.trim() === ''? 'You should answer with your friend name =(' : true;
        }
    },
    {
        type: 'input',
        message: 'Author e-mail:',
        name: 'email',
        validate: function(answer) {
            return answer.trim() === ''? 'You should input a valid e-mail' : true;
        }
    }]);

    const authors = await get();
    authors.push({
        name: answer.name,
        email: answer.email,
    });
    await fs.writeFile(mommitFile, JSON.stringify(authors), { flag: 'w' });
};

const remove = async () => {
    const authors = await get();
    const answers = await inquirer.prompt({
        type: 'checkbox',
        message: 'Select authors to remove:',
        name: 'authors',
        choices: authors.map(author => {
            return { name: `${author.name} <${author.email}>`, value: author.name };
        })
    });
    const newList = authors.filter(author => { return !answers.authors.includes(author.name) });
    await fs.writeFile(mommitFile, JSON.stringify(newList), { flag: 'w' });
};

const defaultAuthors = async (selectedAuthors) => {
    let authors = await get();
    authors = authors.map(author => {
        author.default = selectedAuthors.filter(a => { return a.name === author.name }).length > 0;
        return author;
    });
    await fs.writeFile(mommitFile, JSON.stringify(authors), { flag: 'w' });
};

const list = async () => {
    const authors = await get();
    console.table(authors);
};

module.exports = {
    add: add,
    get: get,
    default: defaultAuthors,
    list: list,
    remove: remove
}