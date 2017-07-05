(function(scm){
"use strict";

scm.initBool = function(env) {
    scm.addPrimProc(env, "boolean?", boolean_p, 1);
    scm.addPrimProc(env, "eqv?", eqv_p, 2);
    scm.addPrimProc(env, "eq?", eq_p, 2);
    scm.addPrimProc(env, "equal?", equal_p, 2);
    scm.addPrimProc(env, "not", not, 1);
}

scm.makeBoolean = function(val) {
    return new scm.Object(scheme_bool_type, val);
}
scm.boolVal = function(o) { return o.val; }
scm.True = scm.makeBoolean(true);
scm.False = scm.makeBoolean(false);
scm.isTrue = function(obj) { return obj != scm.False; }
scm.isFalse = function(obj) { return obj == scm.False; }
scm.getBoolean = function(val) { return val ? scm.True : scm.False; }
scm.getBool = scm.getBoolean;

function boolean_p(argv) {
    return scm.getBoolean(scm.isBoolean(argv[0]));
}

function eqv_p(argv) {
    var x = argv[0];
    var y = argv[1];
    if(x.type != y.type)
        return scm.False;
    if(scm.isSymbol(x))
        return scm.getBoolean(scm.symbolVal(x).toUpperCase() == scm.symbolVal(y).toUpperCase());
    else if(scm.isNumber(x) || scm.isChar(x) || scm.isString(x) || scm.isBoolean(x))
        return scm.getBoolean(x.val == y.val);
    else
        return scm.getBoolean(x == y);
}

function eq_p(argv) {
    return eqv_p(argv);
}

function equal_p(argv) {
    var obj1 = argv[0];
    var obj2 = argv[1];
    var iseq = eq_p(argv);
    if(scm.isTrue(iseq))
        return iseq;
    else if(scm.isPair(obj1)) {
        while(scm.isPair(obj1) && scm.isPair(obj2)) {
            if(scm.isFalse(eq_p([scm.car(obj1), scm.car(obj2)])))
                return scm.False;
            obj1 = scm.cdr(obj1);
            obj2 = scm.cdr(obj2);
        }
        return scm.getBoolean(!(scm.isPair(obj1) || scm.isPair(obj2)));
    }
    else
        return scm.False;
}

function not(argv) {
    return scm.isTrue(argv[0]) ? scm.False : scm.True;
}
})(scm);
