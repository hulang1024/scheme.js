var divDefinitions, divConsole, textareaDefinitions;
//toolbar
var btnViewPlain,
    btnToggleDefinitions,
    btnToggleInteractions,
    btnClearConsole,
    btnRun;
var contentHeight, definitionsHeight, consoleHeight;

var schemeConsole;
var definitionEditor;

window.onload = function(){
loadSchemeKernelJS(function(){
    schemeConsole = new Console();
    divConsole = schemeConsole.divConsole;
    divDefinitions = document.getElementById('definitions');
    textareaDefinitions = document.getElementById('definitions_textarea');
    btnViewPlain = document.getElementById("viewPlain");
    btnToggleDefinitions = document.getElementById('toggleDefinitions');
    btnToggleInteractions = document.getElementById('toggleInteractions');
    btnConsoleClear = document.getElementById('clearConsole');
    
    textareaDefinitions.innerHTML = "";
    definitionEditor = CodeMirror.fromTextArea(textareaDefinitions, {
        lineNumbers: true,
        matchBrackets: true,
    });
    definitionEditor.setSize('height', "100%");
    definitionEditor.setOption('theme', "scheme-classic-color");
    
    btnRun = document.getElementById('run');
    contentHeight = window.innerHeight ||
        document.documentElement.clientHeight || document.body.clientHeight;
    var content = document.getElementById("content");
    content.style.height = contentHeight + "px";
    divDefinitions.style.display = "block";
    definitionsHeight = contentHeight * 0.5;
    consoleHeight = contentHeight - definitionsHeight;
    divDefinitions.style.height = definitionsHeight + "px";
    divConsole.style.height = (contentHeight - definitionsHeight) + "px";
    
    btnViewPlain.onclick = function() {
        var win = window.open("", document.title + " - Plain Code");
        var pcode = document.createElement('pre');
        pcode.innerText = definitionEditor.getValue();
        win.document.body.appendChild(pcode);
    }
    btnToggleDefinitions.onclick = toggleDefinitions;
    btnToggleInteractions.onclick = toggleInteractions;
    btnConsoleClear.onclick = function() {
        schemeConsole.clear();
        schemeConsole.resetInput();
    }
    btnRun.onclick = run;
    
    scheme.console = schemeConsole;
});

}

function toggleDefinitions() {
    var nowDisplay = divDefinitions.style.display == "block" ? "none" : "block";
    divDefinitions.style.display = nowDisplay;
    btnToggleDefinitions.innerHTML = (nowDisplay == "block" ? "Hide" : "Show") + " Definitions";
    
    if(nowDisplay == "none") {
        if(divConsole.style.display == "none")
            toggleInteractions();
        divDefinitions.style.height = "0%";
        divConsole.style.height = "100%";
        consoleInput.focus();
    } else {
        divDefinitions.style.height = definitionsHeight + "px";
        divConsole.style.height = (contentHeight - definitionsHeight) + "px";
        definitionEditor.focus();
    }
}

function toggleInteractions() {
    var nowDisplay = divConsole.style.display == "block" ? "none" : "block";
    divConsole.style.display = nowDisplay;
    btnToggleInteractions.innerHTML = (nowDisplay == "block" ? "Hide" : "Show") + " Interactions";

    if(nowDisplay == "none") {
        if(divDefinitions.style.display == "none")
            toggleDefinitions();
        divDefinitions.style.height = "100%";
        divConsole.style.height = "0%";
        definitionEditor.focus();
    } else {
        divDefinitions.style.height = (contentHeight - consoleHeight) + "px";
        divConsole.style.height = consoleHeight + "px";
        consoleInput.focus();
    }
}

function run() {
    schemeConsole.clear();
    if(divConsole.style.display == "none")
        toggleInteractions();
   
    scheme.evalString(definitionEditor.getValue());
    schemeConsole.resetInput();
}
