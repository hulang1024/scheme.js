﻿var loadScheme = function(rootdir, after) {
    rootdir = (rootdir || "");
    
    if(window['$LAB']) {
        load();
    } else {
        var s = document.createElement("script");
        s.src = rootdir + "./lib/LAB.min.js";
        s.onload = load;
        document.body.appendChild(s);
    }
    
    function load() {
        var jsArr = [
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
            "compiler/compiler",
            "lib/browserjs",
            "base/env",
            "lib/lib",
            "lib/lib.scm"].map(function(s){
                return rootdir + "./jsscheme/" + s + ".js?v=" + new Date().getMonth();
            });
        $LAB.setOptions({AlwaysPreserveOrder:true})
            .script(jsArr).wait(function(){
                scheme.initBasicEnv();
                scheme.makeGlobalEnv();
                
                $LAB.setOptions({AlwaysPreserveOrder:false});
                after && after();
            });
    }
}
