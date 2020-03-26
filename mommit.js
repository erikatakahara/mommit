#!/usr/bin/env node

const commit = require('./commands/commit'),
    authors = require('./commands/authors');

commit(require('yargs')
    .scriptName('mommit')
    .usage('$0 [args] or $0 <cmd>')
    .command('add', 'add a new commiter', authors.add)
    .command('remove', 'remove a commiter', authors.remove)
    .command('list', 'list all commiters', authors.list)
    .option('m', {
        alias: 'message',
        describe: 'Use the given <msg> as the commit message. If multiple -m options are given, their values are concatenated as separate paragraphs.',
        type: 'array',
    })
    .option('a', {
        alias: 'all',
        describe: 'Tell the command to automatically stage files that have been modified and deleted, but new files you have not told Git about are not affected.',
        type: 'boolean',
    })
    .help()
    .argv);
