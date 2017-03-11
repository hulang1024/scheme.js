var divDefinitions, divConsole, textareaDefinitions;
//toolbar
var btnToggleDefinitions,
    btnToggleInteractions,
    btnClearConsole,
    btnRun;
var contentHeight, definitionsHeight, consoleHeight;

var schemeConsole;
var definitionEditor;

window.onload = function(){
loadScheme("", function(){
    $("#loading").hide();
    $("#frame").show();
    
    schemeConsole = new Console();
    divConsole = schemeConsole.divConsole;
    divDefinitions = $("#definitions");
    textareaDefinitions = $("#definitions_textarea");
    btnToggleDefinitions = $("#toggleDefinitions");
    btnToggleInteractions = $("#toggleInteractions");
    btnConsoleClear = $("#clearConsole");
    
    definitionEditor = CodeMirror.fromTextArea(textareaDefinitions.get(0), {
        lineNumbers: true,
        matchBrackets: true,
    });
    definitionEditor.setSize('height', "100%");
    definitionEditor.setOption('theme', "scheme-classic-color");
    
    btnRun = $("#run");
    contentHeight = window.innerHeight ||
        document.documentElement.clientHeight || document.body.clientHeight;
    var content = $("#content");
    content.height(contentHeight + "px");
    divDefinitions.show();
    definitionsHeight = contentHeight * 0.5;
    consoleHeight = contentHeight - definitionsHeight;
    divDefinitions.height(definitionsHeight + "px");
    divConsole.height(contentHeight - definitionsHeight + "px");
    
    $("#viewPlain").click(viewPlain);
    btnToggleDefinitions.click(toggleDefinitions);
    btnToggleInteractions.click(toggleInteractions);
    btnConsoleClear.click(function() {
        schemeConsole.clear();
        schemeConsole.resetInput();
    });
    btnRun.click(run);
    
    scheme.console = schemeConsole;
});

}

function viewPlain() {
    var win = window.open("", document.title + " - Plain Code");
    var pcode = $(document.createElement('pre'));
    pcode.text(definitionEditor.getValue());
    win.document.body.innerHTML = "";
    $(win.document.body).append(pcode);
}

function toggleDefinitions() {
    divDefinitions.toggle();
    btnToggleDefinitions.text((divDefinitions.is(':visible') ? "Hide" : "Show") + " Definitions");
    
    if(divDefinitions.is(':hidden')) {
        if(divConsole.is(':hidden'))
            toggleInteractions();
        divDefinitions.height("0%");
        divConsole.height("100%");
        consoleInput.focus();
    } else {
        divDefinitions.height(definitionsHeight + "px");
        divConsole.height(contentHeight - definitionsHeight + "px");
        definitionEditor.focus();
    }
}

function toggleInteractions() {
    divConsole.toggle();
    btnToggleInteractions.text((divConsole.is(':visible') ? "Hide" : "Show") + " Interactions");

    if(divConsole.is(':hidden')) {
        if(divDefinitions.is(':hidden'))
            toggleDefinitions();
        divDefinitions.height("100%");
        divConsole.height("0%");
        definitionEditor.focus();
    } else {
        divDefinitions.height(contentHeight - consoleHeight + "px");
        divConsole.height(consoleHeight + "px");
        consoleInput.focus();
    }
}

function run() {
    schemeConsole.clear();
    if(divConsole.is(':hidden'))
        toggleInteractions();
   
    scheme.evalStringWithNewEnv(definitionEditor.getValue());
    schemeConsole.resetInput();
}
