(function(scheme){
"use strict";

scheme.initBool = function(env) {
    scheme.addPrimProc(env, "boolean?", boolean_p, 1);
    scheme.addPrimProc(env, "eqv?", eqv_p, 2);
    scheme.addPrimProc(env, "eq?", eq_p, 2);
    scheme.addPrimProc(env, "equal?", equal_p, 2);
    scheme.addPrimProc(env, "not", not, 1);
}

scheme.makeBoolean = function(val) {
    return new scheme.Object(scheme_bool_type, val);
}
scheme.boolVal = function(o) { return o.val; }
scheme.True = scheme.makeBoolean(true);
scheme.False = scheme.makeBoolean(false);
scheme.isTrue = function(obj) { return obj != scheme.False; }
scheme.isFalse = function(obj) { return obj == scheme.False; }
scheme.getBoolean = function(val) { return val ? scheme.True : scheme.False; }
scheme.getBool = scheme.getBoolean;

function boolean_p(argv) {
    return scheme.getBoolean(scheme.isBoolean(argv[0]));
}

function eqv_p(argv) {
    var x = argv[0];
    var y = argv[1];
    if(x.type != y.type)
        return scheme.False;
    if(scheme.isSymbol(x))
        return scheme.getBoolean(scheme.symbolVal(x).toUpperCase() == scheme.symbolVal(y).toUpperCase());
    else if(scheme.isNumber(x) || scheme.isChar(x) || scheme.isString(x) || x.isBoolean())
        return scheme.getBoolean(x.val == y.val);
    else
        return scheme.getBoolean(x == y);
}

function eq_p(argv) {
    return eqv_p(argv);
}

function equal_p(argv) {
    var obj1 = argv[0];
    var obj2 = argv[1];
    var iseq = eq_p(argv);
    if(scheme.isTrue(iseq))
        return iseq;
    else if(scheme.isPair(obj1)) {
        while(scheme.isPair(obj1) && scheme.isPair(obj2)) {
            if(scheme.isFalse(eq_p([scheme.car(obj1), scheme.car(obj2)])))
                return scheme.False;
            obj1 = scheme.cdr(obj1);
            obj2 = scheme.cdr(obj2);
        }
        return scheme.getBoolean(!(scheme.isPair(obj1) || scheme.isPair(obj2)));
    }
    else
        return scheme.False;
}

function not(argv) {
    return scheme.isTrue(argv[0]) ? scheme.False : scheme.True;
}
})(scheme);
