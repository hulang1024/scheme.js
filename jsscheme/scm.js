loadScheme("../", function(){
    var scmScripts = scanSchemeScripts();
    var ss;
    for (var i = 0; i < scmScripts.length; i++) {
        ss = scmScripts[i];
        if(!ss.hasAttribute("ignore")) {
            scheme.evalStringWithEnv(ss.innerText, scheme.globalEnvironment);
        }
    }
    
    function scanSchemeScripts() {
        return document.querySelectorAll("script[type='text/scm']");
    }
});

