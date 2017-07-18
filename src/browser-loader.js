﻿var loadScheme = function(rootdir, onLoad, progress) {
    rootdir = (rootdir || "") + "src/";
    var jsfiles = [
        "base/object",
        "base/read",
        "base/print",
        "base/error",
        "base/bool",
        "base/symbol",
        "base/number",
        "base/numcomp",
        "base/numarith",
        "base/numstr",
        "base/char",
        "base/string",
        "base/list",
        "base/vector",
        "base/fun",
        "base/syntax",
        "base/eval",
        "base/compiler",
        "lib/browserjs",
        "lib/box-pointer",
        "lib/lib",
        "base/env"];
    var count = 0;

    loadNext();

    function loadNext() {
        progress && progress(count, jsfiles.length);
        
        if(count == jsfiles.length) {
            scheme.initBasicEnv();
            scheme.makeGlobalEnv();
                
            onLoad();

            return;
        }

        var script = document.createElement("script");
        script.src = rootdir + jsfiles[count++] + ".js";
        script.onload = loadNext;
        document.body.appendChild(script);
    }
}
