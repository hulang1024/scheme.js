(function(s) {
"use strict";
var ScmObject = s.ScmObject;

var cadrFuncNames = [
	"caar", "cadr", "cdar", "cddr",
	"caaar", "caadr", "cadar", "caddr", "cdaar", "cdadr", "cddar", "cdddr",
	"caaaar", "caaadr", "caadar", "caaddr", "cadaar", "cadadr", "caddar",
		"cadddr", "cdaaar", "cdaadr", "cdadar", "cdaddr", "cddaar", "cddadr", "cdddar", "cddddr"];

function genCadrProcedures() {
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

(function() {
	var addGlobalPrimProc = s.addGlobalPrimProc;

	addGlobalPrimProc("+", sum, 0, -1);
	addGlobalPrimProc("-", sub, 1, -1);
	addGlobalPrimProc("*", mul, 0, -1);
	addGlobalPrimProc("/", div, 1, -1);
	
	addGlobalPrimProc("=", equalNumber, 2, -1);
	addGlobalPrimProc("<", lessThan, 2, -1);
	addGlobalPrimProc(">", greaThan, 2, -1);
	addGlobalPrimProc("<=", lteq, 2, -1);
	addGlobalPrimProc(">=", gteq, 2, -1);
	
	addGlobalPrimProc("not", not, 1);
	addGlobalPrimProc("car", mcar, 1);
	addGlobalPrimProc("cdr", mcdr, 1);
	addGlobalPrimProc("cons", mcons, 2);
	addGlobalPrimProc("set-car!", setCar, 2);
	addGlobalPrimProc("set-cdr!", setCdr, 2);
	addGlobalPrimProc("list", mlist, 0, -1);
	addGlobalPrimProc("list-ref", mlistRef, 2);
	addGlobalPrimProc("for-each", mforEach, 2);

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
	
	addGlobalPrimProc("and", and, 0, -1);
	addGlobalPrimProc("or", or, 0, -1);
	
	addGlobalPrimProc("string->number", stringToNumber, 1);
	addGlobalPrimProc("number->string", numberToString, 1);
	
	// string
	addGlobalPrimProc("make-string", makeString, 1, 2);
	addGlobalPrimProc("string", string, 0, -1);
	addGlobalPrimProc("string-length", stringLength, 1);
	addGlobalPrimProc("string-ref", stringRef, 2);
	addGlobalPrimProc("string-set!", stringSet, 3);
	addGlobalPrimProc("string=?", stringEqual, 2);
	addGlobalPrimProc("string-ci=?", stringCIEqual, 2);
	addGlobalPrimProc("substring", substring, 3);
	addGlobalPrimProc("string->list", stringToList, 1);
	addGlobalPrimProc("list->string", listToString, 1);
	addGlobalPrimProc("string-copy", stringCopy, 1);
	addGlobalPrimProc("string-fill!", stringFill, 2);
	addGlobalPrimProc("string-append", stringAppend, 0, -1);
	
	addGlobalPrimProc("apply", mapply, 2);
	
	// evaluation
	addGlobalPrimProc("eval", meval, 2);
	addGlobalPrimProc("interaction-environment", interactionEnvironment);
	
	addGlobalPrimProc("display", display, 1);
	addGlobalPrimProc("newline", newline, 0);

	cadrFuncNames.forEach(function(funcName){
		addGlobalPrimProc(funcName, eval('scheme.m'+funcName), 1);
	});

})();



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
		return s.wrongContract("mcar", args, "mpair?", obj, 0);
}

function mcdr(args) {
	var obj = s.car(args);
	if(obj.isPair())
		return s.cdr(obj);
	else
		return s.wrongContract("mcdr", args, "mpair?", obj, 0);
}

function setCar(args) {
	var pair = s.car(args);
	if(!pair.isPair())
		return s.wrongContract("set-car!", args, "mpair?", pair, 0);
	var pcar = s.cadr(args);
	s.setCar(pair, pcar);
	return s.voidValue;
}

function setCdr(args) {
	var pair = s.car(args);
	if(!pair.isPair())
		return s.wrongContract("set-car!", args, "mpair?", pair, 0);
	var pcdr = s.cadr(args);
	s.setCdr(pair, pcdr);
	return s.voidValue;
}

function mlist(args) {
	return args;
}

function mlistRef(args) {
	var pair = s.car(args);
	if(!pair.isPair())
		return s.wrongContract("list-ref", args, "mpair?", pair, 0);
	var index = s.cadr(args).data;
	for(var i = 0; i < index; i++)
		pair = s.cdr(pair);
	return s.car(pair);
}

function mforEach(args) {
	var proc = s.car(args);
	if(!proc.isProcedure())
		return s.wrongContract("mfor-each", args, "procedure?", proc, 0);
	var list = s.cadr(args);
	if(!list.isPair())
		return s.wrongContract("mfor-each", args, "pair?", list, 1);
	
	while(!list.isEmptyList()) {
		s.apply(proc, s.cons(s.car(list), s.nil));
		list = s.cdr(list);
	}
	return s.ok;
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
			return s.wrongContract("+", args, "number?", obj, i);
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
			return s.wrongContract("*", args, "number?", obj, i);
	}
	return ScmObject.makeReal(result);
}

function sub(args) {
	var array = s.listToArray(args);
	var result;
	var obj;
	if(array.length > 1) {
		result = array[0].data;
		for(var i = 1; i < array.length; i++) {
			obj = array[i];
			if(obj.isNumber())
				result -= obj.data;
			else
				return s.wrongContract("-", args, "number?", obj, i);
		}
	} else {
		obj = array[0];
		if(obj.isNumber())
			result = - obj.data;
		else
			return s.wrongContract("-", args, "number?", obj, 0);
	}
	return ScmObject.makeReal(result);
}

function div(args) {
	var array = s.listToArray(args);
	var result;
	var obj;
	if(array.length > 1) {
		result = array[0].data;
		for(var i = 1; i < array.length; i++) {
			obj = array[i];
			if(obj.isNumber()) {
				if(obj.data != 0)
					result /= obj.data;
				else
					return s.makeError("/", "division by zero");
			}
			else
				return s.wrongContract("/", args, "number?", obj, i);
		}
	} else {
		obj = array[0];
		if(obj.isNumber())
			result = 1 / obj.data;
		else
			return s.wrongContract("/", args, "number?", obj, 0);
	}
	return ScmObject.makeReal(result);
}

function equalNumber(args) {
	var array = s.listToArray(args);
	var first = array[0];
	var obj;
	if(!first.isNumber())
		return s.wrongContract("=", args, "number?", obj, 0);
	for(var i = 0; i < array.length; i++) {
		obj = array[i];
		if(obj.isNumber()) {
			if(first.data != obj.data)
				return s.False;
		}
		else
			return s.wrongContract("=", args, "number?", obj, i);
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
			return s.wrongContract("<", args, "real?", obj, i);
		if(!obj2.isReal())
			return s.wrongContract("<", args, "real?", obj, i + 1);
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
			return s.wrongContract(">", args, "real?", obj, i);
		if(!obj2.isReal())
			return s.wrongContract(">", args, "real?", obj, i + 1);
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
			return s.wrongContract("<=", args, "real?", obj, i);
		if(!obj2.isReal())
			return s.wrongContract("<=", args, "real?", obj, i + 1);
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
			return s.wrongContract(">=", args, "real?", obj, i);
		if(!obj2.isReal())
			return s.wrongContract(">=", args, "real?", obj, i + 1);
		if(obj1.data < obj2.data)
			return s.False;
	}
	return s.True;
}

function not(args) {
	return ScmObject.getBoolean(! s.car(args).data);
}

function and(objs) {
	if(objs.isEmptyList())
		return s.True;
	
	objs = s.listToArray(objs);
	var i;
	for(i = 0; i < objs.length; i++)
		if(s.isFalse(objs[i]))
			return objs[i];
	return objs[i - 1];
}

function or(objs) {
	if(objs.isEmptyList())
		return s.False;
	objs = s.listToArray(objs);
	var i;
	for(i = 0; i < objs.length; i++)
		if(s.isTrue(objs[i]))
			return objs[i];
	return objs[i - 1];
}

function isInteger(args) { return ScmObject.getBoolean(s.car(args).isInteger()); }
function isReal(args) { return ScmObject.getBoolean(s.car(args).isReal()); }
function isNumber(args) { return ScmObject.getBoolean(s.car(args).isNumber()); }
function isChar(args) { return ScmObject.getBoolean(s.car(args).isChar()); }
function isString(args) { return ScmObject.getBoolean(s.car(args).isString()); }
function isBoolean(args) { return ScmObject.getBoolean(s.car(args).isBoolean()); }
function isSymbol(args) { return ScmObject.getBoolean(s.car(args).isSymbol()); }
function isList(args) {
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
	var val = s.printObj(s.car(args), true);
	if(val != null)
		s.console.value += val;
	return s.voidValue;
}
function newline(args) {
	s.console.value += "\n";
	return s.voidValue;
}

function meval(args) {
	var exp = s.car(args);
	var env = s.cadr(args);
	if(!env.isNamespace())
		return s.wrongContract("meval", args, "namespace?", env);
	return s.evaluate(exp, env.data);
}
function mapply(args) {
	var procedure = s.car(args);
	if(!procedure.isProcedure())
		return s.wrongContract("mapply", args, "procedure?", procedure);
	var argvs = s.cadr(args);
	if(!argvs.isPair())
		return s.wrongContract("mapply", args, "pair?", argvs);
	return s.apply(procedure, argvs);
}

function interactionEnvironment() {
	return ScmObject.makeNamespace(s.globalEnvironment);
}

function stringToNumber(args) {
	var obj = s.car(args);
	if(!obj.isString())
		return s.wrongContract("string->number", args, "string?", obj);
	return ScmObject.makeReal(parseFloat(obj.data));
}

function numberToString(args) {
	var obj = s.car(args);
	if(!obj.isNumber())
		return s.wrongContract("number->string", args, "number?", obj);
	return ScmObject.makeString(obj.data.toString());
}


//------------------
// string
//------------------
function makeString(args, argc) {
	var k = s.car(args);
	if(!isExactNonnegativeInteger(k))
		return s.wrongContract("make->string", args, "exact-nonnegative-integer?", k, 0);
	var c = ScmObject.makeChar('\0');
	if(argc == 2) {
		c = s.cadr(args);
		if(!c.isChar())
			return s.wrongContract("make->string", args, "char?", c, 1);
	}
	k = s.intVal(k);
	c = s.charVal(c);
	var charArray = [];
	for(; k > 0; k--) {
		charArray.push(c);
	}
	return ScmObject.makeString(charArray);
}

function string(args) {
	var charArray = [];
	var list = args, obj, i = 0;
	for(; !list.isEmptyList(); list = s.cdr(list), i++) {
		obj = s.car(list);
		if(!obj.isChar())
			return s.wrongContract("string", args, "char?", obj, i);
		charArray.push(s.charVal(obj));
	}
	return ScmObject.makeString(charArray);
}

function stringLength(args) {
	var obj = s.car(args);
	if(!obj.isString())
		return s.wrongContract("string-length", args, "string?", obj, 0);
	return ScmObject.makeInt(s.stringLen(obj));
}

function stringRef(args) {
	var str = s.car(args);
	var k = s.cadr(args);
	if(!str.isString())
		return s.wrongContract("string-ref", args, "string?", str, 0);
	if(!isExactNonnegativeInteger(k))
		return s.wrongContract("string-ref", args, "exact-nonnegative-integer?", k, 1);
	k = s.intVal(k);
	if(indexRangeCheck("string-ref", "string", k, -1, s.stringLen(str), str))
		return ScmObject.makeChar(s.charArrayVal(str)[k]);
}

function stringSet(args) {
	var str = s.listRef(args, 0);
	var k = s.listRef(args, 1);
	var c = s.listRef(args, 2);

	if(!str.isString())
		return s.wrongContract("string-set!", args, "string?", str, 0);
	if(!isExactNonnegativeInteger(k))
		return s.wrongContract("string-set!", args, "exact-nonnegative-integer?", k, 1);
	if(!c.isChar())
		return s.wrongContract("string-set!", args, "char?", c, 2);
	k = s.intVal(k);
	if(indexRangeCheck("string-set!", "string", k, -1, s.stringLen(str), str)) {
		s.charArrayVal(str)[k] = s.charVal(c);
		return s.voidValue;
	}
}

function stringEqual(args) {
	var str1 = s.car(args);
	var str2 = s.cadr(args);
	if(!str1.isString())
		return s.wrongContract("string=?", args, "string?", str1, 0);
	if(!str2.isString())
		return s.wrongContract("string=?", args, "string?", str2, 1);
	return ScmObject.getBoolean(s.stringVal(str1) == s.stringVal(str2));
}

function stringCIEqual(args) {
	var str1 = s.car(args);
	var str2 = s.cadr(args);
	if(!str1.isString())
		return s.wrongContract("string=?", args, "string?", str1, 0);
	if(!str2.isString())
		return s.wrongContract("string=?", args, "string?", str2, 1);
	return ScmObject.getBoolean(
		s.stringVal(str1).toLowerCase() == s.stringVal(str2).toLowerCase());
}

function substring(args) {
	var str = s.listRef(args, 0);
	var start = s.listRef(args, 1);
	var end = s.listRef(args, 2);
	if(!str.isString())
		return s.wrongContract("substring", args, "string?", str, 0);
	if(!isExactNonnegativeInteger(start))
		return s.wrongContract("substring", args, "exact-nonnegative-integer?", start, 1);
	if(!isExactNonnegativeInteger(end))
		return s.wrongContract("substring", args, "exact-nonnegative-integer?", end, 2);
	start = s.intVal(start);
	end = s.intVal(end);
	if(indexRangeCheck("substring", "string", start, end, s.stringLen(str), str)) {
		return ScmObject.makeString(s.charArrayVal(str).slice(start, end));
	}
}

function stringAppend(args) {
	var charArray = [];
	var list = args, obj, i = 0;
	for(; !list.isEmptyList(); list = s.cdr(list), i++) {
		obj = s.car(list);
		if(!obj.isString())
			return s.wrongContract("string->append", args, "string?", obj, i);
		charArray = charArray.concat(s.charArrayVal(obj));
	}
	return ScmObject.makeString(charArray);
}

function stringToList(args) {
	var obj = s.car(args);
	if(!obj.isString())
		return s.wrongContract("string->list", args, "string?", obj, 0);
	var list = s.nil;
	for(var charArray = s.stringVal(obj), i = charArray.length - 1; i >= 0; i--) {
		list = s.cons(ScmObject.makeChar(charArray[i]), list);
	}
	return list;
}

function listToString(args) {
	var list = s.car(args);
	if(!s.isList(list))
		return s.wrongContract("list->string", args, "list?", list, 0);
	var obj;
	var charArray = [];
	for(var i = 0; !list.isEmptyList(); list = s.cdr(list), i++) {
		obj = s.car(list);
		if(!obj.isChar())
			return s.wrongContract("list->string", args, "char?", obj, i);
		charArray.push(s.charVal(obj));
	}
	return ScmObject.makeString(charArray);
}

function stringCopy(args) {
	var str = s.car(args);
	if(!str.isString())
		return s.wrongContract("string-copy", args, "string?", str, 0);
	return ScmObject.makeString(s.charArrayVal(str).slice(0));
}

function stringFill(args) {
	var str = s.car(args);
	var c = s.cadr(args);
	if(!str.isString())
		return s.wrongContract("string-fill!", args, "string?", str, 0);
	if(!c.isChar())
		return s.wrongContract("string-fill!", args, "char?", c, 1);
	c = s.charVal(c);
	var charArray = s.charArrayVal(str);
	for(var i in charArray)
		charArray[i] = c;
	return s.voidValue;
}


//--------------------
//contract & check functions
//--------------------
//exact-nonnegative-integer?
function isExactNonnegativeInteger(obj) {
	return obj.isInteger() && s.intVal(obj) >= 0;
}

function indexRangeCheck(procedureName, type, startIndex, endIndex, length, obj) {
	var invalid = false;
	if(endIndex == -1) {
		if(startIndex >= length || length == 0)
			invalid = "index";
	}
	else if(!(0 <= startIndex && startIndex <= endIndex && startIndex <= length))
		invalid = "starting";
	else if(endIndex > length)
		invalid = "ending";
	if(invalid)
		return s.makeIndexOutRangeError(procedureName, type, startIndex, endIndex, invalid, length, obj);

	return true;
}

})(scheme);
