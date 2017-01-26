var scheme = {};
(function(s){
"use strict";

s.ScmObject = function(type, data) {
	/*
	integer=1,real=2,char=3,string=4,boolean=5,symbol=6,pair=7,primitive_procedure=8,compound_procedure=9,EmptyList=0,10=namespace,11=Unspecified
	*/
	this.type = type;
	this.data = data;
	this.isInteger = function() { return this.type == 1; }
	this.isReal = function() { return this.type == 1 || this.type == 2; }
	this.isNumber = function() { return this.type == 1 || this.type == 2; }
	this.isChar = function() { return this.type == 3 }
	this.isString = function() { return this.type == 4; }
	this.isBoolean = function() { return this.type == 5; }
	this.isSymbol = function() { return this.type == 6; }
	this.isPair = function() { return this.type == 7; }
	this.isPrimProc = function() { return this.type == 8; }
	this.isCompProc = function() { return this.type == 9; }
	this.isProcedure = function() { return this.type == 8 || this.type == 9; }
	this.isEmptyList = function() { return this.type == 0; }
	this.isNamespace = function() { return this.type == 10; }
}
var ScmObject = s.ScmObject;

ScmObject.makeInt = function(data) {
	return new ScmObject(1, data);
}
ScmObject.makeReal = function(data) {
	return new ScmObject(2, data);
}
ScmObject.makeChar = function(data) {
	return new ScmObject(3, data);
}
ScmObject.makeString = function(data) {
	return new ScmObject(4, data);
}
ScmObject.makeBoolean = function(data) {
	return new ScmObject(5, data);
}
ScmObject.makeSymbol = function(data) {
	return new ScmObject(6, data);
}

ScmObject.makePair = function(data) {
	return new ScmObject(7, data);
}
s.cons = function(x, y) { return new ScmObject.makePair([x, y]); }
s.car = function(pair) { return pair.data[0]; }
s.cdr = function(pair) { return pair.data[1]; }

ScmObject.makePrimProc = function(name, func, minArgs, maxArgs) {
	var arity = [];
	if(minArgs !== undefined)
		arity.push(minArgs);
	if(maxArgs !== undefined)
		arity.push(maxArgs);
	return new ScmObject(8, [name, func, arity]);
}
s.primProcName = function(proc) { return proc.data[0]; }
s.primProcFunc = function(proc) { return proc.data[1]; }
s.primProcArity = function(proc) { return proc.data[2]; }

ScmObject.makeCompProc = function(parameters, body, env, name) {
	return new ScmObject(9, [parameters, body, env, name]);
}
s.compProcParamters = function(proc) { return proc.data[0]; }
s.compProcBody = function(proc) { return proc.data[1]; }
s.compProcEnv = function(proc) { return proc.data[2]; }
s.compProcName = function(proc) { return proc.data[3] }

ScmObject.makeNamespace = function(env) {
	return new ScmObject(10, env);
}
ScmObject.makeUnspecified = function() {
	return new ScmObject(11, undefined);
}
s.makeError = function() {
	s.error = [].slice.call(arguments, 0);
}
s.makeArityMismatchError = function(procedureName, args, isAtleast, expected, given) {
	s.makeError('arityMismatch', procedureName, s.listToArray(args), isAtleast, expected, given);
}
s.makeContractViolationError = function(procedureName, args, expected, given, argPosition) {
	s.makeError('contractViolation', procedureName, s.listToArray(args), expected, given, argPosition);
}



ScmObject.makeEmptyList = function(data) {
	return new ScmObject(0, null);
}

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

// 基本常量值
s.True = ScmObject.makeBoolean(true);
s.False = ScmObject.makeBoolean(false);
s.nil = ScmObject.makeEmptyList();
s.ok = ScmObject.makeUnspecified();
s.voidValue = ScmObject.makeUnspecified();

ScmObject.getBoolean = function(data) {
	return data ? s.True : s.False;
}

// 符号表
s.symbolMap = {};
s.pushSymbol = function(name) {
	return s.symbolMap[name] = ScmObject.makeSymbol(name);
}
s.getSymbol = function(name) {
	var sym = s.symbolMap[name];
	return sym ? sym : ScmObject.makeSymbol(name);
}
// 基本符号
s.quoteSymbol = s.pushSymbol('quote');
s.ifSymbol = s.pushSymbol('if');
s.defineSymbol = s.pushSymbol('define');
s.assignmentSymbol = s.pushSymbol('set!');
s.lambdaSymbol = s.pushSymbol('lambda');
s.beginSymbol = s.pushSymbol('begin');
s.condSymbol = s.pushSymbol('cond');
s.elseSymbol = s.pushSymbol('else');
s.letSymbol = s.pushSymbol('let');
s.isList = function(obj) {
	for(; obj.isPair(); obj = s.cdr(obj))
		if(s.car(obj).isEmptyList())
			return true;
	return obj.isEmptyList();
}
})(scheme);
