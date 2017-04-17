var loadScheme = function(rootdir, after) {
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
        "lib/browserjs",
        "base/env",
        "lib/lib.scm"].map(function(s){
			return (rootdir || "") + "./jsscheme/" + s + ".js?v=" + new Date().getMonth();
		});
	$LAB.setOptions({AlwaysPreserveOrder:true})
	    .script(jsArr).wait(function(){
        	$LAB.setOptions({AlwaysPreserveOrder:false});
                //env
                scheme.initBasicEnv();
                scheme.makeGlobalEnv();
            
                after && after();
            });
}
