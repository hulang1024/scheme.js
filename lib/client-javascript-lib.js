(function(s) {
"use strict";

var ScmObject = s.ScmObject;

(function() {
	s.addGlobalPrimProc("random-int", randomInt, 2);
	s.addGlobalPrimProc("alert", clientjsAlert, 0, 1);
	s.addGlobalPrimProc("prompt", clientjsPrompt, 0, 2);
	s.addGlobalPrimProc("confirm", clientjsConfirm, 0, 1);
	
	s.addGlobalObject("window", ScmObject.makeMyObject(window));
	s.addGlobalObject("document", ScmObject.makeMyObject(window.document));
	s.addGlobalPrimProc("getElementById", getElementById, 2);
	s.addGlobalPrimProc("getElementsByClassName", getElementsByClassName, 2);
	s.addGlobalPrimProc("getElementsByName", getElementsByName, 2);
	s.addGlobalPrimProc("getElementsByTagName", getElementsByTagName, 2);
	s.addGlobalPrimProc("dom-set", setDomProperty, 3);
	s.addGlobalPrimProc("dom-get", getDomProperty, 2);
	s.addGlobalPrimProc("dom-set-event", setDomEventProperty, 3);
	s.addGlobalPrimProc("mo-get", getMOProperty, 2);
})();

//-------------------
// query dom elements
//-------------------
function getElementById(argv) {
	var dom = argv[0];
	var id = argv[1];
	if(!dom.isMyObject())
		return s.wrongContract("getElementById", argv, "object?", dom, 0);
	if(!id.isString())
		return s.wrongContract("getElementById", argv, "string?", id, 1);
	return ScmObject.makeMyObject(s.objectVal(dom).getElementById(s.stringVal(id)));
}

function getElementsByClassName(argv) {
	var dom = argv[0];
	var className = argv[1];
	if(!dom.isMyObject())
		return s.wrongContract("getElementsByClassName", argv, "object?", dom, 0);
	if(!className.isString())
		return s.wrongContract("getElementsByClassName", argv, "string?", className, 1);
	return ScmObject.makeMyObject(s.objectVal(dom).getElementById(s.stringVal(className)));
}

function getElementsByName(argv) {
	var dom = argv[0];
	var name = argv[1];
	if(!dom.isMyObject())
		return s.wrongContract("getElementsByName", argv, "object?", dom, 0);
	if(!name.isString())
		return s.wrongContract("getElementsByName", argv, "string?", name, 1);
	return ScmObject.makeMyObject(s.objectVal(dom).getElementById(s.stringVal(name)));
}

function getElementsByTagName(argv) {
	var dom = argv[0];
	var tagName = argv[1];
	if(!dom.isMyObject())
		return s.wrongContract("getElementsByTagName", argv, "object?", dom, 0);
	if(!tagName.isString())
		return s.wrongContract("getElementsByTagName", argv, "string?", tagName, 1);
	return ScmObject.makeMyObject(s.objectVal(dom).getElementById(s.stringVal(tagName)));
}

//----------------------------------
// dom object property setter/getter
//----------------------------------
function setDomProperty(argv) {
	var dom = argv[0];
	var propName = argv[1];
	var value = argv[2];
	if(!dom.isMyObject())
		return s.wrongContract("dom-set", argv, "object?", dom, 0);
	if(!propName.isSymbol())
		return s.wrongContract("dom-set", argv, "symbol?", propName, 1);
	s.objectVal(dom)[s.symbolVal(propName)] = value.isString() ? s.stringVal(value) : value.data;
	return value;
}

function setDomEventProperty(argv) {
	var dom = argv[0];
	var eventName = argv[1];
	var proc = argv[2];
	if(!dom.isMyObject())
		return s.wrongContract("dom-set-event", argv, "object?", dom, 0);
	if(!eventName.isSymbol())
		return s.wrongContract("dom-set-event", argv, "symbol?", eventName, 1);
	if(!proc.isProcedure())
		return s.wrongContract("dom-set-event", argv, "procedure?", proc, 2);
	s.objectVal(dom)[s.symbolVal(eventName)] = function(event) {
		var argv = [ScmObject.makeMyObject(event)];
		s.apply(proc, argv);
	}
	return proc;
}

function getDomProperty(argv) {
	var dom = argv[0];
	var propName = argv[1];
	if(!dom.isMyObject())
		return s.wrongContract("dom-get", argv, "object?", dom, 0);
	if(!propName.isSymbol())
		return s.wrongContract("dom-get", argv, "symbol?", propName, 1);
	return jsObjectToScmObject(s.objectVal(dom)[s.symbolVal(propName)]);
}

function getMOProperty(argv) {
	var mo = argv[0];
	var propName = argv[1];
	if(!mo.isMyObject())
		return s.wrongContract("mo-get", argv, "object?", mo, 0);
	if(!propName.isSymbol())
		return s.wrongContract("mo-get", argv, "symbol?", propName, 1);
	return jsObjectToScmObject(s.objectVal(mo)[s.symbolVal(propName)]);
}


function clientjsAlert(argv) {
	var msg = argv.length > 0 ? s.stringVal(argv[0]) : "";
	window.alert(msg);
	return s.voidValue;
}

function clientjsPrompt(argv) {
	var msg = argv.length > 0 ? s.stringVal(argv[0]) : "";
	var val = argv.length > 1 ? s.stringVal(argv[1]) : "";
	return new s.ScmObject.makeString(window.prompt(msg, val));
}

function clientjsConfirm(argv) {
	var msg = argv.length > 0 ? s.stringVal(argv[0]) : "";
	return new s.ScmObject.getBoolean(window.confirm(msg));
}

function randomInt(argv) {
	var n = argv[0];
	var m = argv[1];
	if(!n.isInteger())
		return s.wrongContract("random-int", argv, "integer?", n, 0);
	if(!n.isInteger())
		return s.wrongContract("random-int", argv, "integer?", m, 1);
	n = s.intVal(n);
	m = s.intVal(m);
	return s.ScmObject.makeInt(Math.floor(Math.random() * (m - n)) + n);
}

function jsObjectToScmObject(jsObj) {
	if(typeof jsObj == "undefined")
		return ScmObject.makeMyObject(jsObj);
	switch(jsObj.constructor) {
		case Number: return ScmObject.makeReal(jsObj);
		case String: return ScmObject.makeString(jsObj);
		case Boolean: return ScmObject.makeBoolean(jsObj);
		default: return ScmObject.makeMyObject(jsObj);
	}
}

})(scheme);