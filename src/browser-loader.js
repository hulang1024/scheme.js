﻿var loadScheme = function(rootdir, onLoad) {
    rootdir = (rootdir || "") + "src/";
    var jss = [
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
        "lib/browserjs",
        "lib/box-pointer",
        "lib/lib",
        "base/env"];
    var count = 0;

    loadNext();

    function loadNext() {
        if(count == jss.length) {
            scheme.initBasicEnv();
            scheme.makeGlobalEnv();
                
            onLoad && onLoad();

            return;
        }

        var script = document.createElement("script");
        script.src = rootdir + jss[count++] + ".js";
        script.onload = loadNext;
        document.body.appendChild(script);
    }
}
