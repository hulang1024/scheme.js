var ide = new IDE();
loadScheme("", ide.init.bind(ide));

function IDE() {
	var divDefinitions, divConsole, textareaDefinitions;
	//toolbar
	var btnToggleDefinitions,
	    btnToggleInteractions,
	    btnClearConsole,
        btnCompileToJS,
        btnCompileToJSAndRun,
	    btnRun;
	var contentHeight, definitionsHeight, consoleHeight;
	var replConsole;
	var definitionEditor;
	
	this.init = function(){
	    $("#loading").hide();
	    $("#frame").show();
	    
	    replConsole = new REPLConsole();
	    divConsole = replConsole.divConsole;
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
	    definitionEditor.setOption('theme', "scheme-dark");
	    
        btnCompileToJS = $("#compileToJS");
        btnCompileToJS.click(compileToJS);
        
        btnCompileToJSAndRun = $("#compileToJSAndRun");
        btnCompileToJSAndRun.click(compileToJSAndRun);
        
	    btnRun = $("#run");
	    btnRun.click(run);

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
	        replConsole.clear();
	        replConsole.resetInput();
	    });
	    
	    scheme.console = replConsole;
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
	
    function compileToJS() {
        replConsole.clear();
		replConsole.log(null, scheme.compileSrcString(definitionEditor.getValue()));
        replConsole.resetInput();
    }
    
    function compileToJSAndRun() {
        var jsSrc = scheme.compileSrcString(definitionEditor.getValue());
        replConsole.clear();
        replConsole.log(null, jsSrc + "\n");
        try {
            replConsole.log("display", window.eval(jsSrc));
        } catch(e) {}
        replConsole.resetInput();
    }
    
	function run() {
	    replConsole.clear();
	    if(divConsole.is(':hidden'))
	        toggleInteractions();
	   
	    scheme.evalStringWithNewEnv(definitionEditor.getValue());
	    replConsole.resetInput();
	}
}
