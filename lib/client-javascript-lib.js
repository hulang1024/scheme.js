(function(s) {
"use strict";

var ScmObject = s.ScmObject;

(function() {
	var addGlobalPrimProc = s.addGlobalPrimProc;
	var addGlobalObject = s.addGlobalObject;
	
	addGlobalPrimProc("random-int", randomInt, 2);
	addGlobalPrimProc("alert", clientjsAlert, 0, 1);
	addGlobalPrimProc("prompt", clientjsPrompt, 0, 2);
	addGlobalPrimProc("confirm", clientjsConfirm, 0, 1);
	
	addGlobalObject("document", ScmObject.makeMyObject(window.document));
	addGlobalPrimProc("getElementById", getElementById, 2);
	addGlobalPrimProc("getElementsByClassName", getElementsByClassName, 2);
	addGlobalPrimProc("getElementsByName", getElementsByName, 2);
	addGlobalPrimProc("getElementsByTagName", getElementsByTagName, 2);
	addGlobalPrimProc("dom-set", setDomProperty, 3);
	addGlobalPrimProc("dom-get", getDomProperty, 2);
	addGlobalPrimProc("dom-set-event", setDomEventProperty, 3);
	addGlobalPrimProc("mo-get", getMOProperty, 2);
})();

//-------------------
// query dom elements
//-------------------
function getElementById(args) {
	var dom = s.car(args);
	var id = s.cadr(args);
	if(!dom.isMyObject())
		return s.wrongContract("getElementById", args, "object?", dom, 0);
	if(!id.isString())
		return s.wrongContract("getElementById", args, "string?", id, 1);
	return ScmObject.makeMyObject(s.objectVal(dom).getElementById(s.stringVal(id)));
}

function getElementsByClassName(args) {
	var dom = s.car(args);
	var className = s.cadr(args);
	if(!dom.isMyObject())
		return s.wrongContract("getElementsByClassName", args, "object?", dom, 0);
	if(!className.isString())
		return s.wrongContract("getElementsByClassName", args, "string?", className, 1);
	return ScmObject.makeMyObject(s.objectVal(dom).getElementById(s.stringVal(className)));
}

function getElementsByName(args) {
	var dom = s.car(args);
	var name = s.cadr(args);
	if(!dom.isMyObject())
		return s.wrongContract("getElementsByName", args, "object?", dom, 0);
	if(!name.isString())
		return s.wrongContract("getElementsByName", args, "string?", name, 1);
	return ScmObject.makeMyObject(s.objectVal(dom).getElementById(s.stringVal(name)));
}

function getElementsByTagName(args) {
	var dom = s.car(args);
	var tagName = s.cadr(args);
	if(!dom.isMyObject())
		return s.wrongContract("getElementsByTagName", args, "object?", dom, 0);
	if(!tagName.isString())
		return s.wrongContract("getElementsByTagName", args, "string?", tagName, 1);
	return ScmObject.makeMyObject(s.objectVal(dom).getElementById(s.stringVal(tagName)));
}

//----------------------------------
// dom object property setter/getter
//----------------------------------
function setDomProperty(args) {
	var dom = s.listRef(args, 0);
	var propName = s.listRef(args, 1);
	var value = s.listRef(args, 2);
	if(!dom.isMyObject())
		return s.wrongContract("dom-set", args, "object?", dom, 0);
	if(!propName.isSymbol())
		return s.wrongContract("dom-set", args, "symbol?", propName, 1);
	s.objectVal(dom)[s.symbolVal(propName)] = value.isString() ? s.stringVal(value) : value.data;
	return value;
}

function setDomEventProperty(args) {
	var dom = s.listRef(args, 0);
	var eventName = s.listRef(args, 1);
	var proc = s.listRef(args, 2);
	if(!dom.isMyObject())
		return s.wrongContract("dom-set-event", args, "object?", dom, 0);
	if(!eventName.isSymbol())
		return s.wrongContract("dom-set-event", args, "symbol?", eventName, 1);
	if(!proc.isProcedure())
		return s.wrongContract("dom-set-event", args, "procedure?", proc, 2);
	s.objectVal(dom)[s.symbolVal(eventName)] = function(event) {
		var args = s.cons(ScmObject.makeMyObject(event), s.nil);
		s.apply(proc, args);
	}
	return proc;
}

function getDomProperty(args) {
	var dom = s.listRef(args, 0);
	var propName = s.listRef(args, 1);
	if(!dom.isMyObject())
		return s.wrongContract("dom-get", args, "object?", dom, 0);
	if(!propName.isSymbol())
		return s.wrongContract("dom-get", args, "symbol?", propName, 1);
	return jsObjectToScmObject(s.objectVal(dom)[s.symbolVal(propName)]);
}

function getMOProperty(args) {
	var mo = s.listRef(args, 0);
	var propName = s.listRef(args, 1);
	if(!mo.isMyObject())
		return s.wrongContract("mo-get", args, "object?", mo, 0);
	if(!propName.isSymbol())
		return s.wrongContract("mo-get", args, "symbol?", propName, 1);
	return jsObjectToScmObject(s.objectVal(mo)[s.symbolVal(propName)]);
}


function clientjsAlert(args, argc) {
	var msg = argc > 0 ? s.stringVal(s.car(args)) : "";
	window.alert(msg);
	return s.voidValue;
}

function clientjsPrompt(args, argc) {
	var msg = argc > 0 ? s.stringVal(s.listRef(args, 0)) : "";
	var val = argc > 1 ? s.stringVal(s.listRef(args, 1)) : "";
	return new s.ScmObject.makeString(window.prompt(msg, val));
}

function clientjsConfirm(args, argc) {
	var msg = argc > 0 ? s.stringVal(s.car(args)) : "";
	return new s.ScmObject.getBoolean(window.confirm(msg));
}

function randomInt(args) {
	var n = s.car(args).data;
	var m = s.cadr(args).data;
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