/* scheme module */
var scheme = {};

/* types */
/* number types */
const scheme_integer_type = 1;
const scheme_double_type = 2;
/* procedure types */
const scheme_prim_type = 13;
const scheme_comp_type = 14;
/* other values */
const scheme_char_type = 3;
const scheme_char_string_type = 4;
const scheme_bool_type = 6;
const scheme_symbol_type = 7;
const scheme_pair_type = 5;
const scheme_vector_type = 8;
const scheme_namespace_type = 9;
const scheme_null_type = 10;
const scheme_void_type = 11;
const scheme_primitive_syntax_type = 40;
/* extended types */
const scheme_jsobject_type = 12;

(function(scheme){
"use strict";

scheme.Object = function(type, val) {
    this.type = type;
    this.val = val;
}

scheme.isInteger = function(obj) { return obj.type == scheme_integer_type; }
scheme.isNumber = function(obj) { return obj.type == scheme_integer_type || obj.type == scheme_double_type; }
scheme.isReal = function(obj) { return obj.type == scheme_integer_type || obj.type == scheme_double_type; }
scheme.isChar = function(obj) { return obj.type == scheme_char_type; }
scheme.isString = function(obj) { return obj.type == scheme_char_string_type; }
scheme.isBoolean = function(obj) { return obj.type == scheme_bool_type; }
scheme.isSymbol = function(obj) { return obj.type == scheme_symbol_type; }
scheme.isPair = function(obj) { return obj.type == scheme_pair_type; }
scheme.isEmptyList = function(obj) { return obj.type == scheme_null_type; }
scheme.isVoid = function(obj) { return obj.type == scheme_void_type; }
scheme.isPrim = function(obj) { return obj.type == scheme_prim_type; }
scheme.isComp = function(obj) { return obj.type == scheme_comp_type; }
scheme.isProcedure = function(obj) { return obj.type == scheme_prim_type || obj.type == scheme_comp_type; }
scheme.isNamespace = function(obj) { return obj.type == scheme_namespace_type; }
scheme.isSyntax = function(obj) { return obj.type == scheme_primitive_syntax_type; }
scheme.isJSObject = function(obj) { return obj.type == scheme_jsobject_type; }

scheme.PrimitiveProcedure = function(name, func, minArgs, maxArgs) {
    var arity = [];
    if(minArgs !== undefined)
        arity.push(minArgs);
    if(maxArgs !== undefined)
        arity.push(maxArgs);
    
    this.getName = function(proc) { return name; }
    this.getFunc = function(proc) { return func; }
    this.getArity = function(proc) { return arity; }
}
scheme.makePrimitiveProcedure = function(name, func, minArgs, maxArgs) {
    return new scheme.Object(scheme_prim_type, new scheme.PrimitiveProcedure(name, func, minArgs, maxArgs));
}

scheme.CompoundProcedure = function(name, parameters, body, env, minArgs, maxArgs) {
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
    this.getEnv = function() { return env; }
}
scheme.makeCompoundProcedure = function(name, parameters, body, env, minArgs, maxArgs) {
    return new scheme.Object(scheme_comp_type, new scheme.CompoundProcedure(name, parameters, body, env, minArgs, maxArgs));
}

scheme.voidValue = new scheme.Object(scheme_void_type, undefined);

})(scheme);
