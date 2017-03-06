var scheme = {};
(function(s){
"use strict";

s.Object = function(type, val) {
    this.type = type;
    this.val = val;
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
    this.isJSObject = function() { return this.type == 30; }
    this.isUnspecified = function() { return this.type == 40; }
}

s.PrimitiveProcedure = function(name, func, minArgs, maxArgs) {
    var arity = [];
    if(minArgs !== undefined)
        arity.push(minArgs);
    if(maxArgs !== undefined)
        arity.push(maxArgs);
    
    this.getName = function(proc) { return name; }
    this.getFunc = function(proc) { return func; }
    this.getArity = function(proc) { return arity; }
}
s.makePrimitiveProcedure = function(name, func, minArgs, maxArgs) {
    return new s.Object(8, new s.PrimitiveProcedure(name, func, minArgs, maxArgs));
}

s.CompoundProcedure = function(name, parameters, body, env, minArgs, maxArgs) {
    var arity = [];
    if(minArgs !== undefined)
        arity.push(minArgs);
    if(maxArgs !== undefined)
        arity.push(maxArgs);
    
    this.getName = function() { return name; }
    this.setName = function(_name) { name = _name; }
    this.getParamters = function() { return parameters; }
    this.getBody = function() { return body; }
    this.getArity = function() { return arity; }
    this.getEnv = function() { return env; }    //this env is pointer!
}
s.makeCompoundProcedure = function(name, parameters, body, env, minArgs, maxArgs) {
    return new s.Object(9, new s.CompoundProcedure(name, parameters, body, env, minArgs, maxArgs));
}

s.makeUnspecified = function() {
    return new s.Object(40, undefined);
}

s.voidValue = s.makeUnspecified();

})(scheme);
