#!/usr/bin/env node
const { join, basename } = require("path");
const { cwd } = require("process");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { statSync, readFileSync } = require("fs");
const glob = require("glob");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

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
    async ({ organizationId, apiKey, path, version }) => {
      console.info(`Starting to upload source maps from ${path}`);

      const fileList = await getAllSourceMapFiles([path]);

      if (fileList.length === 0) {
        console.error(
          `Error: No source maps found in ${path}, is this the correct path?`
        );
        console.info("Failed to upload source maps. Please see reason above.");
        return;
      }

      if (!version) {
        version = uuidv4();
        console.info(
          `The version was not provided, Highlight will generate a hash for you: ${version}`
        );
      }

      await Promise.all(
        fileList.map(({ path, name }) =>
          uploadFile(organizationId, apiKey, path, name, version)
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
  .option("version", {
    alias: "v",
    type: "string",
    default: "",
    describe:
      "The version of this build. This is typically a semantic version or Git hash.",
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

async function uploadFile(organizationId, apiKey, filePath, fileName, version) {
  const query = `query UploadSourceMap($apiKey: String!, $file: Upload!) {
			uploadSourceMap(apiKey: $apiKey, file: $file)
	      }`;
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
