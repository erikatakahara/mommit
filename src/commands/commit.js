/*eslint no-unused-vars: ["error", { "argsIgnorePattern": "^_" }]*/
const inquirer = require('inquirer'),
	{ exec } = require('child_process'),
	process = require('process'),
	authors = require('./authors');

let types = [
	'feat: A new feature',
	'fix: A bug fix',
	'docs: Documentation only changes',
	'style: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)',
	'refactor: A code change that neither fixes a bug nor adds a feature',
	'perf: A code change that improves performance',
	'test: Adding missing or correcting existing tests',
	'chore: Changes to the build process or auxiliary tools and libraries such as documentation generation',
];

async function getJiraCode() {
	let promise = new Promise((resolve) => {
		exec('git rev-parse --abbrev-ref HEAD', (stderr, stdout) => {
			let currentJiraCode = '';
			const branch = stdout.trim().split('-').splice(0, 2);
			if (branch[0] === branch[0].toUpperCase() && !isNaN(branch[1])) {
				currentJiraCode = branch.join('-');
			}
			resolve(stdout ? currentJiraCode : stderr);
		});
	});
	return promise.then((jiraCode) => jiraCode);
}

async function authorList() {
	const authorList = await authors.get();
	return {
		type: 'checkbox',
		message: 'Select authors:',
		name: 'authors',
		choices: authorList.map((author) => {
			return {
				name: author.name,
				value: author,
				checked: author.default,
			};
		}),
	};
}

async function semantic(opt) {
	const prompts = [],
		branch = await getJiraCode();
	prompts.push({
		type: 'list',
		message: 'Type:',
		name: 'type',
		choices: types,
		loop: false,
		filter: (type) => {
			return type.split(':')[0];
		},
	});

	prompts.push({
		type: 'input',
		message: 'Scope:',
		name: 'scope',
		default: branch,
		validate: function (answer) {
			return answer.trim() === ''
				? 'You should write a scope for your commit. The scope could be anything specifying place of the commit change. You can use * when the change affects more than a single scope.'
				: true;
		},
	});

	if (!opt.message) {
		prompts.push({
			type: 'input',
			message: 'Subject:',
			name: 'subject',
			validate: function (answer) {
				return answer.trim() === ''
					? 'You should write a subject for your commit'
					: true;
			},
		});
	}

	if (opt.body) {
		prompts.push({
			type: 'editor',
			message: 'Body:',
			name: 'body',
			validate: function (answer) {
				return answer.trim() === ''
					? 'You should add a description for your commit'
					: true;
			},
		});
	}

	prompts.push({
		type: 'boolean',
		message: 'Breaking change?',
		name: 'breakingChange',
		default: false,
	});

	prompts.push({
		type: 'editor',
		name: 'breakingChangeMessage',
		message: 'Breaking change message:',
		when: function (answers) {
			return answers.breakingChange;
		},
		validate: function (answer) {
			return answer.trim() === ''
				? 'You should explain the breaking change'
				: true;
		},
	});

	return {
		prompts,
		message: function (opt, answers) {
			let subject =
					answers.subject ??
					(Array.isArray(opt.message) ? opt.message[0] : opt.message),
				message = [];
			subject = subject.charAt(0).toLowerCase() + subject.slice(1);

			if (Array.isArray(opt.message)) {
				let message = opt.message
					.splice(0, 1)
					.map((m) => `${m}`)
					.join('\\n');
				subject = `${subject}\n\n${message}`;
			}
			message.push(`${answers.type}(${answers.scope}): ${subject}`);

			if (answers.body) {
				message.push(answers.body);
			}

			if (answers.breakingChange) {
				message.push(
					`BREAKING CHANGE: ${answers.breakingChangeMessage}`
				);
			}

			return message.join('\n\n');
		},
	};
}

async function simple(opt) {
	const prompts = [];
	if (opt.jira) {
		let branch = await getJiraCode();
		prompts.push({
			type: 'input',
			message: 'JIRA code:',
			name: 'branch',
			default: branch,
		});
	}

	if (!opt.message) {
		prompts.push({
			type: 'input',
			message: 'Commit message:',
			name: 'commit',
			validate: function (answer) {
				return answer.trim() === ''
					? 'You should write a message for your commit'
					: true;
			},
		});
	}

	if (opt.body) {
		prompts.push({
			type: 'editor',
			message: 'Body:',
			name: 'body',
			validate: function (answer) {
				return answer.trim() === ''
					? 'You should add a description for your commit'
					: true;
			},
		});
	}

	return {
		prompts,
		message: function (opt, answers) {
			let message = answers.commit || opt.message,
				branch = answers.branch ? `[${answers.branch}] ` : '',
				body = answers.body ? `\\n\\n${answers.body}` : '';

			if (Array.isArray(message)) {
				message = message.map((m) => `${m}`).join('\\n');
			}
			return `${branch}${message}${body}`;
		},
	};
}

module.exports = async function (opt) {
	const commitType = opt.semantic ? await semantic(opt) : await simple(opt),
		prompts = commitType.prompts;

	prompts.push(await authorList());
	const answers = await inquirer.prompt(prompts);
	await authors.default(answers.authors);

	let command = ['git commit'],
		formattedAuthors = answers.authors
			.map((author) => `Co-authored-by: ${author.name} <${author.email}>`)
			.join('\\n'),
		message = commitType.message(opt, answers);
	if (formattedAuthors) {
		message += `\\n\\n${formattedAuthors}`;
	}

	if (opt.all) {
		command.push('-a');
	}

	if (opt.dryrun) {
		command.push('--dry-run');
	}
	command.push(`-m$'${message}'`);

	const commandExec = exec(command.join(' '));
	commandExec.stdout.pipe(process.stdout);
	commandExec.stdin.pipe(process.stdin);
	commandExec.stderr.pipe(process.stderr);
};
