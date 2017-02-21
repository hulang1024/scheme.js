(function(s){
"use strict";

s.initNumber = function(env) {
    s.addPrimProc(env, "integer?", integer_p, 1);
    s.addPrimProc(env, "real?", real_p, 1);
    s.addPrimProc(env, "number?", number_p, 1);
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

})(scheme);
