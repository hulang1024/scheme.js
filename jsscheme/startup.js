function loadSchemeKernelJS(after) {
    loadJSSeq([
        "jsscheme/object",
        "jsscheme/read",
        "jsscheme/print",
        "jsscheme/env",
        "jsscheme/error",
        "jsscheme/bool",
        "jsscheme/symbol",
        "jsscheme/number",
        "jsscheme/numcomp",
        "jsscheme/numarith",
        "jsscheme/numstr",
        "jsscheme/char",
        "jsscheme/string",
        "jsscheme/list",
        "jsscheme/vector",
        "jsscheme/fun",
        "jsscheme/syntax",
        "jsscheme/eval",
        "lib/browserjs",
        "lib/alib.scm"], after);

    function loadJSSeq(jsseq, after) {
        loadNextJS(0);
        function loadNextJS(index) {
            if(index > jsseq.length - 1) {
                after && after();
                return;
            }
            var s = document.createElement("script");
            s.src = "./" + jsseq[index] + ".js?v=" + new Date().getTime();
            s.onload = function() { loadNextJS(index + 1); }
            document.body.appendChild(s);
        }
    }
}
