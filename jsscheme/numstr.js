(function(s){
"use strict";

s.initNumStr = function(env) {
    s.addPrimProc(env, "string->number", stringToNumber, 1);
    s.addPrimProc(env, "number->string", numberToString, 1);
}

function stringToNumber(argv) {
    var obj = argv[0];
    if(!obj.isString())
        return s.wrongContract(env, "string->number", "string?", 0, argv);
    return s.makeReal(parseFloat(obj.val));
}

function numberToString(argv) {
    var obj = argv[0];
    if(!obj.isNumber())
        return s.wrongContract(env, "number->string", "number?", 0, argv);
    return s.makeString(obj.val.toString());
}

})(scheme);
