// REPL Console
var divDefinitions = document.getElementById('definitions');
var textareaDefinitions = document.getElementById('definitions_textarea');
var divConsole = document.getElementById('console');
var btnToggleDefinitions = document.getElementById('toggleDefinitions');
var btnToggleInteractions = document.getElementById('toggleInteractions');
var btnClearConsole = document.getElementById('clearConsole');
var btnRun = document.getElementById('run');
var consoleInput;
var contentHeight, definitionsHeight, consoleHeight;

function HistoryLook() {
    var inputs = [];
    var index = 0;
    
    this.lastInput = null;
    
    this.push = function(input) {
        inputs.push(input);
        index = inputs.length;
    }
    this.hasPrev = function() { return index - 1 >= 0; }
    this.hasNext = function() { return index + 1 <= inputs.length - 1; }
    this.prev = function() { return inputs[--index]; }
    this.next = function() { return inputs[++index]; }
    this.bottom = function() { index = inputs.length; }
}

var historyLook = new HistoryLook();

window.onload = function(){
    loadSchemeKernelJS(function(){
        loadSchemeLibJS(function(){
            initFrame();
            scheme.console = divConsole;
        });
    });
}

function initFrame() {
    contentHeight = (window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight);
    var content = document.getElementById("content");
    content.style.height = contentHeight + "px";
    divDefinitions.style.display = "block";
    divConsole.style.display = "block";
    definitionsHeight = contentHeight * 0.5;
    consoleHeight = contentHeight - definitionsHeight;
    divDefinitions.style.height = definitionsHeight + "px";
    divConsole.style.height = consoleHeight + "px";
        
    btnToggleDefinitions.onclick = toggleDefinitions;
    btnToggleInteractions.onclick = toggleInteractions;
    btnClearConsole.onclick = function() {
        clearConsole();
        appendConsoleInput();
    }
    btnRun.onclick = run;
    divConsole.onclick = function(event) {
        if(event.toElement == divConsole)
            consoleInput.focus();
    }
    clearConsole();
    appendConsoleInput();
    consoleInput.focus();
}

function toggleDefinitions() {
    var nowDisplay = divDefinitions.style.display == "block" ? "none" : "block";
    setDefinitionsViewDisplay(nowDisplay);
    if(nowDisplay == "none") {
        if(divConsole.style.display == "none")
            setInteractionsViewDisplay("block");
        divDefinitions.style.height = "0%";
        divConsole.style.height = "100%";
        consoleInput.focus();
    } else {
        divDefinitions.style.height = definitionsHeight + "px";
        divConsole.style.height = (contentHeight - definitionsHeight) + "px";
        textareaDefinitions.focus();
    }
}

function toggleInteractions() {
    var nowDisplay = divConsole.style.display == "block" ? "none" : "block";
    setInteractionsViewDisplay(nowDisplay);
    if(nowDisplay == "none") {
        if(divDefinitions.style.display == "none")
            setDefinitionsViewDisplay("block");
        divDefinitions.style.height = "100%";
        divConsole.style.height = "0%";
        textareaDefinitions.focus();
    } else {
        divDefinitions.style.height = (contentHeight - consoleHeight) + "px";
        divConsole.style.height = consoleHeight + "px";
        consoleInput.focus();
    }
}

function setDefinitionsViewDisplay(display) {
    divDefinitions.style.display = display;
    btnToggleDefinitions.innerHTML = (display == "block" ? "Hide" : "Show") + " Definitions";
}

function setInteractionsViewDisplay(display) {
    divConsole.style.display = display;
    btnToggleInteractions.innerHTML = (display == "block" ? "Hide" : "Show") + " Interactions";
}

function run() {
    clearConsole();
    setInteractionsViewDisplay("block");
    if(divDefinitions.style.display == "block") {
        divDefinitions.style.height = (contentHeight - consoleHeight) + "px";
        divConsole.style.height = consoleHeight + "px";
    } else {
        divConsole.style.height = "100%";
    }
    
    scheme.evalString(textareaDefinitions.value);
    appendConsoleInput();
}

function evalConsoleInput() {
    var code = consoleInput.value;
    var objs = scheme.readMutil(code);
    scheme.evalObjects(objs);
 
    var p = consoleInput.parentNode;
    p.removeChild(consoleInput);
    p.children[0].className += " dead";
    var codeSpan = document.createElement("span");
    var pad = code.substring(0, code.search(/[^\s]/g)).replace(/\s/g, "&nbsp;");
    codeSpan.innerHTML += pad;
    for(var i = 0; i < objs.length; i++)
        codeSpan.innerHTML += scheme.writeToString(objs[i], false, true);
    p.appendChild(codeSpan);
    appendConsoleInput();
}

function clearConsole() {
    divConsole.innerHTML = "<p>Welcome to <a target=\"_blank\" href=\"http://github.com/hlpp/JSScheme\" style=\"color:blue\">JSScheme</a>.</p>";
}

function appendConsoleInput() {
    divConsole.innerHTML += "<p class=\"code_echo\"><span class=\"prompt\">&gt;</span><input type=\"text\" id=\"consoleInput\" /></p>";

    consoleInput = document.getElementById("consoleInput");
    consoleInput.onkeydown = function(event) {
        switch(event.keyCode) {
        case 13://enter
            if(consoleInput.value.trim().length) {
                historyLook.push(consoleInput.value);
                historyLook.lastInput = null;
                evalConsoleInput();
            }
            break;
        case 38://up
            if(historyLook.lastInput == null)
                historyLook.lastInput = consoleInput.value.trim();
            if(historyLook.hasPrev()) {
                consoleInput.value = historyLook.prev();
                moveToEnd(consoleInput);
            }
            break;
        case 40://down
            if(historyLook.lastInput == null)
                historyLook.lastInput = consoleInput.value.trim();
            if(historyLook.hasNext())
                consoleInput.value = historyLook.next();
            else {
                historyLook.bottom();
                consoleInput.value = historyLook.lastInput;
            }
            moveToEnd(consoleInput);
            break;
        default:
            if(!historyLook.hasNext())
                historyLook.lastInput = (consoleInput.value + String.fromCharCode(event.keyCode)).trim();
        }
        
        function moveToEnd(obj) {
            obj.focus(); 
            var len = obj.value.length; 
            if (document.selection) { 
                var sel = obj.createTextRange(); 
                sel.moveStart('character', len);
                sel.collapse(); 
                sel.select(); 
            } else if (typeof obj.selectionStart == 'number' && typeof obj.selectionEnd == 'number') { 
                obj.selectionStart = obj.selectionEnd = len; 
            } 
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