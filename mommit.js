#!/usr/bin/env node

const commit = require('./commands/commit'),
    authors = require('./commands/authors'),
    args = process.argv.splice(2);

async function start() {
    if (!args.length) {
        await commit();
    } else if (args[0] === 'add') {
        authors.add();
    } else if (args[0] === 'remove') {
        await authors.remove();
    } else if (args[0] === 'list') {
        await authors.list()
    } else if (args[0] === '-h' || args[0] === 'help') {
        console.log(`Usage:
        mommit "Commit message" | add | remove | list

        add     - Add new author
        remove  - Remove author(s)
        list    - List stored authors`)
    } else {
        await commit(args[0]);
    }
}
start();
