#!/usr/bin/env node
const { join } = require("path");
const { cwd } = require("process");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { statSync, readFileSync } = require("fs");
const glob = require("glob");
const fetch = require("node-fetch");
var FormData = require('form-data');
var fs = require('fs');


var pjson = require("./package.json");
console.log("Running version: ", pjson.version);

yargs(hideBin(process.argv))
  .command(
    "upload",
    "Upload Javascript sourcemaps to Highlight",
    () => {},
    async ({ apiKey, path }) => {
      console.info(`Starting to upload source maps from ${path}`);

      const fileList = await getAllSourceMapFiles(cwd()+path, [path]);

      if (fileList.length === 0) {
        console.error(
          `Error: No source maps found in ${path}, is this the correct path?`
        );
        console.info("Failed to upload source maps. Please see reason above.");
        return;
      }

      uploadFiles(apiKey, fileList);
    }
  )
  .option("organizationId", {
    alias: "id",
    type: "string",
    describe: "The Highlight organization ID",
    default: "113",
  })
  .option("apiKey", {
    alias: "k",
    type: "string",
    describe: "The Highlight API key",
  })
  .option("path", {
    alias: "p",
    type: "string",
    default: "/build",
    describe: "Sets the directory of where the sourcemaps are",
  })
  .help("help").argv;

async function getAllSourceMapFiles(basePath, paths) {
  const map = [];

  await Promise.all(
    paths.map((path) => {
      const realPath = join(cwd(), path);

      if (statSync(realPath).isFile()) {
        map.push({
          name: realPath,
        });

        return Promise.resolve();
      }

      return new Promise((resolve) => {
        glob("**/*.js?(.map)", { cwd: realPath }, async (err, files) => {
          for (const file of files) {
            const thePath = join(realPath, file);
            const relPath = "."+ thePath.substring(thePath.indexOf(basePath)+basePath.length)

            map.push({
              name: relPath,
              content: readFileSync(thePath),
            });
          }

          resolve();
        });
      });
    })
  );
  return map;
}

async function uploadFiles(apiKey, fileList) {
  const query = `mutation($api_key: String!, $source_map_files: [Upload!]) { updateSourceMaps(api_key: $api_key, source_map_files: $source_map_files)}`;
  let source_map_files_map = {};
  let source_map_files_list = [];
  for (let i = 0; i < fileList.length; i++) {
    source_map_files_map[i] = [`variables.source_map_files.${i}`]
    source_map_files_list.push(null);
  }
  const operation = {
    query,
    variables: {
      api_key: apiKey,
      source_map_files: source_map_files_list
    }
  };

  const body = new FormData();
  body.append('operations', JSON.stringify(operation));
  body.append('map', JSON.stringify(source_map_files_map));
  for (let i = 0; i < fileList.length; i++) {
    body.append(`${i}`, "@"+fileList[i].name);
  }
  
  console.log(JSON.stringify(body))
  fetch("http://localhost:8082/private", {
    method: "POST",
    headers: {
      "Highlight-Demo": "true",
    },
    body: body,
  })
  .then(res => console.log(res));
}
