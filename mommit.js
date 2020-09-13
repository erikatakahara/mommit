#!/usr/bin/env node

const commit = require('./commands/commit'),
    authors = require('./commands/authors');

require('yargs')
    .scriptName('mommit')
    .usage('$0 [args] or $0 <cmd>')
    .command('add', 'add a new commiter', yargs => {
        return yargs
            .option('l', {
                alias: 'from-git-log',
                describe: 'Add users from git log',
                type: 'boolean'
            })
            .option('s', {
                alias: 'search-git-log',
                describe: 'Search and add a single user from git log',
                type: 'boolean'
            })
    }, authors.add)
    .command('remove', 'remove a commiter', authors.remove)
    .command('list', 'list all commiters', authors.list)
    .command('$0', 'Commit with co-authors', yargs => {
        return yargs
            .option('m', {
                alias: 'message',
                describe: 'Use the given <msg> as the commit message. If multiple -m options are given, their values are concatenated as separate paragraphs.',
                type: 'string',
            })
            .option('a', {
                alias: 'all',
                describe: 'Tell the command to automatically stage files that have been modified and deleted, but new files you have not told Git about are not affected.',
                type: 'boolean',
            })
            .option('j', {
                alias: 'jira',
                describe: 'Add JIRA code.',
                type: 'boolean',
            })
            .option('s', {
                alias: 'semantic',
                describe: 'Uses semantic release commit format.',
                type: 'boolean',
            })
            .option('d', {
                alias: 'dryrun',
                describe: 'run commit on dry-run',
                type: 'boolean',
            })
    }, commit)
    .help()
    .argv;
