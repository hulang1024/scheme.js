/*
    数值运算
*/
(function(scheme){
"use strict";

scheme.initNumArith = function(env) {
    scheme.addPrimProc(env, "+", plus, 0, -1);
    scheme.addPrimProc(env, "-", minus, 1, -1);
    scheme.addPrimProc(env, "*", mul, 0, -1);
    scheme.addPrimProc(env, "/", div, 1, -1);
}

function plus(argv) {
    var ret = 0, obj;
    for(var i = 0; i < argv.length; i++) {
        obj = argv[i];
        if(!scheme.isNumber(obj))
            return scheme.wrongContract("+", "number?", i, argv);
        ret += obj.val;
    }
    return scheme.makeNumber(ret);
}

function mul(argv) {
    var ret = 1, obj;
    for(var i = 0; i < argv.length; i++) {
        obj = argv[i];
        if(!scheme.isNumber(obj))
            return scheme.wrongContract("*", "number?", i, argv);
        ret *= obj.val;
    }
    return scheme.makeNumber(ret);
}

function minus(argv) {
    var ret, obj;
    if(argv.length > 1) {
        ret = argv[0].val;
        for(var i = 1; i < argv.length; i++) {
            obj = argv[i];
            if(!scheme.isNumber(obj))
                return scheme.wrongContract("-", "number?", i, argv);
            ret -= obj.val;
        }
    } else {
        obj = argv[0];
        if(!scheme.isNumber(obj))
            return scheme.wrongContract("-", "number?", 0, argv);
        ret = - obj.val;
    }
    return scheme.makeNumber(ret);
}

function div(argv) {
    var ret, obj;
    if(argv.length > 1) {
        ret = argv[0].val;
        for(var i = 1; i < argv.length; i++) {
            obj = argv[i];
            if(!scheme.isNumber(obj))
                return scheme.wrongContract("/", "number?", i, argv);
            if(obj.val == 0)
                return scheme.throwError("/", "division by zero");
            ret /= obj.val;
        }
    } else {
        obj = argv[0];
        if(!scheme.isNumber(obj))
            return scheme.wrongContract("/", "number?", 0, argv);
        ret = 1 / obj.val;
    }
    return scheme.makeNumber(ret);
}

})(scheme);
