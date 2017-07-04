/* scheme namespace */
var scheme = scm = {};

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
/* extended types */
const scheme_jsobject_type = 12;

(function(scm){
"use strict";

/**
Scheme对象
具有一个标识类型的字段
*/
scm.Object = function(type, val) {
    this.type = type;
    // 动态类型值
    this.val = val;
}

scm.makePrimitiveProcedure = function(name, func, minArgs, maxArgs) {
    var proc = new scm.Object(scheme_prim_type);
    
    var arity = [];
    if(minArgs !== undefined)
        arity.push(minArgs);
    if(maxArgs !== undefined)
        arity.push(maxArgs);
    
    proc.getName = function() { return name; }
    proc.getFunc = function() { return func; }
    proc.getArity = function() { return arity; }
    
    return proc;
}

scm.makeCompoundProcedure = function(name, parameters, body, env, minArgs, maxArgs) {
    var proc = new scm.Object(scheme_comp_type);
    
    var arity = [];
    if(minArgs !== undefined)
        arity.push(minArgs);
    if(maxArgs !== undefined)
        arity.push(maxArgs);
    
    proc.getName = function() { return name; }
    proc.setName = function(_name) { name = _name; }
    proc.getParamters = function() { return parameters; }
    proc.getBody = function() { return body; }
    proc.getArity = function() { return arity; }
    proc.getEnv = function() { return env; }
    
    return proc;
}

/* 谓词 最好是宏，但JS中并不支持宏 */
scm.isInteger = function(obj) { return obj.type == scheme_integer_type; }
scm.isNumber = function(obj) { return obj.type == scheme_integer_type || obj.type == scheme_double_type; }
scm.isReal = function(obj) { return obj.type == scheme_integer_type || obj.type == scheme_double_type; }
scm.isChar = function(obj) { return obj.type == scheme_char_type; }
scm.isString = function(obj) { return obj.type == scheme_char_string_type; }
scm.isBoolean = function(obj) { return obj.type == scheme_bool_type; }
scm.isSymbol = function(obj) { return obj.type == scheme_symbol_type; }
scm.isPair = function(obj) { return obj.type == scheme_pair_type; }
scm.isEmptyList = function(obj) { return obj.type == scheme_null_type; }
scm.isVoid = function(obj) { return obj.type == scheme_void_type; }
scm.isPrim = function(obj) { return obj.type == scheme_prim_type; }
scm.isComp = function(obj) { return obj.type == scheme_comp_type; }
scm.isProcedure = function(obj) { return obj.type == scheme_prim_type || obj.type == scheme_comp_type; }
scm.isNamespace = function(obj) { return obj.type == scheme_namespace_type; }
scm.isJSObject = function(obj) { return obj.type == scheme_jsobject_type; }
})(scm);
