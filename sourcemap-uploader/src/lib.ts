import { basename, join } from "path";
import { cwd } from "process";
import { readFileSync, statSync } from "fs";
import { globSync } from "glob";
import fetch from "cross-fetch";

const VERIFY_API_KEY_QUERY = `
  query ApiKeyToOrgID($api_key: String!) {
    api_key_to_org_id(api_key: $api_key)
  }
`;

const GET_SOURCE_MAP_URLS_QUERY = `
  query GetSourceMapUploadUrls($api_key: String!, $paths: [String!]!) {
    get_source_map_upload_urls(api_key: $api_key, paths: $paths)
  }
`;

export const uploadSourcemaps = async ({
  apiKey,
  appVersion,
  path,
  basePath,
  backendUrl,
  allowNoop,
}: {
  apiKey: string;
  appVersion: string;
  path: string;
  basePath?: string;
  backendUrl?: string;
  allowNoop?: boolean;
}) => {
  if (!apiKey || apiKey === "") {
    if (process.env.HIGHLIGHT_SOURCEMAP_UPLOAD_API_KEY) {
      apiKey = process.env.HIGHLIGHT_SOURCEMAP_UPLOAD_API_KEY;
    } else {
      throw new Error("api key cannot be empty");
    }
  }

  const backend = backendUrl || "https://pri.highlight.io";
  const variables = {
    api_key: apiKey,
  };

  const res = await fetch(backend, {
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

  const fileList = await getAllSourceMapFiles([path], { allowNoop });

  if (fileList.length === 0) {
    console.error(
      `Error: No source maps found in ${path}, is this the correct path?`
    );
    console.info("Failed to upload source maps. Please see reason above.");
    return;
  }

  const s3Keys = fileList.map(({ name }) =>
    getS3Key(organizationId, appVersion, basePath || "", name)
  );

  const urlRes = await fetch(backend, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: GET_SOURCE_MAP_URLS_QUERY,
      variables: {
        api_key: apiKey,
        paths: s3Keys,
      },
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
    !urlRes ||
    !urlRes.data ||
    !urlRes.data.get_source_map_upload_urls ||
    urlRes.data.get_source_map_upload_urls.length === 0
  ) {
    console.error("Error: Unable to generate source map upload urls.", urlRes);
    console.info("Failed to upload source maps. Please see reason above.");
    return;
  }

  const uploadUrls = urlRes.data.get_source_map_upload_urls;

  await Promise.all(
    fileList.map(({ path }, idx) => uploadFile(path, uploadUrls[idx]))
  );
};

async function getAllSourceMapFiles(
  paths: string[],
  { allowNoop }: { allowNoop?: boolean }
) {
  const map: { path: string; name: string }[] = [];

  await Promise.all(
    paths.map(async (path) => {
      const realPath = join(cwd(), path);

      if (statSync(realPath).isFile()) {
        map.push({
          path: realPath,
          name: basename(realPath),
        });

        return;
      }

      if (
        !allowNoop &&
        !globSync("**/*.js.map", {
          cwd: realPath,
          nodir: true,
          ignore: "**/node_modules/**/*",
        }).length
      ) {
        throw new Error(
          "No .js.map files found. Please double check that you have generated sourcemaps for your app."
        );
      }

      for (const file of globSync("**/*.js?(.map)", {
        cwd: realPath,
        nodir: true,
        ignore: "**/node_modules/**/*",
      })) {
        map.push({
          path: join(realPath, file),
          name: file,
        });
      }
    })
  );

  return map;
}

function getS3Key(
  organizationId: string,
  version: string,
  basePath: string,
  fileName: string
) {
  // Setting up S3 upload parameters
  if (version === null || version === undefined || version === "" || !version) {
    version = "unversioned";
  }
  return `${organizationId}/${version}/${basePath}${fileName}`;
}

async function uploadFile(filePath: string, uploadUrl: string) {
  const fileContent = readFileSync(filePath);
  await fetch(uploadUrl, { method: "put", body: fileContent });
  console.log(`Uploaded ${filePath}`);
}
