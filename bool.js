(function(s){
"use strict";

var ScmObject = s.ScmObject;

s.initBool = function() {
	s.addGlobalPrimProc("boolean?", boolean_p, 1);
	s.addGlobalPrimProc("not", not, 1);
	s.addGlobalPrimProc("and", and, 0, -1);
	s.addGlobalPrimProc("or", or, 0, -1);
	s.addGlobalPrimProc("eq?", eq, 2);
	s.addGlobalPrimProc("equal?", equal, 2);
}

ScmObject.makeBoolean = function(data) {
	return new ScmObject(5, data);
}

s.True = ScmObject.makeBoolean(true);
s.False = ScmObject.makeBoolean(false);

s.isTrue = function(obj) { return obj != s.False; }
s.isFalse = function(obj) { return obj == s.False; }

ScmObject.getBoolean = function(v) { return v ? s.True : s.False; }

function boolean_p(argv) {
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
