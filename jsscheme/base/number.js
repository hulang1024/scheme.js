(function(scheme){
"use strict";

scheme.initNumber = function(env) {
    scheme.addPrimProc(env, "integer?", integer_p, 1);
    scheme.addPrimProc(env, "real?", real_p, 1);
    scheme.addPrimProc(env, "number?", number_p, 1);
    scheme.addPrimProc(env, "remainder", remainder, 2);
    
}

scheme.makeInt = function(val) {
    return new scheme.Object(scheme_integer_type, val);
}
scheme.intVal = function(obj) { return obj.val; }

scheme.makeDouble = function(val) {
    return new scheme.Object(scheme_double_type, val);
}
scheme.doubleVal = function(obj) { return obj.val; }

scheme.makeNumber = function(val) {
    if(parseInt(val) == val)
        return scheme.makeInt(val);
    else
        return scheme.makeDouble(val);
}

function integer_p(argv) {
    return scheme.getBoolean(scheme.isInteger(argv[0]));
}

function real_p(argv) {
    return scheme.getBoolean(scheme.isNumber(argv[0]));
}

function number_p(argv) {
    return scheme.getBoolean(scheme.isNumber(argv[0]));
}

function remainder(argv) {
    if(!scheme.isNumber(argv[0]))
        return scheme.wrongContract("remainder", "number?", 0, argv);
    if(!scheme.isNumber(argv[1]))
        return scheme.wrongContract("remainder", "number?", 1, argv);
    
    return scheme.makeNumber(scheme.intVal(argv[0]) % scheme.intVal(argv[1]));
}
})(scheme);
