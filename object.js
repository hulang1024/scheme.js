var scheme = {};
(function(s){
"use strict";

s.ScmObject = function(type, data) {
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
	this.isVector = function() { return this.type == 11; }
	this.isMyObject = function() { return this.type == 30; }
}
var ScmObject = s.ScmObject;


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


ScmObject.makeCompProc = function(name, parameters, body, env, minArgs, maxArgs) {
	var arity = [];
	if(minArgs !== undefined)
		arity.push(minArgs);
	if(maxArgs !== undefined)
		arity.push(maxArgs);
	return new ScmObject(9, [parameters, body, env, name, arity]);
}
s.compProcParamters = function(proc) { return proc.data[0]; }
s.compProcBody = function(proc) { return proc.data[1]; }
s.compProcEnv = function(proc) { return proc.data[2]; }
s.compProcName = function(proc) { return proc.data[3] }
s.compProcArity = function(proc) { return proc.data[4]; }
s.setCompProcName = function(proc, name) { return proc.data[3] = name; }


ScmObject.makeUnspecified = function() {
	return new ScmObject(11, undefined);
}

// 基本常量值

s.ok = ScmObject.makeUnspecified();
s.voidValue = ScmObject.makeUnspecified();

})(scheme);
