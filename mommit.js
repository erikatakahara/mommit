#!/usr/env/bin node

const commit = require('./commands/commit'),
    authors = require('./commands/authors'),
    args = process.argv.splice(2);

async function start() {
    if (!args.length) {
        commit();
    } else if (args[0] === 'add') {
        authors.add();
    } else if (args[0] === 'remove') {
        authors.remove();
    } else if (args[0] === '-h' || args[0] === 'help') {
        console.log(`Usage:
        mommit "Commit message" | add | delete

        add     - Add new author
        remove  - Remove author(s)`)
    } else {
        commit(args[0]);
    }
}
start();
