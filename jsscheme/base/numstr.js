(function(scheme){
"use strict";

scheme.initNumStr = function(env) {
    scheme.addPrimProc(env, "string->number", stringToNumber, 1);
    scheme.addPrimProc(env, "number->string", numberToString, 1);
}

function stringToNumber(argv) {
    var obj = argv[0];
    if(!scheme.isString(obj))
        return scheme.wrongContract("string->number", "string?", 0, argv);
    return scheme.makeDouble(parseFloat(scheme.stringVal(obj)));
}

function numberToString(argv) {
    var obj = argv[0];
    if(!scheme.isNumber(obj))
        return scheme.wrongContract("number->string", "number?", 0, argv);
    return scheme.makeString(obj.val.toString());
}

})(scheme);
