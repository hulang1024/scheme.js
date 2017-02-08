﻿(function(s){
"use strict";

s.initBool = function() {
    s.addGlobalPrimProc("boolean?", boolean_p, 1);
    s.addGlobalPrimProc("not", not, 1);
    s.addGlobalPrimProc("and", and, 0, -1);
    s.addGlobalPrimProc("or", or, 0, -1);
    s.addGlobalPrimProc("eq?", eq, 2);
    s.addGlobalPrimProc("equal?", equal, 2);
}

s.makeBoolean = function(val) {
    return new s.Object(5, val);
}

s.True = s.makeBoolean(true);
s.False = s.makeBoolean(false);

s.isTrue = function(obj) { return obj != s.False; }
s.isFalse = function(obj) { return obj == s.False; }

s.getBoolean = function(v) { return v ? s.True : s.False; }

function boolean_p(argv) {
    return s.getBoolean(argv[0].isBoolean());
}

function not(argv) {
    return s.getBoolean(!argv[0].val);
}

function and(argv) {
    if(argv.length == 0)
        return s.True;
    var i;
    for(i = 0; i < argv.length; i++)
        if(s.isFalse(argv[i]))
            return argv[i];
    return argv[i - 1];
}

function or(argv) {
    if(argv.length == 0)
        return s.False;
    var i;
    for(i = 0; i < argv.length; i++)
        if(s.isTrue(argv[i]))
            return argv[i];
    return argv[i - 1];
}

function eq(argv) {
    var x = argv[0];
    var y = argv[1];
    if(x.type != y.type)
        return s.False;
    if(x.isNumber() || x.isChar() || x.isString() || x.isBoolean)
        return s.getBoolean(x.val == y.val);
    else
        return s.getBoolean(x == y);
}

function equal(argv) {
    return eq(argv);
}

})(scheme);
