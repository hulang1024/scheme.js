// REPL

var textareaExp = document.getElementById('exp');
var textareaConsole = document.getElementById('console');
var btnRun = document.getElementById('run');

window.onload = function(){
	loadSchemeKernelJS(function(){
		loadSchemeLibJS(function(){
			scheme.console = textareaConsole;
			btnRun.onclick = run;
		});
	});
}

function run() {
	scheme.console.value = "Welcome to JSScheme.\n";
	scheme.evalString(textareaExp.value.trim());
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