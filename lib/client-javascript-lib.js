(function(s) {
"use strict";

var ScmObject = s.ScmObject;

(function() {
	var addGlobalPrimProc = s.addGlobalPrimProc;
	var addGlobalObject = s.addGlobalObject;
	
	addGlobalPrimProc("random-int", randomInt, 2);
	addGlobalPrimProc("alert", clientjsAlert, 0, -1);
	addGlobalPrimProc("prompt", clientjsPrompt, 0, -1);
	addGlobalPrimProc("confirm", clientjsConfirm, 0, -1);
	
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
	var dom = s.car(args).data;
	var id = s.cadr(args).data;
	return ScmObject.makeMyObject(dom.getElementById(id));
}

function getElementsByClassName(args) {
	var dom = s.car(args).data;
	var className = s.cadr(args).data;
	return ScmObject.makeMyObject(dom.getElementsByClassName(className));
}

function getElementsByName(args) {
	var dom = s.car(args).data;
	var name = s.cadr(args).data;
	return ScmObject.makeMyObject(dom.getElementsByName(name));
}

function getElementsByTagName(args) {
	var dom = s.car(args).data;
	var tagName = s.cadr(args).data;
	return ScmObject.makeMyObject(dom.getElementsByTagName(tagName));
}

//----------------------------------
// dom object property setter/getter
//----------------------------------
function setDomProperty(args) {
	var dom = s.listRef(args, 0).data;
	var propName = s.listRef(args, 1).data;
	var value = s.listRef(args, 2); 
	dom[propName] = value.data;
	return value;
}

function getDomProperty(args) {
	var dom = s.listRef(args, 0).data;
	var propName = s.listRef(args, 1).data;
	
	return jsObjToScmObj(dom[propName]);
}

function getMOProperty(args) {
	var mo = s.listRef(args, 0).data;
	var propName = s.listRef(args, 1).data;
	return jsObjToScmObj(mo[propName]);
}

function setDomEventProperty(args) {
	var dom = s.listRef(args, 0).data;
	var eventName = s.listRef(args, 1).data;
	var proc = s.listRef(args, 2);
	
	dom[eventName] = function(event) {
		var args = s.cons(ScmObject.makeMyObject(event), s.nil);
		s.apply(proc, args);
	}
	return proc;
}

function clientjsAlert(args) {
	var msg = args.isEmptyList() ? "" : s.car(args).data;
	window.alert(msg);
	return s.voidValue;
}

function clientjsPrompt(args) {
	args = s.listToArray(args);
	var msg = args[0] ? args[0].data : "";
	var val = args[1] ? args[1].data : "";
	return new s.ScmObject.makeString(window.prompt(msg, val));
}

function clientjsConfirm(args) {
	var msg = args.isEmptyList() ? "" : s.car(args).data;
	return new s.ScmObject.getBoolean(window.confirm(msg));
}

function randomInt(args) {
	var n = s.car(args).data;
	var m = s.cadr(args).data;
	return s.ScmObject.makeInt(Math.floor(Math.random() * (m - n)) + n);
}


function jsObjToScmObj(jsObj) {
	switch(jsObj.constructor) {
	case Number:
		return ScmObject.makeReal(jsObj);
	case String:
		return ScmObject.makeString(jsObj);
	case Boolean:
		return ScmObject.makeBoolean(jsObj);
	default:
		return ScmObject.makeMyObject(jsObj);
	}
}
})(scheme);