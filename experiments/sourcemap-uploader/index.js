#!/usr/bin/env node
const { join, basename } = require("path");
const { cwd } = require("process");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { statSync, readFileSync } = require("fs");
const glob = require("glob");
const AWS = require("aws-sdk");

const SERVER_URL = "http://localhost:5000";
const BUCKET_NAME = "source-maps-test";

// These secrets are for the "S3SourceMapUploaderTest" role.
const s3 = new AWS.S3({
  accessKeyId: "AKIASRAMI2JGSNAT247I",
  secretAccessKey: "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",
});

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

      await Promise.all(
        fileList.map(({ path, name }) => uploadFile(apiKey, path, name))
      );
    }
  )
  .option("apiKey", {
    alias: "k",
    type: "string",
    describe: "The API Key for your Highlight workspace.",
    //     demand:
    //       "You must specify an API key, you can find this on https://highlight.run/settings. Use --apiKey",
    default: "",
  })
  .option("path", {
    alias: "p",
    type: "string",
    default: "/build/static/js",
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
        glob("**/*.js.map", { cwd: realPath }, async (err, files) => {
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

async function uploadFile(apiKey, filePath, fileName) {
  const query = `query UploadSourceMap($apiKey: String!, $file: Upload!) {
			uploadSourceMap(apiKey: $apiKey, file: $file)
	      }`;
  const fileContent = readFileSync(filePath);

  // Setting up S3 upload parameters
  const params = {
    Bucket: BUCKET_NAME,
    Key: `${fileName}`,
    Body: fileContent,
  };

  s3.upload(params, function (err, data) {
    if (err) {
      throw err;
    }
    console.log(`Uploaded ${fileName}`);
  });

  //   fetch("/graphql", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Accept: "application/json",
  //     },
  //     body: JSON.stringify({
  //       query,
  //       variables: {
  //         apiKey,
  //         file,
  //       },
  //     }),
  //   });
}

function getS3Path() {
  return ``;
}
