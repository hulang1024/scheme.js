(function(s) {
"use strict";
var ScmObject = s.ScmObject;


s.initPrimitiveProcedures = function(env) {
	addGlobalPrimProc("+", sum, 0, null);
	addGlobalPrimProc("-", sub, 1, null);
	addGlobalPrimProc("*", mul, 0, null);
	addGlobalPrimProc("/", div, 1, null);
	
	addGlobalPrimProc("=", equalNumber, 2, null);
	addGlobalPrimProc("<", lessThan, 2, null);
	addGlobalPrimProc(">", greaThan, 2, null);
	addGlobalPrimProc("<=", lteq, 2, null);
	addGlobalPrimProc(">=", gteq, 2, null);
	
	addGlobalPrimProc("not", not, 1);
	addGlobalPrimProc("car", mcar, 1);
	addGlobalPrimProc("cdr", mcdr, 1);
	addGlobalPrimProc("cons", mcons, 2);
	addGlobalPrimProc("set-car!", setCar, 2);
	addGlobalPrimProc("set-cdr!", setCdr, 2);
	addGlobalPrimProc("list", mlist, 0, null);
	addGlobalPrimProc("list-ref", mlistRef, 2);

	addGlobalPrimProc("pair?", isPair, 1);
	addGlobalPrimProc("list?", isList, 1);
	addGlobalPrimProc("null?", isNull, 1);
	addGlobalPrimProc("integer?", isInteger, 1);
	addGlobalPrimProc("real?", isReal, 1);
	addGlobalPrimProc("number?", isNumber, 1);
	addGlobalPrimProc("string?", isString, 1);
	addGlobalPrimProc("boolean?", isBoolean, 1);
	addGlobalPrimProc("symbol?", isSymbol, 1);
	addGlobalPrimProc("procedure?", isProcedure, 1);
	addGlobalPrimProc("eq?", equalObjectRef, 2);
	addGlobalPrimProc("equal?", equalObjectRef, 2);
	
	addGlobalPrimProc("and", and, 0, null);
	addGlobalPrimProc("or", or, 0, null);
	
	addGlobalPrimProc("string->number", stringToNumber, 1);
	
	addGlobalPrimProc("eval", meval, 2);
	addGlobalPrimProc("apply", mapply, 2);
	addGlobalPrimProc("interaction-environment", interactionEnvironment);
	
	addGlobalPrimProc("display", display, 1);
	addGlobalPrimProc("newline", newline, 0);
	addGlobalPrimProc("random-int", randomInt, 2);
	addGlobalPrimProc("alert", clientjsAlert, 0, null);
	addGlobalPrimProc("prompt", clientjsPrompt, 0, null);
	addGlobalPrimProc("confirm", clientjsConfirm, 0, null);
	
	var cadrFuncNames = [
		"caar", "cadr", "cdar", "cddr",
		"caaar", "caadr", "cadar", "caddr", "cdaar", "cdadr", "cddar", "cdddr",
		"caaaar", "caaadr", "caadar", "caaddr", "cadaar", "cadadr", "caddar",
			"cadddr", "cdaaar", "cdaadr", "cdadar", "cdaddr", "cddaar", "cddadr", "cdddar", "cddddr"];
	cadrFuncNames.forEach(function(funcName){
		addGlobalPrimProc(funcName, eval('scheme.m'+funcName), 1);
	});
	
	function addGlobalPrimProc(name, func, minArgs, maxArgs) {
		env.map[name] = ScmObject.makePrimProc(name, func, minArgs, maxArgs);
	}
}


function genCadrProcedures() {
	var cadrFuncNames = [
		"caar", "cadr", "cdar", "cddr",
		"caaar", "caadr", "cadar", "caddr", "cdaar", "cdadr", "cddar", "cdddr",
		"caaaar", "caaadr", "caadar", "caaddr", "cadaar", "cadadr", "caddar",
			"cadddr", "cdaaar", "cdaadr", "cdadar", "cdaddr", "cddaar", "cddadr", "cdddar", "cddddr"];

	cadrFuncNames.forEach(function(funcName){
		var argName = "args";
		var exp = argName;
		var cs = funcName.split('').slice(1, funcName.length - 1);
		for(var i = cs.length - 1; i >= 0; i--)
			exp = (cs[i] == 'a' ? "scheme.car" : "scheme.cdr") + "(" +  exp + ")";
		var func = new Function(argName, "return " + exp);
		var mfunName = 'm' + funcName;
		var mfunc = new Function(argName, "return " + ("scheme." + funcName + "(scheme.car(args))"));
		s[funcName] = func;
		s[mfunName] = mfunc;
	});
}
genCadrProcedures();


s.isTrue = function(obj) {
	return obj != s.False;
}
s.isFalse = function(obj) {
	return obj == s.False;
}

/*
实际参数列表表示为被实现语言Scheme中的表，例如第一个参数是car(args)
*/
function mcons(args){
	return s.cons(s.car(args), s.cadr(args));
}
function mcar(args) {
	var obj = s.car(args);
	if(obj.isPair())
		return s.car(obj);
	else
		return s.makeContractViolationError("mcar", args, "mpair?", obj);
}
function mcdr(args) {
	var obj = s.car(args);
	if(obj.isPair())
		return s.cdr(obj);
	else
		return s.makeContractViolationError("mcdr", args, "mpair?", obj);
}

function setCar(args) {
	var pair = s.car(args);
	if(!pair.isPair())
		return s.makeContractViolationError("set-car!", args, "mpair?", pair);
	var pcar = s.cadr(args);
	pair.data[0] = pcar;
	return s.voidValue;
}
function setCdr(args) {
	var pair = s.car(args);
	if(!pair.isPair())
		return s.makeContractViolationError("set-car!", args, "mpair?", pair);
	var pcdr = s.cadr(args);
	pair.data[1] = pcdr;
	return s.voidValue;
}

function mlist(args) {
	return args;
}
function mlistRef(args) {
	var pair = s.car(args);
	if(!pair.isPair())
		return s.makeContractViolationError("list-ref", args, "mpair?", pair);
	var index = s.cadr(args).data;
	for(var i = 0; i < index; i++)
		pair = s.cdr(pair);
	return s.car(pair);
}

function sum(args) {
	var array = s.listToArray(args);
	var sum = 0;
	var obj;
	for(var i = 0; i < array.length; i++) {
		obj = array[i];
		if(obj.isNumber())
			sum += obj.data;
		else
			return s.makeContractViolationError("+", args, "number?", obj, i);
	}
	return ScmObject.makeReal(sum);
}

function mul(args) {
	var array = s.listToArray(args);
	var result = 1;
	var obj;
	for(var i = 0; i < array.length; i++) {
		obj = array[i];
		if(obj.isNumber())
			result *= obj.data;
		else
			return s.makeContractViolationError("*", args, "number?", obj, i);
	}
	return ScmObject.makeReal(result);
}

function sub(args) {
	var array = s.listToArray(args);
	var result = array.length == 1 ? 0 : array[0].data;
	var obj;
	for(var i = 0; i < array.length; i++) {
		obj = array[i];
		if(obj.isNumber())
			result -= obj.data;
		else
			return s.makeContractViolationError("-", args, "number?", obj, i);
	}
	return ScmObject.makeReal(result);
}

function div(args) {
	var array = s.listToArray(args);
	var result = array.length == 1 ? 1 : array[0].data;
	var obj;
	for(var i = 0; i < array.length; i++) {
		obj = array[i];
		if(obj.isNumber()) {
			if(obj.data != 0)
				result /= obj.data;
			else
				return s.makeError("/", "division by zero");
		}
		else
			return s.makeContractViolationError("/", args, "number?", obj, i);
	}
	return ScmObject.makeReal(result);
}

function equalNumber(args) {
	var array = s.listToArray(args);
	var first = array[0];
	var obj;
	if(!first.isNumber())
		return s.makeContractViolationError("=", args, "number?", obj, 0);
	for(var i = 0; i < array.length; i++) {
		obj = array[i];
		if(obj.isNumber()) {
			if(first.data != obj.data)
				return s.False;
		}
		else
			return s.makeContractViolationError("=", args, "number?", obj, i);
	}
	return s.True;
}

function equalObjectRef(args) {
	var x = s.car(args);
	var y = s.cadr(args);
	if(x.type != y.type)
		return s.False;
	if(x.isNumber() || x.isChar() || x.isString() || x.isBoolean)
		return ScmObject.getBoolean(x.data == y.data);
	else
		return ScmObject.getBoolean(x == y);
}

function lessThan(args) {
	var array = s.listToArray(args);
	var obj1, obj2;
	for(var i = 0; i < array.length - 1; i++) {
		obj1 = array[i];
		obj2 = array[i + 1];
		if(!obj1.isReal())
			return s.makeContractViolationError("<", args, "real?", obj, i);
		if(!obj2.isReal())
			return s.makeContractViolationError("<", args, "real?", obj, i + 1);
		if(obj1.data >= obj2.data)
			return s.False;
	}
	return s.True;
}
function greaThan(args) {
	var array = s.listToArray(args);
	var obj1, obj2;
	for(var i = 0; i < array.length - 1; i++) {
		obj1 = array[i];
		obj2 = array[i + 1];
		if(!obj1.isReal())
			return s.makeContractViolationError(">", args, "real?", obj, i);
		if(!obj2.isReal())
			return s.makeContractViolationError(">", args, "real?", obj, i + 1);
		if(obj1.data <= obj2.data)
			return s.False;
	}
	return s.True;
}

function lteq(args) {
	var array = s.listToArray(args);
	var obj1, obj2;
	for(var i = 0; i < array.length - 1; i++) {
		obj1 = array[i];
		obj2 = array[i + 1];
		if(!obj1.isReal())
			return s.makeContractViolationError("<=", args, "real?", obj, i);
		if(!obj2.isReal())
			return s.makeContractViolationError("<=", args, "real?", obj, i + 1);
		if(obj1.data > obj2.data)
			return s.False;
	}
	return s.True;
}

function gteq(args) {
	var array = s.listToArray(args);
	var obj1, obj2;
	for(var i = 0; i < array.length - 1; i++) {
		obj1 = array[i];
		obj2 = array[i + 1];
		if(!obj1.isReal())
			return s.makeContractViolationError(">=", args, "real?", obj, i);
		if(!obj2.isReal())
			return s.makeContractViolationError(">=", args, "real?", obj, i + 1);
		if(obj1.data < obj2.data)
			return s.False;
	}
	return s.True;
}

function not(args) {
	return ScmObject.getBoolean(! s.car(args).data);
}

function and(objs) {
	objs = s.listToArray(objs);
	for(var i = 0; i < objs.length; i++)
		if(s.isFalse(objs[i]))
			return objs[i];
	return s.True;
}

function or(objs) {
	objs = s.listToArray(objs);
	for(var i = 0; i < objs.length; i++)
		if(s.isTrue(objs[i]))
			return objs[i];
	return s.False;
}

function isInteger(args) { return ScmObject.getBoolean(s.car(args).isInteger()); }
function isReal(args) { return ScmObject.getBoolean(s.car(args).isReal()); }
function isNumber(args) { return ScmObject.getBoolean(s.car(args).isNumber()); }
function isChar(args) { return ScmObject.getBoolean(s.car(args).isChar()); }
function isString(args) { return ScmObject.getBoolean(s.car(args).isString()); }
function isBoolean(args) { return ScmObject.getBoolean(s.car(args).isBoolean()); }
function isSymbol(args) { return ScmObject.getBoolean(s.car(args).isSymbol()); }
function isList(args) {
	// 空表或者含有空表的序对
	var obj = s.car(args);
	var b = false;
	for(; !b && obj.isPair(); obj = s.cdr(obj))
		if(s.car(obj).isEmptyList())
			b = true;
	if(!b && obj.isEmptyList())
		b = true;
	return ScmObject.getBoolean(b);
}
function isPair(args) { return ScmObject.getBoolean(s.car(args).isPair()); }
function isNull(args) { return ScmObject.getBoolean(s.car(args).isEmptyList());  }
function isProcedure(args) { return ScmObject.getBoolean(s.car(args).isProcedure()); }
function isNamespace(args) { return ScmObject.getBoolean(s.car(args).isNamespace());  }
function display(args) {
	var val = s.printObj(s.car(args));
	if(val != null)
		s.console.value += val;
	return s.voidValue;
}
function newline(args) {
	s.console.value += "\n";
}

function meval(args) {
	var exp = s.car(args);
	var env = s.cadr(args);
	if(!env.isNamespace())
		return s.makeContractViolationError("meval", args, "namespace?", env);
	return s.evaluate(exp, env.data);
}
function mapply(args) {
	var procedure = s.car(args);
	if(!procedure.isProcedure())
		return s.makeContractViolationError("mapply", args, "procedure?", procedure);
	var argvs = s.cadr(args);
	if(!argvs.isPair())
		return s.makeContractViolationError("mapply", args, "pair?", argvs);
	return s.apply(procedure, argvs);
}

function interactionEnvironment() {
	return ScmObject.makeNamespace(s.globalEnvironment);
}

function stringToNumber(args) {
	var obj = s.car(args);
	if(!obj.isString())
		return s.makeContractViolationError("string->number", args, "string?", obj);
	return ScmObject.makeReal(parseFloat(obj.data));
}


function clientjsAlert(args) {
	var msg = args.isEmptyList() ? "" : s.car(args).data;
	return alert(msg);
}
function clientjsPrompt(args) {
	args = s.listToArray(args);
	var msg = args[0] ? args[0].data : "";
	var val = args[1] ? args[1].data : "";
	return new s.ScmObject.makeString(prompt(msg, val));
}
function clientjsConfirm(args) {
	var msg = args.isEmptyList() ? "" : s.car(args).data;
	return new s.ScmObject.getBoolean(confirm(msg));
}
function randomInt(args) {
	var n = s.car(args).data;
	var m = s.cadr(args).data;
	return s.ScmObject.makeInt(Math.floor(Math.random() * (m - n)) + n);
}


})(scheme);
