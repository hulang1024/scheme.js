/*
    数值运算
*/
(function(s){
"use strict";

s.initNumArith = function(env) {
    s.addPrimProc(env, "+", plus, 0, -1);
    s.addPrimProc(env, "-", minus, 1, -1);
    s.addPrimProc(env, "*", mul, 0, -1);
    s.addPrimProc(env, "/", div, 1, -1);
}

function plus(argv) {
    var ret = 0, obj;
    for(var i = 0; i < argv.length; i++) {
        obj = argv[i];
        if(!obj.isNumber())
            return s.wrongContract("+", "number?", i, argv);
        ret += obj.val;
    }
    return s.makeNumber(ret);
}

function mul(argv) {
    var ret = 1, obj;
    for(var i = 0; i < argv.length; i++) {
        obj = argv[i];
        if(!obj.isNumber())
            return s.wrongContract("*", "number?", i, argv);
        ret *= obj.val;
    }
    return s.makeNumber(ret);
}

function minus(argv) {
    var ret, obj;
    if(argv.length > 1) {
        ret = argv[0].val;
        for(var i = 1; i < argv.length; i++) {
            obj = argv[i];
            if(!obj.isNumber())
                return s.wrongContract("-", "number?", i, argv);
            ret -= obj.val;
        }
    } else {
        obj = argv[0];
        if(!obj.isNumber())
            return s.wrongContract("-", "number?", 0, argv);
        ret = - obj.val;
    }
    return s.makeNumber(ret);
}

function div(argv) {
    var ret, obj;
    if(argv.length > 1) {
        ret = argv[0].val;
        for(var i = 1; i < argv.length; i++) {
            obj = argv[i];
            if(!obj.isNumber())
                return s.wrongContract("/", "number?", i, argv);
            if(obj.val == 0)
                return s.makeError("/", "division by zero");
            ret /= obj.val;
        }
    } else {
        obj = argv[0];
        if(!obj.isNumber())
            return s.wrongContract("/", "number?", 0, argv);
        ret = 1 / obj.val;
    }
    return s.makeNumber(ret);
}

})(scheme);
