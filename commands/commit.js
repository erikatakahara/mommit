const inquirer = require("inquirer"),
  { exec } = require("child_process"),
  authors = require("./authors");

module.exports = async function (opt) {
  const authorList = await authors.get();
  const prompts = [];
  if (opt.j) {
    prompts.push({
      type: "input",
      message: "Branch:",
      name: "branch",
    });
  }
  if (!opt.message) {
    prompts.push({
      type: "input",
      message: "Commit message:",
      name: "commit",
      validate: function (answer) {
        return answer.trim() === ""
          ? "You should write a message for your commit"
          : true;
      },
    });
  }
  prompts.push({
    type: "checkbox",
    message: "Select authors:",
    name: "authors",
    choices: authorList.map((author) => {
      return {
        name: author.name,
        value: author,
        checked: author.default,
      };
    }),
    validate: function (answer) {
      if (answer.length < 1) {
        return "You must choose at least one author.";
      }
      return true;
    },
  });
  const answers = await inquirer.prompt(prompts);
  await authors.default(answers.authors);

  let command = ["git commit"],
    message = answers.commit || opt.message,
    branch = answers.branch ? `[${answers.branch}] ` : ``,
    formattedAuthors = answers.authors
      .map((author) => `Co-authored-by: ${author.name} <${author.email}>`)
      .join("\\n");

  if (Array.isArray(message)) {
    message = message.map((m) => `${m}`).join("\\n");
  }

  if (opt.all) {
    command.push("-a");
  }
  command.push(`-m$'${branch}${message}\\n\\n${formattedAuthors}'`);

  exec(command.join(" "), (err, stdout, stderr) => {
    console.log(`${stdout}`);
  });
};
