(function(s){
"use strict";

s.initNumStr = function(env) {
    s.addPrimProc(env, "string->number", stringToNumber, 1);
    s.addPrimProc(env, "number->string", numberToString, 1);
}

function stringToNumber(argv) {
    var obj = argv[0];
    if(!obj.isString())
        return s.wrongContract(argv, "string->number", "string?", 0, argv);
    return s.makeReal(parseFloat(s.stringVal(obj)));
}

function numberToString(argv) {
    var obj = argv[0];
    if(!obj.isNumber())
        return s.wrongContract(argv, "number->string", "number?", 0, argv);
    return s.makeString(obj.val.toString());
}

})(scheme);
