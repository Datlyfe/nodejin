import chalk from "chalk";
import execa from "execa";
import fs from "fs";
import gitignore from "gitignore";
import Listr from "listr";
import path from "path";
import { projectInstall } from "pkg-install";
import license from "spdx-license-list/licenses/MIT";
import { promisify } from "util";
import { copyFiles, getFilesByExt, compileFiles } from "./utils";

const access = promisify(fs.access);
const writeFile = promisify(fs.writeFile);
const writeGitignore = promisify(gitignore.writeFile);

async function copyTemplateFiles(options) {
  const files = {
    root: [
      {
        templates: ["package.json.ejs", ".babelrc"]
      }
    ],
    src: [
      {
        path: "src",
        templates: ["index.js.ejs"]
      }
    ],
    graphql: [
      {
        path: "src",
        condition: options.gql,
        templates: ["graphql/resolvers.js", "graphql/schema.js"]
      }
    ]
  };

  try {
    await copyFiles(files, options.templateDirectory, options.targetDirectory);
  } catch (error) {
    console.log(error);
  }

  const uncompiledFiles = await getFilesByExt(
    options.targetDirectory,
    new RegExp(".ejs$")
  );

  try {
    await compileFiles(uncompiledFiles, options);
  } catch (error) {
    console.log(error);
  }

  await createGitignore(options);
  await createLicense(options);
}

async function createGitignore(options) {
  const file = fs.createWriteStream(
    path.join(options.targetDirectory, ".gitignore"),
    { flags: "a" }
  );
  return writeGitignore({
    type: "Node",
    file: file
  });
}

async function createLicense(options) {
  const targetPath = path.join(options.targetDirectory, "LICENSE");
  const licenseContent = license.licenseText
    .replace("<year>", new Date().getFullYear())
    .replace("<copyright holders>", `${options.name} (${options.email})`);
  return writeFile(targetPath, licenseContent, "utf8");
}

async function initGit(options) {
  const result = await execa("git", ["init"], {
    cwd: options.targetDirectory
  });
  if (result.failed) {
    return Promise.reject(new Error("Failed to initialize git"));
  }
  return;
}

export async function nodejin(options) {
  options = {
    ...options,
    targetDirectory:
      options.targetDirectory ||
      path.join(process.cwd(), `${options.template}-nodejin`),
    email: "<email>",
    name: "<name>"
  };

  const templateDir = path.resolve(__dirname, "../templates", options.template);
  options.templateDirectory = templateDir;

  try {
    await access(templateDir, fs.constants.R_OK);
  } catch (err) {
    console.error("%s Invalid template name", chalk.red.bold("ERROR"));
    process.exit(1);
  }

  const tasks = new Listr(
    [
      {
        title: "🚀\u0020 Copying files...",
        task: () => copyTemplateFiles(options)
      },
      {
        title: "Initialize git",
        task: () => initGit(options),
        enabled: () => options.git
      },
      {
        title: "📦\u0020 Installing dependencies...",
        task: () =>
          projectInstall({
            cwd: options.targetDirectory,
            prefer: options.pkgManager
          }),
        skip: () =>
          options.skipInstall ? "--skipInstall flag detected" : undefined
      }
    ],
    {
      exitOnError: false
    }
  );

  console.log(
    `%s 💡\u0020 Creating project in ${options.targetDirectory} folder`,
    chalk.yellow.bold("START")
  );
  await tasks.run();
  console.log("%s 🎉\u0020 Project is ready", chalk.green.bold("DONE"));
  return true;
}
