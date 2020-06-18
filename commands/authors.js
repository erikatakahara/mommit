const fs = require('fs').promises,
    homedir = require('os').homedir(),
    mommitFile = `${homedir}/.mommit`,
    inquirer = require('inquirer'),
    { exec } = require('child_process');

const get = async () => {
    try {
        let authors = await fs.readFile(`${homedir}/.mommit`);
        return JSON.parse(authors);
    } catch (e) {
        return [];
    }
};

const formatAuthor = (name, email) => {
    return { name: name, email: email }
};

const dedup = async (stored, added) => {
    for (let i = 0; i < added.length; i++) {
        const newAuthor = added[i];
        let idx = stored.findIndex(storedAuthor => storedAuthor.email === newAuthor.email);
        if (idx > -1) {
            if (stored[idx].name === newAuthor.name) continue;
            const readd = await inquirer.prompt({
                type: 'confirm',
                message: `You already have ${newAuthor.email} added with name "${stored[idx].name}", do you want to update with the new name "${newAuthor.name}"?`,
                name: 'confirm'
            });
            if (readd.confirm) stored[idx] = newAuthor;
        } else {
            stored.push(newAuthor);
        }
    }
    return stored;
};

const add = async (opt) => {
    if (opt.l) {
        exec('git --no-pager shortlog master --summary --numbered --email', async (err, stdout) => {
            if (err) console.err('Failed to execute git command');
            let usersFromLog = stdout.split('\n')
                .map(entry => entry.match(/\t([^>]+)\s+<([^>]+)>/))
                .filter(entry => entry)
                .map(([_, name, email]) => { return formatAuthor(name, email)})
                .sort((a1, a2) => { return a1.name.toUpperCase() < a2.name.toUpperCase()? -1 : 1});
            const { authors } = await inquirer.prompt({
                type: 'checkbox',
                message: 'Select authors to add:',
                name: 'authors',
                choices: usersFromLog.map(author => {
                    return { name: `${author.name} <${author.email}>`, value: author };
                })
            });
            const storedAuthors = await get();
            fs.writeFile(mommitFile, JSON.stringify(await dedup(storedAuthors, authors)), { flag: 'w' });
        });
    } else {
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
            authors.push(formatAuthor(answer.name, answer.email));
            await fs.writeFile(mommitFile, JSON.stringify(authors), { flag: 'w' });
    }
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