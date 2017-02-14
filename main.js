// REPL Console
var divDefinitions = document.getElementById('definitions');
var textareaDefinitions = document.getElementById('definitions_textarea');
var divConsole = document.getElementById('console');
var btnToggleDefinitions = document.getElementById('toggleDefinitions');
var btnClearConsole = document.getElementById('clearConsole');
var btnRun = document.getElementById('run');
var consoleInput;

window.onload = function(){
    loadSchemeKernelJS(function(){
        loadSchemeLibJS(function(){
            initFrame();
            scheme.console = divConsole;
        });
    });
}

function initFrame() {
    var content = document.getElementById("content");
    content.style.height = (window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight) + "px";
    divDefinitions.style.display = "block";
    divConsole.style.display = "block";
    
    btnToggleDefinitions.onclick = toggleDefinitions;
    btnClearConsole.onclick = function() {
        clearConsole();
        appendConsoleInput();
    }
    btnRun.onclick = run;
    
    clearConsole();
    appendConsoleInput();
    consoleInput.focus();
}

function toggleDefinitions() {
    var nowDisplay = divDefinitions.style.display == "block" ? "none" : "block";
    divDefinitions.style.display = nowDisplay;
    if(nowDisplay == "none") {
        divDefinitions.style.height = "0%";
        divConsole.style.height = "100%";
    } else {
        divDefinitions.style.height = "50%";
        divConsole.style.height = "50%";
    }
    btnToggleDefinitions.innerHTML = (nowDisplay == "block" ? "Hide" : "Show") + " Definitions";
}

function run() {
    clearConsole();
    scheme.evalString(textareaDefinitions.value);
    appendConsoleInput();
}

function evalConsoleInput() {
    var code = consoleInput.value;
    
    scheme.evalString(code);

    var p = consoleInput.parentNode;
    p.removeChild(consoleInput);
    p.children[0].className += " dead";
    var codeSpan = document.createElement("span");
    codeSpan.innerText = code;
    p.appendChild(codeSpan);
    appendConsoleInput();
}

function clearConsole() {
    divConsole.innerHTML = "<p>Welcome to <a target=\"_blank\" href=\"http://github.com/hlpp/JSScheme\">JSScheme</a>.</p>";
}

function appendConsoleInput() {
    divConsole.innerHTML += "<p class=\"input\"><span class=\"prompt\">&gt;</span><input type=\"text\" id=\"consoleInput\" /></p>";

    consoleInput = document.getElementById("consoleInput");
    consoleInput.onkeydown = function(event) {
        if(event.keyCode == 13) {
            if(consoleInput.value.trim().length)
                evalConsoleInput();
        }
    }
    consoleInput.focus();
}

function loadSchemeKernelJS(after) {
    loadJSSeq([
        "object.js", "read.js", "print.js", "env.js", "error.js", "bool.js",
        "symbol.js", "number.js", "char.js", "string.js", "list.js", "vector.js", "myobject.js", "fun.js",
        "lib/client-javascript-lib.js", "eval.js"],
        function(){
            scheme.initBasicEnv();
            after();
        });
}

function loadSchemeLibJS(after) {
    loadJSSeq(["lib/alib.scm.js"], after);
}

function loadJSSeq(jsseq, after) {
    loadNextJS(0);
    
    function loadNextJS(index) {
        if(index > jsseq.length - 1) {
            after();
            return;
        }
    
        var s = document.createElement("script");
        s.src = jsseq[index] + "?v=" + index + "_" + new Date().getTime();
        s.onload = function() {
            loadNextJS(index + 1);
        }
        document.body.appendChild(s);
    }
}