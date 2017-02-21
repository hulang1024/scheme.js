/*
    数值运算
*/
(function(s){
"use strict";

s.initNumComp = function(env) {
    s.addPrimProc(env, "=", equalNumber, 2, -1);
    s.addPrimProc(env, "<", lessThan, 2, -1);
    s.addPrimProc(env, ">", greaThan, 2, -1);
    s.addPrimProc(env, "<=", lteq, 2, -1);
    s.addPrimProc(env, ">=", gteq, 2, -1);
}

function equalNumber(argv) {
    var first = argv[0];
    var obj;
    if(!first.isNumber())
        return s.wrongContract("=", "number?", 0, argv);
    for(var i = 0; i < argv.length; i++) {
        obj = argv[i];
        if(obj.isNumber()) {
            if(first.val != obj.val)
                return s.False;
        }
        else
            return s.wrongContract("=", "number?", i, argv);
    }
    return s.True;
}

function lessThan(argv) {
    var obj1, obj2;
    for(var i = 0; i < argv.length - 1; i++) {
        obj1 = argv[i];
        obj2 = argv[i + 1];
        if(!obj1.isReal())
            return s.wrongContract("<", "real?", i, argv);
        if(!obj2.isReal())
            return s.wrongContract("<", "real?", i+1, argv);
        if(obj1.val >= obj2.val)
            return s.False;
    }
    return s.True;
}

function greaThan(argv) {
    var obj1, obj2;
    for(var i = 0; i < argv.length - 1; i++) {
        obj1 = argv[i];
        obj2 = argv[i + 1];
        if(!obj1.isReal())
            return s.wrongContract(">", "real?", i, argv);
        if(!obj2.isReal())
            return s.wrongContract(">", "real?", i+1, argv);
        if(obj1.val <= obj2.val)
            return s.False;
    }
    return s.True;
}

function lteq(argv) {
    var obj1, obj2;
    for(var i = 0; i < argv.length - 1; i++) {
        obj1 = argv[i];
        obj2 = argv[i + 1];
        if(!obj1.isReal())
            return s.wrongContract("<=", "real?", i, argv);
        if(!obj2.isReal())
            return s.wrongContract("<=", "real?", i+1, argv);
        if(obj1.val > obj2.val)
            return s.False;
    }
    return s.True;
}

function gteq(argv) {
    var obj1, obj2;
    for(var i = 0; i < argv.length - 1; i++) {
        obj1 = argv[i];
        obj2 = argv[i + 1];
        if(!obj1.isReal())
            return s.wrongContract(">=", "real?", i, argv);
        if(!obj2.isReal())
            return s.wrongContract(">=", "real?", i+1, argv);
        if(obj1.val < obj2.val)
            return s.False;
    }
    return s.True;
}

})(scheme);
