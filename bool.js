(function(s){
"use strict";

var ScmObject = s.ScmObject;

s.initBool = function() {
	var addGlobalPrimProc = s.addGlobalPrimProc;
	
	addGlobalPrimProc("boolean?", isBoolean, 1);
	addGlobalPrimProc("not", not, 1);
	addGlobalPrimProc("and", and, 0, -1);
	addGlobalPrimProc("or", or, 0, -1);
	addGlobalPrimProc("eq?", eq, 2);
	addGlobalPrimProc("equal?", equal, 2);
}

ScmObject.makeBoolean = function(data) {
	return new ScmObject(5, data);
}

s.True = ScmObject.makeBoolean(true);
s.False = ScmObject.makeBoolean(false);

s.isTrue = function(obj) {
	return obj != s.False;
}
s.isFalse = function(obj) {
	return obj == s.False;
}

ScmObject.getBoolean = function(data) {
	return data ? s.True : s.False;
}

function isBoolean(argv) {
	return ScmObject.getBoolean(argv[0].isBoolean());
}

function not(argv) {
	return ScmObject.getBoolean(!argv[0].data);
}

function and(argv) {
	if(argv.length == 0)
		return s.True;
	var i;
	for(i = 0; i < argv.length; i++)
		if(s.isFalse(argv[i]))
			return argv[i];
	return argv[i - 1];
}

function or(argv) {
	if(argv.length == 0)
		return s.False;
	var i;
	for(i = 0; i < argv.length; i++)
		if(s.isTrue(argv[i]))
			return argv[i];
	return argv[i - 1];
}

function eq(argv) {
	var x = argv[0];
	var y = argv[1];
	if(x.type != y.type)
		return s.False;
	if(x.isNumber() || x.isChar() || x.isString() || x.isBoolean)
		return ScmObject.getBoolean(x.data == y.data);
	else
		return ScmObject.getBoolean(x == y);
}

function equal(argv) {
	return eq(argv);
}
})(scheme);
