/*
    数值运算
*/
(function(scheme){
"use strict";

scheme.initNumComp = function(env) {
    scheme.addPrimProc(env, "=", equalNumber, 2, -1);
    scheme.addPrimProc(env, "<", lessThan, 2, -1);
    scheme.addPrimProc(env, ">", greaThan, 2, -1);
    scheme.addPrimProc(env, "<=", lteq, 2, -1);
    scheme.addPrimProc(env, ">=", gteq, 2, -1);
}

function equalNumber(argv) {
    var first = argv[0];
    var obj;
    if(!scheme.isNumber(first))
        return scheme.wrongContract("=", "number?", 0, argv);
    for(var i = 0; i < argv.length; i++) {
        obj = argv[i];
        if(scheme.isNumber(obj)) {
            if(first.val != obj.val)
                return scheme.False;
        }
        else
            return scheme.wrongContract("=", "number?", i, argv);
    }
    return scheme.True;
}

function lessThan(argv) {
    var obj1, obj2;
    for(var i = 0; i < argv.length - 1; i++) {
        obj1 = argv[i];
        obj2 = argv[i + 1];
        if(!scheme.isReal(obj1))
            return scheme.wrongContract("<", "real?", i, argv);
        if(!scheme.isReal(obj2))
            return scheme.wrongContract("<", "real?", i+1, argv);
        if(obj1.val >= obj2.val)
            return scheme.False;
    }
    return scheme.True;
}

function greaThan(argv) {
    var obj1, obj2;
    for(var i = 0; i < argv.length - 1; i++) {
        obj1 = argv[i];
        obj2 = argv[i + 1];
        if(!scheme.isReal(obj1))
            return scheme.wrongContract(">", "real?", i, argv);
        if(!scheme.isReal(obj2))
            return scheme.wrongContract(">", "real?", i+1, argv);
        if(obj1.val <= obj2.val)
            return scheme.False;
    }
    return scheme.True;
}

function lteq(argv) {
    var obj1, obj2;
    for(var i = 0; i < argv.length - 1; i++) {
        obj1 = argv[i];
        obj2 = argv[i + 1];
        if(!scheme.isReal(obj1))
            return scheme.wrongContract("<=", "real?", i, argv);
        if(!scheme.isReal(obj2))
            return scheme.wrongContract("<=", "real?", i+1, argv);
        if(obj1.val > obj2.val)
            return scheme.False;
    }
    return scheme.True;
}

function gteq(argv) {
    var obj1, obj2;
    for(var i = 0; i < argv.length - 1; i++) {
        obj1 = argv[i];
        obj2 = argv[i + 1];
        if(!scheme.isReal(obj1))
            return scheme.wrongContract(">=", "real?", i, argv);
        if(!scheme.isReal(obj2))
            return scheme.wrongContract(">=", "real?", i+1, argv);
        if(obj1.val < obj2.val)
            return scheme.False;
    }
    return scheme.True;
}

})(scheme);
