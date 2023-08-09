# ansi-color

The original [ansi-color](https://www.npmjs.com/package/ansi-color?activeTab=code) is 8 years old. It's being used by `@opentelemetry/sdk-node`, and unfortunately, `ansi-color` uses a deprecated octal character: `\033`. It's a single file, so why just patch it!

The fix is to replace `\033` with `\x1B`.

We replaced two instances of this bad character and the errors went away. 

The old stack trace looked like this:

```
next-js:dev:   x Legacy octal escape is not permitted in strict mode
next-js:dev:     ,-[/root/dev/highlight/node_modules/ansi-color/lib/ansi-color.js:34:1]
next-js:dev:  34 |   for(var i=0, attr; attr = color_attrs[i]; i++) {
next-js:dev:  35 |     ansi_str += "\033[" + ANSI_CODES[attr] + "m";
next-js:dev:  36 |   }
next-js:dev:  37 |   ansi_str += str + "\033[" + ANSI_CODES["off"] + "m";
next-js:dev:     :                      ^^
next-js:dev:  38 |   return ansi_str;
next-js:dev:  39 | };
next-js:dev:     `----
next-js:dev:
next-js:dev: Caused by:
next-js:dev:     Syntax Error
next-js:dev:
next-js:dev: Import trace for requested module:
next-js:dev: ../../node_modules/ansi-color/lib/ansi-color.js
next-js:dev: ../../node_modules/bufrw/annotated_buffer.js
next-js:dev: ../../node_modules/bufrw/interface.js
next-js:dev: ../../node_modules/bufrw/index.js
next-js:dev: ../../node_modules/thriftrw/index.js
next-js:dev: ../../node_modules/jaeger-client/dist/src/reporters/udp_sender.js
next-js:dev: ../../node_modules/@opentelemetry/exporter-jaeger/build/src/types.js
next-js:dev: ../../node_modules/@opentelemetry/exporter-jaeger/build/src/jaeger.js
next-js:dev: ../../node_modules/@opentelemetry/exporter-jaeger/build/src/index.js
next-js:dev: ../../node_modules/@opentelemetry/sdk-node/build/src/TracerProviderWithEnvExporter.js
next-js:dev: ../../node_modules/@opentelemetry/sdk-node/build/src/sdk.js
next-js:dev: ../../node_modules/@opentelemetry/sdk-node/build/src/index.js
next-js:dev: ../../sdk/highlight-node/dist/index.js
next-js:dev: ../../sdk/highlight-next/dist/index.js
next-js:dev: ./src/app/utils/highlight.config.ts
next-js:dev: ./src/app/api/app-directory-success/route.ts
```
