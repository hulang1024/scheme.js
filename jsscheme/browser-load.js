var loadScheme = function(rootdir, after) {
    loadJSSeq([
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
        "base/env",
        "lib/lib.scm"], after);

    function loadJSSeq(jsseq, after) {
        loadNextJS(0);
        function loadNextJS(index) {
            if(index > jsseq.length - 1) {
                //env
                scheme.initBasicEnv();
                scheme.makeGlobalEnv();
                
                after && after();
                return;
            }
            var s = document.createElement("script");
            s.src = (rootdir || "") + "./jsscheme/" + jsseq[index] + ".js?v=" + new Date().getMonth();
            s.onload = function() { loadNextJS(index + 1); }
            document.body.appendChild(s);
        }
    }
}
