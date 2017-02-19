(function(s){
"use strict";

s.EnvFrame = function(map, baseEnv) {
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
    s.initBool(env);
    s.initSymbol(env);
    s.initNumber(env);
    s.initChar(env);
    s.initString(env);
    s.initList(env);
    s.initVector(env);
    s.initFun(env);
    s.initRead(env);
    s.initPrint(env);
    s.initEval(env);
    s.initMyObject(env);
    s.initALib(env);
    s.addPrimProc(env, "interaction-environment", interactionEnvironment, 0);
}

s.makeInitedBasicEnv = function() {
    s.globalEnvironment = new s.EnvFrame({}, null);
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
    var value;
    while(env && !((value = env.map[variable.val]) instanceof s.Object))
        env = env.baseEnv;
    if(!(value instanceof s.Object))
        return s.makeError('undefined', variable.val);
    return value;
}

s.extendEnv = function(map, baseEnv) {
    return new s.EnvFrame(map, baseEnv);
}

s.defineVariable = function(variable, value, env) {
    var name = variable.val;
    env.map[name] = value;
}

s.setVariableValue = function(variable, value, env) {
    var name = variable.val;
    while(env && !(env.map[name] instanceof s.Object))
        env = env.baseEnv;
    if(env == null)
        return s.makeError('undefined', name);
    env.map[name] = value;
}

function interactionEnvironment() {
    return s.makeNamespace(s.globalEnvironment);
}

})(scheme);
