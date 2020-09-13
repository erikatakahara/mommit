# mommit

A simple way and visual way to add co-authors on your commit!

<image src="./images/mommit-commit.gif" alt="Mommit commit sample" height="300">

# Why mommit?

Because it's a pain to always write the co-authors following the [correct format](https://help.github.com/en/github/committing-changes-to-your-project/creating-a-commit-with-multiple-authors), so I made this simple `git commit` wrapper to be able to add co-authors with ease.

# Install globally

`npm install -g erikatakahara/mommit`

# Usage

1. If it's the first time you're commiting with the co-author, add them using `mommit add`.
1. Them call `mommit` command. Tip: `-m` and `-a` from git works here ;)
1. Select the co-author and you're done!

## mommit add

You have three ways to add an author to your mommit:

1. `mommit add` - manually add using the prompt
1. `mommit add -l` - select from a list of authors from git log
1. `mommit add -s` - search for a single author from git log

## mommit remove

If you want to remove an author from your list, just call `mommit remove` and select the ones you want to remove.

## mommit list

If you want to see which users are already added, just call `mommit list` to see which users are stored inside mommit.

## add jira code

If you want to add the JIRA code to your commit in the format `[<ticket-number>] <commit-message>`, create a branch starting with the ticket number and use the `-j` flag.  
Example: using the command `mommit -jam "Testing"` on the branch `MS-101-branch-description` will `git add` the files and create a commit on the format `[MS-101] Testing`.

## semantic release format

In case you use sematic release format, you can add `-s` flag.