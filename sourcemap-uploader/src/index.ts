#!/usr/bin/env node
import { basename, join } from "path";
import { cwd } from "process";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { readFileSync, statSync } from "fs";
import glob from "glob";
import AWS from "aws-sdk";
import fetch from "node-fetch";

const VERIFY_API_KEY_QUERY = `
  query ApiKeyToOrgID($api_key: String!) {
    api_key_to_org_id(api_key: $api_key)
  }
`;

const BUCKET_NAME = "source-maps-test";

// These secrets are for the "S3SourceMapUploaderTest" role.
const s3 = new AWS.S3({
  accessKeyId: "AKIASRAMI2JGSNAT247I",
  secretAccessKey: "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",
});

export const uploadSourcemaps = async ({
  apiKey,
  appVersion,
  path,
}: {
  apiKey: string;
  appVersion: string;
  path: string;
}) => {
  if (!apiKey || apiKey === "") {
    if (process.env.HIGHLIGHT_SOURCEMAP_UPLOAD_API_KEY) {
      apiKey = process.env.HIGHLIGHT_SOURCEMAP_UPLOAD_API_KEY;
    } else {
      throw new Error("api key cannot be empty");
    }
  }

  const variables = {
    api_key: apiKey,
  };

  const res = await fetch("https://pri.highlight.run", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      ApiKey: apiKey,
    },
    body: JSON.stringify({
      query: VERIFY_API_KEY_QUERY,
      variables: variables,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((e) => {
      console.log(e);
    });

  if (
    !res ||
    !res.data ||
    !res.data.api_key_to_org_id ||
    res.data.api_key_to_org_id === "0"
  ) {
    throw new Error("invalid api key");
  }

  let organizationId = res.data.api_key_to_org_id;

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
      uploadFile(organizationId, appVersion, path, name)
    )
  );
};

yargs(hideBin(process.argv))
  .command(
    "upload",
    "Upload Javascript sourcemaps to Highlight",
    {},
    // @ts-ignore-error
    uploadSourcemaps
  )
  .option("apiKey", {
    alias: "k",
    type: "string",
    describe: "The Highlight api key",
  })
  .option("appVersion", {
    alias: "av",
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

async function getAllSourceMapFiles(paths: string[]) {
  const map: { path: string; name: string }[] = [];

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

      return new Promise<void>((resolve) => {
        glob(
          "**/*.js?(.map)",
          { cwd: realPath, nodir: true, ignore: "**/node_modules/**/*" },
          async (err, files) => {
            for (const file of files) {
              map.push({
                path: join(realPath, file),
                name: file,
              });
            }

            resolve();
          }
        );
      });
    })
  );

  return map;
}

async function uploadFile(
  organizationId: string,
  version: string,
  filePath: string,
  fileName: string
) {
  const fileContent = readFileSync(filePath);

  // Setting up S3 upload parameters
  if (version === null || version === undefined || version === "" || !version) {
    version = "unversioned";
  }
  const bucketPath = `${organizationId}/${version}/${fileName}`;

  const params = {
    Bucket: BUCKET_NAME,
    Key: bucketPath,
    Body: fileContent,
  };

  s3.upload(params, function (err: Error) {
    if (err) {
      throw err;
    }
    console.log(`Uploaded ${fileName}`);
  });
}
