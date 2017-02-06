(function(s){
"use strict";

var ScmObject = s.ScmObject;

s.initList = function() {
	var addGlobalPrimProc = s.addGlobalPrimProc;
	
	addGlobalPrimProc("pair?", isPair, 1);
	addGlobalPrimProc("list?", isList, 1);
	addGlobalPrimProc("null?", isNull, 1);
	addGlobalPrimProc("cons", mcons, 2);
	addGlobalPrimProc("car", mcar, 1);
	addGlobalPrimProc("cdr", mcdr, 1);
	addGlobalPrimProc("set-car!", setCar, 2);
	addGlobalPrimProc("set-cdr!", setCdr, 2);
	addGlobalPrimProc("list", list, 0, -1);
	addGlobalPrimProc("list-ref", listRef, 2);
	addGlobalPrimProc("length", length, 1);
	cadrFuncNames.forEach(function(funcName){
		addGlobalPrimProc(funcName, eval('scheme.m'+funcName), 1);
	});
}


ScmObject.makePair = function(data) {
	return new ScmObject(7, data);
}

ScmObject.makeEmptyList = function(data) {
	return new ScmObject(0, null);
}

s.nil = ScmObject.makeEmptyList();

s.arrayToList = function(array) {
	var list = s.nil;
	for(var i = array.length - 1; i >= 0; i--)
		list = s.cons(array[i], list);
	return list;
}

s.listToArray = function(list) {
	var array = [];
	while(!list.isEmptyList()) {
		array.push(s.car(list));
		list = s.cdr(list);
	}
	return array;
}

s.pairToArray = function(pair) {
	var array = [];
	while(pair.isPair()) {
		array.push(s.car(pair));
		pair = s.cdr(pair);
	}
	array.push(pair);
	return array;
}

s.cons = function(x, y) { return new ScmObject.makePair([x, y]); }
s.car = function(pair) { return pair.data[0]; }
s.cdr = function(pair) { return pair.data[1]; }
s.setCar = function(pair, pcar) { pair.data[0] = pcar; }
s.setCdr = function(pair, pcdr) { pair.data[1] = pcdr; }

s.isList = function(obj) {
	for(; obj.isPair(); obj = s.cdr(obj))
		if(s.car(obj).isEmptyList())
			return true;
	return obj.isEmptyList();
}

s.listRef = function(list, index) {
	for(var i = 0; i < index; i++)
		list = s.cdr(list);
	return s.car(list);
}

s.listLength = function(list) {
	var len = 0;
	while(!list.isEmptyList()) {
		list = s.cdr(list);
		len++;
	}
	return len;
}

function isList(argv) {
	var obj = argv[0];
	var b = false;
	for(; !b && obj.isPair(); obj = s.cdr(obj))
		if(s.car(obj).isEmptyList())
			b = true;
	if(!b && obj.isEmptyList())
		b = true;
	return ScmObject.getBoolean(b);
}

function isPair(argv) {
	return ScmObject.getBoolean(argv[0].isPair());
}

function isNull(argv) {
	return ScmObject.getBoolean(argv[0].isEmptyList());
}
function mcons(argv){
	return s.cons(argv[0], argv[1]);
}

function mcar(argv) {
	var obj = argv[0];
	if(obj.isPair())
		return s.car(obj);
	else
		return s.wrongContract("mcar", argv, "mpair?", obj, 0);
}

function mcdr(argv) {
	var obj = argv[0];
	if(obj.isPair())
		return s.cdr(obj);
	else
		return s.wrongContract("mcdr", argv, "mpair?", obj, 0);
}

function setCar(argv) {
	var pair = argv[0];
	if(!pair.isPair())
		return s.wrongContract("set-car!", argv, "mpair?", pair, 0);
	var pcar = argv[1];
	s.setCar(pair, pcar);
	return s.voidValue;
}

function setCdr(argv) {
	var pair = argv[0];
	if(!pair.isPair())
		return s.wrongContract("set-car!", argv, "mpair?", pair, 0);
	var pcdr = argv[1];
	s.setCdr(pair, pcdr);
	return s.voidValue;
}

function list(argv) {
	var l = s.nil;
	for(var i = argv.length - 1; i >= 0; i--)
		l = s.cons(argv[i], l);
	return l;
}

function listRef(argv) {
	var pair = argv[0];
	if(!pair.isPair())
		return s.wrongContract("list-ref", argv, "mpair?", pair, 0);
	var index = argv[1].data;
	for(var i = 0; i < index; i++)
		pair = s.cdr(pair);
	return s.car(pair);
}

function length(argv) {
	var list = argv[0];
	if(!s.isList(list))
		return s.wrongContract("length", argv, "list?", list, 0);
	return ScmObject.makeInt(s.listLength(list));
}

var cadrFuncNames = [
	"caar", "cadr", "cdar", "cddr",
	"caaar", "caadr", "cadar", "caddr", "cdaar", "cdadr", "cddar", "cdddr",
	"caaaar", "caaadr", "caadar", "caaddr", "cadaar", "cadadr", "caddar",
	"cadddr", "cdaaar", "cdaadr", "cdadar", "cdaddr", "cddaar", "cddadr", "cdddar", "cddddr"];
function genCadrProcedures() {
	cadrFuncNames.forEach(function(funcName){
		var argName = "argv";
		var exp = argName;
		var cs = funcName.split('').slice(1, funcName.length - 1);
		for(var i = cs.length - 1; i >= 0; i--)
			exp = (cs[i] == 'a' ? "scheme.car" : "scheme.cdr") + "(" +  exp + ")";
		var func = new Function(argName, "return " + exp);
		var mfunName = 'm' + funcName;
		var mfunc = new Function(argName, "return " + ("scheme." + funcName + "(argv[0])"));
		s[funcName] = func;
		s[mfunName] = mfunc;
	});
}
genCadrProcedures();


})(scheme);
