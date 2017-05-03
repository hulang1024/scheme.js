(function(s){
"use strict";

s.Env = function(bindings, parentEnv) {
    this.bindings = bindings;
    this.parent = parentEnv;
}

s.addPrimProc = function(env, name, func, minArgs, maxArgs) {
    env.bindings[name] = s.makePrimitiveProcedure(name, func, minArgs, maxArgs);
}

s.addObject = function(env, name, obj) {
    env.bindings[name] = obj;
}

s.globalEnv = null;
s.basicEnv = null;

s.initBasicEnv = function() {
    s.basicEnv = new s.Env({}, null);
    var env = s.basicEnv;
    s.initSymbol(env);
    s.initBool(env);
    s.initNumber(env);
    s.initNumComp(env);
    s.initNumArith(env);
    s.initNumStr(env);
    s.initChar(env);
    s.initString(env);
    s.initList(env);
    s.initVector(env);
    s.initFun(env);
    s.initRead(env);
    s.initPrint(env);
    s.initEval(env);
    s.initJSObject(env);
    
    // init lib
    s.evalStringWithEnv(SCHEME_LIB_SRC, env);
    
    s.addPrimProc(env, "interaction-environment", interactionEnvironment, 0);
}

s.makeGlobalEnv = function() {
    s.globalEnv = s.extendEnv({}, s.basicEnv);
    return s.globalEnv;
}

s.makeNamespace = function(env) {
    return new s.Object(10, env);
}

function isNamespace(args) {
    return s.getBoolean(s.car(args).isNamespace());
}

s.lookup = function(variable, env) {
    var name = s.symbolVal(variable);
    var value;
    while(env && !((value = env.bindings[name]) instanceof s.Object))
        env = env.parent;
    if(!(value instanceof s.Object))
        return s.throwError('undefined', name);
    return value;
}

s.extendEnv = function(bindings, parentEnv) {
    return new s.Env(bindings, parentEnv);
}

s.defineVariable = function(variable, value, env) {
    if(!variable.isSymbol())
        return s.throwError('define', "not an identifier: " + s.writeToString(variable));
    env.bindings[s.symbolVal(variable)] = value;
}

s.setVariableValue = function(variable, value, env) {
    if(!variable.isSymbol())
        return s.throwError('set!', "not an identifier: " + s.writeToString(variable));
    var name = s.symbolVal(variable);
    while(env && !(env.bindings[name] instanceof s.Object))
        env = env.parent;
    if(env == null)
        return s.throwError('undefined', name);
    env.bindings[name] = value;
}

function interactionEnvironment() {
    return s.makeNamespace(s.globalEnvironment);
}

})(scheme);
