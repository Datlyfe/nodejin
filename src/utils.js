import ejs from "ejs";
import prettier from "prettier";
import path from "path";
import fs from "fs";
import cpFile from "cp-file";
import { promisify } from "util";

const writeFile = promisify(fs.writeFile);
const renameFile = promisify(fs.rename);

export const copyFiles = async (files, tmpDir, targetDir) => {
  for (let i = 0, blocks = Object.keys(files); i < blocks.length; i++) {
    for (
      let j = 0, blockTemplates = files[blocks[i]];
      j < blockTemplates.length;
      j++
    ) {
      const blockTemplate = blockTemplates[j];
      console.log(blockTemplate);
      if (!blockTemplate.condition || blockTemplate.condition) {
        const root = blockTemplate.path || "";
        for (let k = 0; k < blockTemplate.templates.length; k++) {
          let file = blockTemplate.templates[k];
          let from = path.join(tmpDir, root, file);
          let to = path.join(targetDir, root, file);
          await cpFile(from, to, { overwrite: true });
        }
      }
    }
  }
};

export const compileFiles = async (files, options) => {
  for (let index = 0; index < files.length; index++) {
    let file = files[index];
    let isBabel = new RegExp(".js$").test(file.replace(".ejs", ""));
    let res = await compileEjs(file, options);
    res = prettier.format(res, { parser: isBabel ? "babel" : "json" });
    await writeFile(file, res, "utf8");
    await renameFile(file, file.replace(".ejs", ""));
  }
};

export const compileEjs = (filePath, options) => {
  return new Promise((resolve, reject) => {
    ejs.renderFile(filePath, options, (err, res) => {
      if (!err) {
        resolve(res);
      } else {
        reject(`Copying template ${filePath} failed. [${err}]`);
      }
    });
  });
};

export const getFilesByExt = (startPath, filter) => {
  return new Promise(async (resolve, reject) => {
    let results = [];

    if (!fs.existsSync(startPath)) {
      reject("no dir ", startPath);
      return;
    }

    let files = fs.readdirSync(startPath);
    for (let i = 0; i < files.length; i++) {
      let filename = path.join(startPath, files[i]);
      let stat = fs.lstatSync(filename);
      if (stat.isDirectory()) {
        results = results.concat(await getFilesByExt(filename, filter));
      } else if (filter.test(filename)) {
        results.push(filename);
      }
    }
    resolve(results);
  });
};
