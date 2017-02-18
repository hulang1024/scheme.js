(function(s){
"use strict";

s.initBool = function() {
    s.addGlobalPrimProc("boolean?", boolean_p, 1);
    s.addGlobalPrimProc("eq?", eq_p, 2);
    s.addGlobalPrimProc("equal?", equal_p, 2);
    s.addGlobalPrimProc("not", not, 1);
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

function eq_p(argv) {
    var x = argv[0];
    var y = argv[1];
    if(x.type != y.type)
        return s.False;
    if(x.isSymbol())
        return s.getBoolean(s.symbolVal(x).toUpperCase() == s.symbolVal(y).toUpperCase());
    else if(x.isNumber() || x.isChar() || x.isString() || x.isBoolean())
        return s.getBoolean(x.val == y.val);
    else
        return s.getBoolean(x == y);
}

function equal_p(argv) {
    var obj1 = argv[0];
    var obj2 = argv[1];
    var iseq = eq_p(argv);
    if(s.isTrue(iseq))
        return iseq;
    else if(obj1.isPair()) {
        while(obj1.isPair() && obj2.isPair()) {
            if(s.isFalse(eq_p([s.car(obj1), s.car(obj2)])))
                return s.False;
            obj1 = s.cdr(obj1);
            obj2 = s.cdr(obj2);
        }
        return s.getBoolean(!(obj1.isPair() || obj2.isPair()));
    }
    else
        return s.False;
}

function not(argv) {
    return s.isTrue(argv[0]) ? s.False : s.True;
}
})(scheme);
