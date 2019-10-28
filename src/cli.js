import arg from "arg";
import inquirer from "inquirer";
import { nodejin } from "./main";

function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      "--git": Boolean,
      "--yes": Boolean,
      "--skipInstall": Boolean,
      "-g": "--git",
      "-y": "--yes",
      "-si": "--skipInstall"
    },
    {
      argv: rawArgs.slice(2)
    }
  );
  return {
    skipPrompts: args["--yes"] || false,
    git: args["--git"] || false,
    template: args._[0],
    gql: false,
    skipInstall: args["--skipInstall"] || false
  };
}

async function promptForMissingOptions(options) {
  const defaultTemplate = "express";
  if (options.skipPrompts) {
    return {
      ...options,
      template: options.template || defaultTemplate
    };
  }

  const questions = [];
  if (!options.template) {
    questions.push({
      type: "list",
      name: "template",
      message: "Please choose which project template to use",
      choices: ["express", "koa"],
      default: defaultTemplate
    });
  }

  if (!options.gql) {
    questions.push({
      type: "confirm",
      name: "graphql",
      message: "graphql integration?",
      default: false
    });
  }

  if (!options.git) {
    questions.push({
      type: "confirm",
      name: "git",
      message: "Initialize as a git repository?",
      default: false
    });
  }

  if (!options.skipInstall) {
    questions.push({
      type: "list",
      name: "pkgManager",
      message: "Which package manager you want to use?",
      choices: ["yarn", "npm"],
      default: "yarn"
    });
  }

  const answers = await inquirer.prompt(questions);
  return {
    ...options,
    template: options.template || answers.template,
    git: options.git || answers.git,
    gql: options.gql || answers.graphql,
    pkgManager: answers.pkgManager || "yarn"
  };
}

export async function cli(args) {
  let options = parseArgumentsIntoOptions(args);
  options = await promptForMissingOptions(options);
  await nodejin(options);
}
