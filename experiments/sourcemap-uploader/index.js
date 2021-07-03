#!/usr/bin/env node
const { join, basename } = require("path");
const { cwd } = require("process");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { statSync, readFileSync } = require("fs");
const glob = require("glob");
const AWS = require("aws-sdk");

const BUCKET_NAME = "source-maps-test";

// These secrets are for the "S3SourceMapUploaderTest" role.
const s3 = new AWS.S3({
  accessKeyId: "AKIASRAMI2JGSNAT247I",
  secretAccessKey: "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",
});

var pjson = require("./package.json");
console.log("Running version: ", pjson.version);

yargs(hideBin(process.argv))
  .command(
    "upload",
    "Upload Javascript sourcemaps to Highlight",
    () => {},
    async ({ organizationId, apiKey, version, path }) => {
      console.info(`Starting to upload source maps from ${path}`);

      const fileList = await getAllSourceMapFiles([path]);

      if (fileList.length === 0) {
        console.error(
          `Error: No source maps found in ${path}, is this the correct path?`
        );
        console.info("Failed to upload source maps. Please see reason above.");
        return;
      }

      await Promise.all(
        fileList.map(({ path, name }) =>
          uploadFile(organizationId, apiKey, version, path, name)
        )
      );
    }
  )
  .option("organizationId", {
    alias: "id",
    type: "string",
    describe: "The Highlight organization ID",
    default: "113",
  })
  .option("version", {
    alias: "v",
    type: "string",
    describe: "The current version of your deploy",
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
          path: realPath,
          name: basename(realPath),
        });

        return Promise.resolve();
      }

      return new Promise((resolve) => {
        glob("**/*.js?(.map)", { cwd: realPath }, async (err, files) => {
          for (const file of files) {
            map.push({
              path: join(realPath, file),
              name: file,
            });
          }

          resolve();
        });
      });
    })
  );

  return map;
}

async function uploadFile(organizationId, apiKey, version, filePath, fileName) {
  const fileContent = readFileSync(filePath);

  // Setting up S3 upload parameters
  const bucketPath = `${organizationId}/${version}/${fileName}`;
  const params = {
    Bucket: BUCKET_NAME,
    Key: bucketPath,
    Body: fileContent,
  };

  s3.upload(params, function (err, data) {
    if (err) {
      throw err;
    }
    console.log(`Uploaded ${fileName}`);
  });
}
