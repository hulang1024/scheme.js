(function(s){
"use strict";

s.initChar = function(env) {
    s.addPrimProc(env, "char?", char_p, 1);
    s.addPrimProc(env, "char=?", char_eq_p, 2);
    s.addPrimProc(env, "char-upper-case?", char_upper_case_p, 1);
    s.addPrimProc(env, "char-lower-case?", char_lower_case_p, 1);
    s.addPrimProc(env, "char-upcase", char_upcase, 1);
    s.addPrimProc(env, "char-downcase", char_downcase, 1);
}

s.makeChar = function(val) {
    return new s.Object(3, val);
}
s.charVal = function(obj) { return obj.val; }

function char_p(argv) {
    return s.getBool(argv[0].isChar());
}

function char_eq_p(argv) {
    var c1 = argv[0];
    var c2 = argv[1];
    if(!c1.isChar())
        return s.wrongContract("char=?", "char?", 0, argv);
    if(!c2.isChar())
        return s.wrongContract("char=?", "char?", 1, argv);
    return s.getBool(s.charVal(c1) == s.charVal(c2));
}

function char_upper_case_p(argv) {
    var c = argv[0];
    if(!c.isChar())
        return s.wrongContract("char-upper-case?", "char?", 0, argv);
    c = s.charVal(c);
    return s.getBool('A' <= c && c <= 'Z');
}

function char_lower_case_p(argv) {
    var c = argv[0];
    if(!c.isChar())
        return s.wrongContract("char-lower-case?", "char?", 0, argv);
    c = s.charVal(c);
    return s.getBool('a' <= c && c <= 'z');
}

function char_upcase(argv) {
    var c = argv[0];
    if(!c.isChar())
        return s.wrongContract("char-upcase", "char?", 0, argv);
    return s.makeChar(s.charVal(c).toUpperCase());
}

function char_downcase(argv) {
    var c = argv[0];
    if(!c.isChar())
        return s.wrongContract("char-downcase", "char?", 0, argv);
    return s.makeChar(s.charVal(c).toLowerCase());
}
})(scheme);
