#!/usr/bin/env node
const { join } = require("path");
const { cwd } = require("process");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { statSync, readFileSync } = require("fs");
const glob = require("glob");
const fetch = require("node-fetch");
var FormData = require("form-data");
var fs = require("fs");
const { ApolloClient } = require("apollo-client");
const { gql } = require("graphql-tag");
const { createUploadLink } = require("apollo-upload-client");
const { InMemoryCache } = require("apollo-cache-inmemory");

var pjson = require("./package.json");
console.log("Running version: ", pjson.version);

yargs(hideBin(process.argv))
  .command(
    "upload",
    "Upload Javascript sourcemaps to Highlight",
    () => {},
    async ({ apiKey, path }) => {
      console.info(`Starting to upload source maps from ${path}`);

      const fileList = await getAllSourceMapFiles([path]);

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

async function getAllSourceMapFiles(paths) {
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
            map.push({
              name: thePath,
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
  const client = new ApolloClient({
    fetch: fetch,
    cache: new InMemoryCache(),
    link: createUploadLink({
      fetch: fetch,
      uri: "http://localhost:8082/private",
      headers: { "Highlight-Demo": true },
    }),
  });
  const MUTATION = gql`
    mutation ($source_map_files: [Upload!]) {
      updateSourceMaps(api_key: $api_key, source_map_files: $source_map_files)
    }
  `;
  let source_map_files_list = [];
  for (let i = 0; i < fileList.length; i++) {
    const fileData = readFileSync(fileList[i].name);

    source_map_files_list.push(fileData);
  }
  const VARIABLES = {
    source_map_files: source_map_files_list,
    api_key: apiKey,
  };
  client.mutate({ mutation: MUTATION, variables: VARIABLES }).catch((err) => {
    console.log(err);
  });
}
