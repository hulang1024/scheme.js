(function(s){
"use strict";

s.initChar = function(env) {
    s.addPrimProc(env, "char?", char_p, 1);
}

s.makeChar = function(val) {
    return new s.Object(3, val);
}
s.charVal = function(obj) { return obj.val; }

function char_p(argv) {
    return s.getBoolean(argv[0].isChar());
}

})(scheme);
