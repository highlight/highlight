import { program } from "commander";
import { uploadSourcemaps } from "./lib.js";

program
  .name("@highlight-run/sourcemap-uploader")
  .description("Upload Javascript sourcemaps to Highlight");

program
  .command("upload")
  .option("-k, --apiKey <string>", "The Highlight api key")
  .option("-av, --appVersion <string>", "The current version of your deploy")
  .option(
    "-p, --path <string>",
    "Sets the directory of where the sourcemaps are"
  )
  .option(
    "-bp, --basePath",
    "An optional base path for the uploaded sourcemaps",
    ""
  )
  .action(uploadSourcemaps);

program.parse();
