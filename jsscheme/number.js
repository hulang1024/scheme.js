(function(s){
"use strict";

s.initNumber = function(env) {
    s.addPrimProc(env, "integer?", integer_p, 1);
    s.addPrimProc(env, "real?", real_p, 1);
    s.addPrimProc(env, "number?", number_p, 1);
    s.addPrimProc(env, "remainder", remainder, 2);
    
}

s.makeInt = function(val) {
    return new s.Object(1, val);
}
s.intVal = function(obj) { return obj.val; }

s.makeReal = function(val) {
    return new s.Object(2, val);
}
s.floatVal = function(obj) { return obj.val; }

function integer_p(argv) {
    return s.getBoolean(argv[0].isInteger());
}

function real_p(argv) {
    return s.getBoolean(argv[0].isReal());
}

function number_p(argv) {
    return s.getBoolean(argv[0].isNumber());
}

function remainder(argv) {
    if(!argv[0].isNumber())
        return s.wrongContract("remainder", "number?", 0, argv);
    if(!argv[1].isNumber())
        return s.wrongContract("remainder", "number?", 1, argv);
    
    return s.makeInt(s.intVal(argv[0]) % s.intVal(argv[1]));
}
})(scheme);
