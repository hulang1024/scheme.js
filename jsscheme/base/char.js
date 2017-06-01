(function(scheme){
"use strict";

scheme.initChar = function(env) {
    scheme.addPrimProc(env, "char?", char_p, 1);
    scheme.addPrimProc(env, "char=?", char_eq_p, 2);
    scheme.addPrimProc(env, "char-upper-case?", char_upper_case_p, 1);
    scheme.addPrimProc(env, "char-lower-case?", char_lower_case_p, 1);
    scheme.addPrimProc(env, "char-upcase", char_upcase, 1);
    scheme.addPrimProc(env, "char-downcase", char_downcase, 1);
}

scheme.makeChar = function(val) {
    return new scheme.Object(scheme_char_type, val);
}
scheme.charVal = function(obj) { return obj.val; }

function char_p(argv) {
    return scheme.getBool(scheme.isChar(argv[0]));
}

function char_eq_p(argv) {
    var c1 = argv[0];
    var c2 = argv[1];
    if(!scheme.isChar(c1))
        return scheme.wrongContract("char=?", "char?", 0, argv);
    if(!scheme.isChar(c2))
        return scheme.wrongContract("char=?", "char?", 1, argv);
    return scheme.getBool(scheme.charVal(c1) == scheme.charVal(c2));
}

function char_upper_case_p(argv) {
    var c = argv[0];
    if(!scheme.isChar(c))
        return scheme.wrongContract("char-upper-case?", "char?", 0, argv);
    c = scheme.charVal(c);
    return scheme.getBool('A' <= c && c <= 'Z');
}

function char_lower_case_p(argv) {
    var c = argv[0];
    if(!scheme.isChar(c))
        return scheme.wrongContract("char-lower-case?", "char?", 0, argv);
    c = scheme.charVal(c);
    return scheme.getBool('a' <= c && c <= 'z');
}

function char_upcase(argv) {
    var c = argv[0];
    if(!scheme.isChar(c))
        return scheme.wrongContract("char-upcase", "char?", 0, argv);
    return scheme.makeChar(scheme.charVal(c).toUpperCase());
}

function char_downcase(argv) {
    var c = argv[0];
    if(!scheme.isChar(c))
        return scheme.wrongContract("char-downcase", "char?", 0, argv);
    return scheme.makeChar(scheme.charVal(c).toLowerCase());
}
})(scheme);
