(function(s){
"use strict";

var ScmObject = s.ScmObject;

s.initNumber = function() {
	var addGlobalPrimProc = s.addGlobalPrimProc;
	
	addGlobalPrimProc("integer?", isInteger, 1);
	addGlobalPrimProc("real?", isReal, 1);
	addGlobalPrimProc("number?", isNumber, 1);
	
	addGlobalPrimProc("+", sum, 0, -1);
	addGlobalPrimProc("-", sub, 1, -1);
	addGlobalPrimProc("*", mul, 0, -1);
	addGlobalPrimProc("/", div, 1, -1);
	
	addGlobalPrimProc("=", equalNumber, 2, -1);
	addGlobalPrimProc("<", lessThan, 2, -1);
	addGlobalPrimProc(">", greaThan, 2, -1);
	addGlobalPrimProc("<=", lteq, 2, -1);
	addGlobalPrimProc(">=", gteq, 2, -1);
	
	addGlobalPrimProc("string->number", stringToNumber, 1);
	addGlobalPrimProc("number->string", numberToString, 1);
}


ScmObject.makeInt = function(data) {
	return new ScmObject(1, data);
}
s.intVal = function(obj) { return obj.data; }

ScmObject.makeReal = function(data) {
	return new ScmObject(2, data);
}
s.floatVal = function(obj) { return obj.data; }


function isInteger(argv) {
	return ScmObject.getBoolean(argv[0].isInteger());
}

function isReal(argv) {
	return ScmObject.getBoolean(argv[0].isReal());
}

function isNumber(argv) {
	return ScmObject.getBoolean(argv[0].isNumber());
}

function sum(argv) {
	var sum = 0;
	var obj;
	for(var i = 0; i < argv.length; i++) {
		obj = argv[i];
		if(obj.isNumber())
			sum += obj.data;
		else
			return s.wrongContract("+", argv, "number?", obj, i);
	}
	return ScmObject.makeReal(sum);
}

function mul(argv) {
	var result = 1;
	var obj;
	for(var i = 0; i < argv.length; i++) {
		obj = argv[i];
		if(obj.isNumber())
			result *= obj.data;
		else
			return s.wrongContract("*", argv, "number?", obj, i);
	}
	return ScmObject.makeReal(result);
}

function sub(argv) {
	var result;
	var obj;
	if(argv.length > 1) {
		result = argv[0].data;
		for(var i = 1; i < argv.length; i++) {
			obj = argv[i];
			if(obj.isNumber())
				result -= obj.data;
			else
				return s.wrongContract("-", argv, "number?", obj, i);
		}
	} else {
		obj = argv[0];
		if(obj.isNumber())
			result = - obj.data;
		else
			return s.wrongContract("-", argv, "number?", obj, 0);
	}
	return ScmObject.makeReal(result);
}

function div(argv) {
	var result;
	var obj;
	if(argv.length > 1) {
		result = argv[0].data;
		for(var i = 1; i < argv.length; i++) {
			obj = argv[i];
			if(obj.isNumber()) {
				if(obj.data != 0)
					result /= obj.data;
				else
					return s.makeError("/", "division by zero");
			}
			else
				return s.wrongContract("/", argv, "number?", obj, i);
		}
	} else {
		obj = array[0];
		if(obj.isNumber())
			result = 1 / obj.data;
		else
			return s.wrongContract("/", argv, "number?", obj, 0);
	}
	return ScmObject.makeReal(result);
}

function equalNumber(argv) {
	var first = argv[0];
	var obj;
	if(!first.isNumber())
		return s.wrongContract("=", argv, "number?", obj, 0);
	for(var i = 0; i < argv.length; i++) {
		obj = argv[i];
		if(obj.isNumber()) {
			if(first.data != obj.data)
				return s.False;
		}
		else
			return s.wrongContract("=", argv, "number?", obj, i);
	}
	return s.True;
}

function lessThan(argv) {
	var obj1, obj2;
	for(var i = 0; i < argv.length - 1; i++) {
		obj1 = argv[i];
		obj2 = argv[i + 1];
		if(!obj1.isReal())
			return s.wrongContract("<", argv, "real?", obj, i);
		if(!obj2.isReal())
			return s.wrongContract("<", argv, "real?", obj, i + 1);
		if(obj1.data >= obj2.data)
			return s.False;
	}
	return s.True;
}

function greaThan(argv) {
	var obj1, obj2;
	for(var i = 0; i < argv.length - 1; i++) {
		obj1 = argv[i];
		obj2 = argv[i + 1];
		if(!obj1.isReal())
			return s.wrongContract(">", argv, "real?", obj, i);
		if(!obj2.isReal())
			return s.wrongContract(">", argv, "real?", obj, i + 1);
		if(obj1.data <= obj2.data)
			return s.False;
	}
	return s.True;
}

function lteq(argv) {
	var obj1, obj2;
	for(var i = 0; i < argv.length - 1; i++) {
		obj1 = argv[i];
		obj2 = argv[i + 1];
		if(!obj1.isReal())
			return s.wrongContract("<=", argv, "real?", obj, i);
		if(!obj2.isReal())
			return s.wrongContract("<=", argv, "real?", obj, i + 1);
		if(obj1.data > obj2.data)
			return s.False;
	}
	return s.True;
}

function gteq(argv) {
	var obj1, obj2;
	for(var i = 0; i < argv.length - 1; i++) {
		obj1 = argv[i];
		obj2 = argv[i + 1];
		if(!obj1.isReal())
			return s.wrongContract(">=", argv, "real?", obj, i);
		if(!obj2.isReal())
			return s.wrongContract(">=", argv, "real?", obj, i + 1);
		if(obj1.data < obj2.data)
			return s.False;
	}
	return s.True;
}

function stringToNumber(argv) {
    var obj = argv[0];
    if(!obj.isString())
        return s.wrongContract("string->number", argv, "string?", obj);
    return ScmObject.makeReal(parseFloat(obj.data));
}

function numberToString(argv) {
    var obj = argv[0];
    if(!obj.isNumber())
        return s.wrongContract("number->string", argv, "number?", obj);
    return ScmObject.makeString(obj.data.toString());
}
})(scheme);
