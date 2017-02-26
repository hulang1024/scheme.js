(function(s){
"use strict";

s.Env = function(map, baseEnv) {
    this.map = map;
    this.baseEnv = baseEnv;
}

s.addPrimProc = function(env, name, func, minArgs, maxArgs) {
    env.map[name] = s.makePrimitiveProcedure(name, func, minArgs, maxArgs);
}

s.addObject = function(env, name, obj) {
    env.map[name] = obj;
}

s.globalEnvironment = null;

s.initBasicEnv = function(env) {
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
    s.initALib(env);
    s.addPrimProc(env, "interaction-environment", interactionEnvironment, 0);
}

s.makeInitedBasicEnv = function() {
    s.globalEnvironment = new s.Env({}, null);
    s.initBasicEnv(s.globalEnvironment);
    return s.globalEnvironment;
}

s.makeNamespace = function(env) {
    return new s.Object(10, env);
}

function isNamespace(args) {
    return s.getBoolean(s.car(args).isNamespace());
}

s.lookupVariableValue = function(variable, env) {
    var name = s.symbolVal(variable);
    var value;
    while(env && !((value = env.map[name]) instanceof s.Object))
        env = env.baseEnv;
    if(!(value instanceof s.Object))
        return s.throwError('undefined', name);
    return value;
}

s.extendEnv = function(map, baseEnv) {
    return new s.Env(map, baseEnv);
}

s.defineVariable = function(variable, value, env) {
    if(!variable.isSymbol())
        return s.throwError('define', "not an identifier: " + s.writeToString(variable));
    env.map[s.symbolVal(variable)] = value;
}

s.setVariableValue = function(variable, value, env) {
    if(!variable.isSymbol())
        return s.throwError('set!', "not an identifier: " + s.writeToString(variable));
    var name = s.symbolVal(variable);
    while(env && !(env.map[name] instanceof s.Object))
        env = env.baseEnv;
    if(env == null)
        return s.throwError('undefined', name);
    env.map[name] = value;
}

function interactionEnvironment() {
    return s.makeNamespace(s.globalEnvironment);
}

})(scheme);
