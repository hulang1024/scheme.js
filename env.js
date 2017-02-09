(function(s){
"use strict";

s.EnvironmentFrame = function(map, baseEnv) {
    this.map = map;
    this.baseEnv = baseEnv;
}

s.addGlobalPrimProc = function(name, func, minArgs, maxArgs) {
    s.globalEnvironment.map[name] = s.makePrimitiveProcedure(name, func, minArgs, maxArgs);
}

s.addGlobalObject = function(name, obj) {
    s.globalEnvironment.map[name] = obj;
}

s.globalEnvironment = new s.EnvironmentFrame({}, null);

s.initBasicEnv = function() {
    s.initBool();
    s.initSymbol();
    s.initNumber();
    s.initChar();
    s.initString();
    s.initList();
    s.initVector();
    s.initMyObject();
    s.initFun();
    s.initRead();
    s.initPrint();
    s.initEval();
    s.addGlobalPrimProc("interaction-environment", interactionEnvironment, 0);
}

s.makeNamespace = function(env) {
    return new s.Object(10, env);
}

function isNamespace(args) {
    return s.getBoolean(s.car(args).isNamespace());
}

s.lookupVariableValue = function(variable, env) {
    var value;
    while(env && ((value = env.map[variable.val]) == undefined))
        env = env.baseEnv;
    if(value == undefined)
        return s.makeError('undefined', variable.val);
    return value;
}

s.extendEnvironment = function(variables, values, baseEnv) {
    var map = {};
    if(s.isList(variables)) {
        variables = s.listToArray(variables);
        for(var i = 0; i < variables.length; i++)
            map[variables[i].val] = values[i];
    }
    else if(variables.isPair()) {
        variables = s.pairToArray(variables);
        var i;
        for(i = 0; i < variables.length - 1; i++)
            map[variables[i].val] = values[i];
        var restParameterIndex = i;
        var restValues = s.arrayToList(values.slice(restParameterIndex));
        map[variables[restParameterIndex].val] = restValues;
    }
    else if(variables.isSymbol()) {
        var variable = variables;
        map[variable.val] = s.arrayToList(values);
    }

    return new s.EnvironmentFrame(map, baseEnv);
}

s.defineVariable = function(variable, value, env) {
    var name = variable.val;
    env.map[name] = value;
}

s.setVariableValue = function(variable, value, env) {
    var name = variable.val;
    while(env && env.map[name] == undefined)
        env = env.baseEnv;
    if(env == null)
        return s.makeError('undefined', name);
    env.map[name] = value;
}

function interactionEnvironment() {
    return s.makeNamespace(s.globalEnvironment);
}

})(scheme);
