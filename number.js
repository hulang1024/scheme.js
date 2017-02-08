(function(s){
"use strict";

s.initNumber = function() {
	s.addGlobalPrimProc("integer?", integer_p, 1);
	s.addGlobalPrimProc("real?", real_p, 1);
	s.addGlobalPrimProc("number?", number_p, 1);
	
	s.addGlobalPrimProc("+", sum, 0, -1);
	s.addGlobalPrimProc("-", sub, 1, -1);
	s.addGlobalPrimProc("*", mul, 0, -1);
	s.addGlobalPrimProc("/", div, 1, -1);
	
	s.addGlobalPrimProc("=", equalNumber, 2, -1);
	s.addGlobalPrimProc("<", lessThan, 2, -1);
	s.addGlobalPrimProc(">", greaThan, 2, -1);
	s.addGlobalPrimProc("<=", lteq, 2, -1);
	s.addGlobalPrimProc(">=", gteq, 2, -1);
	
	s.addGlobalPrimProc("string->number", stringToNumber, 1);
	s.addGlobalPrimProc("number->string", numberToString, 1);
}

s.makeInt = function(val) {
	return new s.Object(1, val);
}
s.intVal = function(obj) { return obj.val; }

s.makeReal = function(val) {
	return new s.Object(2, val);
}
s.floatVal = function(obj) { return obj.val; }

function integer_p(argv) {
	return s.getBoolean(argv[0].isInteger());
}

function real_p(argv) {
	return s.getBoolean(argv[0].isReal());
}

function number_p(argv) {
	return s.getBoolean(argv[0].isNumber());
}

function sum(argv) {
	var sum = 0;
	var obj;
	for(var i = 0; i < argv.length; i++) {
		obj = argv[i];
		if(obj.isNumber())
			sum += obj.val;
		else
			return s.wrongContract("+", "number?", i, argv);
	}
	return s.makeReal(sum);
}

function mul(argv) {
	var result = 1;
	var obj;
	for(var i = 0; i < argv.length; i++) {
		obj = argv[i];
		if(obj.isNumber())
			result *= obj.val;
		else
			return s.wrongContract("*", "number?", i, argv);
	}
	return s.makeReal(result);
}

function sub(argv) {
	var result;
	var obj;
	if(argv.length > 1) {
		result = argv[0].val;
		for(var i = 1; i < argv.length; i++) {
			obj = argv[i];
			if(obj.isNumber())
				result -= obj.val;
			else
				return s.wrongContract("-", "number?", i, argv);
		}
	} else {
		obj = argv[0];
		if(obj.isNumber())
			result = - obj.val;
		else
			return s.wrongContract("-", "number?", 0, argv);
	}
	return s.makeReal(result);
}

function div(argv) {
	var result;
	var obj;
	if(argv.length > 1) {
		result = argv[0].val;
		for(var i = 1; i < argv.length; i++) {
			obj = argv[i];
			if(obj.isNumber()) {
				if(obj.val != 0)
					result /= obj.val;
				else
					return s.makeError("/", "division by zero");
			}
			else
				return s.wrongContract("/", "number?", i, argv);
		}
	} else {
		obj = array[0];
		if(obj.isNumber())
			result = 1 / obj.val;
		else
			return s.wrongContract("/", "number?", 0, argv);
	}
	return s.makeReal(result);
}

function equalNumber(argv) {
	var first = argv[0];
	var obj;
	if(!first.isNumber())
		return s.wrongContract("=", "number?", 0, argv);
	for(var i = 0; i < argv.length; i++) {
		obj = argv[i];
		if(obj.isNumber()) {
			if(first.val != obj.val)
				return s.False;
		}
		else
			return s.wrongContract("=", "number?", i, argv);
	}
	return s.True;
}

function lessThan(argv) {
	var obj1, obj2;
	for(var i = 0; i < argv.length - 1; i++) {
		obj1 = argv[i];
		obj2 = argv[i + 1];
		if(!obj1.isReal())
			return s.wrongContract("<", "real?", i, argv);
		if(!obj2.isReal())
			return s.wrongContract("<", "real?", i+1, argv);
		if(obj1.val >= obj2.val)
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
			return s.wrongContract(">", "real?", i, argv);
		if(!obj2.isReal())
			return s.wrongContract(">", "real?", i+1, argv);
		if(obj1.val <= obj2.val)
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
			return s.wrongContract("<=", "real?", i, argv);
		if(!obj2.isReal())
			return s.wrongContract("<=", "real?", i+1, argv);
		if(obj1.val > obj2.val)
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
			return s.wrongContract(">=", "real?", i, argv);
		if(!obj2.isReal())
			return s.wrongContract(">=", "real?", i+1, argv);
		if(obj1.val < obj2.val)
			return s.False;
	}
	return s.True;
}

function stringToNumber(argv) {
    var obj = argv[0];
    if(!obj.isString())
        return s.wrongContract("string->number", "string?", 0, argv);
    return s.makeReal(parseFloat(obj.val));
}

function numberToString(argv) {
    var obj = argv[0];
    if(!obj.isNumber())
        return s.wrongContract("number->string", "number?", 0, argv);
    return s.makeString(obj.val.toString());
}

})(scheme);
