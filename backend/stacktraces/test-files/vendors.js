
function toComment(sourceMap) {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64," + base64;
    return "/*# " + data + " */";
}


function updateLink (link, options, obj) {
    var css = obj.css;
    var sourceMap = obj.sourceMap;

    /*
        If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
        and there is no publicPath defined then lets turn convertToAbsoluteUrls
        on by default.  Otherwise default to the convertToAbsoluteUrls option
        directly
    */
    var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

    if (options.convertToAbsoluteUrls || autoFixUrls) {
        css = fixUrls(css);
    }

    if (sourceMap) {
        // http://stackoverflow.com/a/26603875
        css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
    }

    var blob = new Blob([css], { type: "text/css" });

    var oldSrc = link.href;

    link.href = URL.createObjectURL(blob);

    if(oldSrc) URL.revokeObjectURL(oldSrc);
}

function printSourceFileOrBundle(jsFilePath, sourceMapFilePath, sourceFileOrBundle, printer, mapOptions) {
    var bundle = sourceFileOrBundle.kind === 298 ? sourceFileOrBundle : void 0;
    var sourceFile = sourceFileOrBundle.kind === 297 ? sourceFileOrBundle : void 0;
    var sourceFiles = bundle ? bundle.sourceFiles : [sourceFile];
    var sourceMapGenerator;
    if (shouldEmitSourceMaps(mapOptions, sourceFileOrBundle)) {
        sourceMapGenerator = ts2.createSourceMapGenerator(host, ts2.getBaseFileName(ts2.normalizeSlashes(jsFilePath)), getSourceRoot(mapOptions), getSourceMapDirectory(mapOptions, jsFilePath, sourceFile), mapOptions);
    }
    if (bundle) {
        printer.writeBundle(bundle, writer, sourceMapGenerator);
    } else {
        printer.writeFile(sourceFile, writer, sourceMapGenerator);
    }
    if (sourceMapGenerator) {
        if (sourceMapDataList) {
            sourceMapDataList.push({
                inputSourceFileNames: sourceMapGenerator.getSources(),
                sourceMap: sourceMapGenerator.toJSON()
            });
        }
        var sourceMappingURL = getSourceMappingURL(mapOptions, sourceMapGenerator, jsFilePath, sourceMapFilePath, sourceFile);
        if (sourceMappingURL) {
            if (!writer.isAtStartOfLine())
                writer.rawWrite(newLine);
            writer.writeComment("//# sourceMappingURL=" + sourceMappingURL);
        }
        if (sourceMapFilePath) {
            var sourceMap = sourceMapGenerator.toString();
            ts2.writeFile(host, emitterDiagnostics, sourceMapFilePath, sourceMap, false, sourceFiles);
        }
    } else {
        writer.writeLine();
    }
    ts2.writeFile(host, emitterDiagnostics, jsFilePath, writer.getText(), !!compilerOptions.emitBOM, sourceFiles);
    writer.clear();
}
//# sourceMappingURL=main.8344d167.chunk.js.map