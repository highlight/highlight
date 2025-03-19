# aws-lambda

This project serves as an example for a SAM Lambda app that can send data to highlight.

The Highlight project ID should be configured via an environment variable in the template.yaml

To run:

```bash
yarn build
yarn start
```

Invoke the API separately:

```bash
curl 'http://127.0.0.1:3000/'
curl -X POST 'http://127.0.0.1:3000/'
curl -X PUT 'http://127.0.0.1:3000/'
```
