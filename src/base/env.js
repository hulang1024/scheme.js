(function(scheme){
"use strict";

scheme.Env = function(bindings, parentEnv) {
    this.bindings = bindings;
    this.parent = parentEnv;
}

scheme.addPrimProc = function(env, name, func, minArgs, maxArgs) {
    env.bindings[name] = scheme.makePrimitiveProcedure(name, func, minArgs, maxArgs);
}

scheme.addObject = function(env, name, obj) {
    env.bindings[name] = obj;
}

scheme.globalEnv = null;
scheme.basicEnv = null;

scheme.interactionEnvironment = function() {
    return scheme.makeNamespace(scheme.globalEnv);
}

scheme.initBasicEnv = function() {
    scheme.basicEnv = new scheme.Env({}, null);
    var env = scheme.basicEnv;
    scheme.initSymbol(env);
    scheme.initBool(env);
    scheme.initNumber(env);
    scheme.initNumComp(env);
    scheme.initNumArith(env);
    scheme.initNumStr(env);
    scheme.initChar(env);
    scheme.initString(env);
    scheme.initList(env);
    scheme.initVector(env);
    scheme.initFun(env);
    scheme.initRead(env);
    scheme.initPrint(env);
    scheme.initEval(env);
    scheme.initJSObject(env);
    
    // init lib
    scheme.evalStringWithEnv(SCHEME_LIB_SRC, env);
    
    scheme.addPrimProc(env, "interaction-environment", scheme.interactionEnvironment, 0);
}

scheme.makeGlobalEnv = function() {
    scheme.globalEnv = scheme.extendEnv({}, scheme.basicEnv);
    return scheme.globalEnv;
}

scheme.makeNamespace = function(env) {
    return new scheme.Object(scheme_namespace_type, env);
}

function isNamespace(args) {
    return scheme.getBoolean(scheme.isNamespace(scheme.car(args)));
}

scheme.lookup = function(variable, env) {
    var name = scheme.symbolVal(variable);
    var value;
    while(env && !((value = env.bindings[name]) instanceof scheme.Object))
        env = env.parent;
    if(!(value instanceof scheme.Object))
        return scheme.throwError('undefined', name);
    return value;
}

scheme.extendEnv = function(bindings, parentEnv) {
    return new scheme.Env(bindings, parentEnv);
}

scheme.define = function(variable, value, env) {
    if(!scheme.isSymbol(variable))
        return scheme.throwError('define', "not an identifier: " + scheme.writeToString(variable));
    env.bindings[scheme.symbolVal(variable)] = value;
}

scheme.set = function(variable, value, env) {
    if(!scheme.isSymbol(variable))
        return scheme.throwError('set!', "not an identifier: " + scheme.writeToString(variable));
    var name = scheme.symbolVal(variable);
    while(env && !(env.bindings[name] instanceof scheme.Object))
        env = env.parent;
    if(env == null)
        return scheme.throwError('undefined', name);
    env.bindings[name] = value;
}

})(scheme);
