# Source Maps Uploader

## Uploading source maps to Highlight

In your build pipeline, you will need to run the CLI tool. Here's how to run it:

```sh
npx @highlight-run/sourcemap-uploader upload --path="/path/to/sourcemaps"
```

You can also add this as an npm script

```json
// In package.json

{
  "scripts": {
    "upload-sourcemaps": "npx @highlight-run/sourcemap-uploader upload --path=\"/path/to/sourcemaps\""
  }
}
```

## Contributing

You can test your changes locally by running the following commands:

```sh
yarn build
node dist/index.js upload ...
```
