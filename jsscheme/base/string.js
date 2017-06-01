(function(scheme){
"use strict";

scheme.initString = function(env) {
    scheme.addPrimProc(env, "string?", string_p, 1);
    scheme.addPrimProc(env, "make-string", makeString, 1, 2);
    scheme.addPrimProc(env, "string", string, 0, -1);
    scheme.addPrimProc(env, "string-length", stringLength, 1);
    scheme.addPrimProc(env, "string-ref", stringRef, 2);
    scheme.addPrimProc(env, "string-set!", stringSet, 3);
    scheme.addPrimProc(env, "string=?", stringEqual, 2);
    scheme.addPrimProc(env, "string-ci=?", stringCIEqual, 2);
    scheme.addPrimProc(env, "substring", substring, 3);
    scheme.addPrimProc(env, "string->list", stringToList, 1);
    scheme.addPrimProc(env, "list->string", listToString, 1);
    scheme.addPrimProc(env, "string-copy", stringCopy, 1);
    scheme.addPrimProc(env, "string-fill!", stringFill, 2);
    scheme.addPrimProc(env, "string-append", stringAppend, 0, -1);
}

scheme.makeString = function(val) {
    if(typeof val == "string")
        val = val.split("");
    return new scheme.Object(scheme_char_string_type, val);
}
scheme.charArrayVal = function(obj) { return obj.val; }
scheme.stringVal = function(obj) { return obj.val.join(""); }
scheme.stringLen = function(obj) { return obj.val.length; }

function string_p(argv) {
    return scheme.getBoolean(scheme.isString(argv[0]));
}

function makeString(argv) {
    var k = argv[0];
    if(!isExactNonnegativeInteger(k))
        return scheme.wrongContract("make-string", "exact-nonnegative-integer?", 0, argv);
    k = scheme.intVal(k);
    var c = '\0';
    if(argv.length == 2) {
        c = argv[1];
        if(!scheme.isChar(c))
            return scheme.wrongContract("make-string", "char?", 1, argv);
        c = scheme.charVal(c);
    }
    var charArray = [];
    for(; k > 0; k--)
        charArray.push(c);
    return scheme.makeString(charArray);
}

function string(argv) {
    var charArray = [];
    for(var i = 0; i < argv.length; i++) {
        var obj = argv[i];
        if(!scheme.isChar(obj))
            return scheme.wrongContract("string", "char?", i, argv);
        charArray.push(scheme.charVal(obj));
    }
    return scheme.makeString(charArray);
}

function stringLength(argv) {
    var obj = argv[0];
    if(!scheme.isString(obj))
        return scheme.wrongContract("string-length", "string?", 0, argv);
    return scheme.makeInt(scheme.stringLen(obj));
}

function stringRef(argv) {
    var str = argv[0];
    var k = argv[1];
    if(!scheme.isString(str))
        return scheme.wrongContract("string-ref", "string?", 0, argv);
    if(!isExactNonnegativeInteger(k))
        return scheme.wrongContract("string-ref", "exact-nonnegative-integer?", 1, argv);
    k = scheme.intVal(k);
    if(indexRangeCheck("string-ref", "string", k, -1, scheme.stringLen(str), str))
        return scheme.makeChar(scheme.charArrayVal(str)[k]);
}

function stringSet(argv) {
    var str = argv[0];
    var k = argv[1];
    var c = argv[2];
    if(!scheme.isString(str))
        return scheme.wrongContract("string-set!", "string?", 0, argv);
    if(!isExactNonnegativeInteger(k))
        return scheme.wrongContract("string-set!", "exact-nonnegative-integer?", 1, argv);
    if(!scheme.isChar(c))
        return scheme.wrongContract("string-set!", "char?", 2, argv);
    k = scheme.intVal(k);
    if(indexRangeCheck("string-set!", "string", k, -1, scheme.stringLen(str), str)) {
        scheme.charArrayVal(str)[k] = scheme.charVal(c);
        return scheme.voidValue;
    }
}

function stringEqual(argv) {
    var str1 = argv[0];
    var str2 = argv[1];
    if(!scheme.isString(str1))
        return scheme.wrongContract("string=?", "string?", 0, argv);
    if(!str2.isString())
        return scheme.wrongContract("string=?", "string?", 1, argv);
    return scheme.getBoolean(scheme.stringVal(str1) == scheme.stringVal(str2));
}

function stringCIEqual(argv) {
    var str1 = argv[0];
    var str2 = argv[1];
    if(!scheme.isString(str1))
        return scheme.wrongContract("string=?", "string?", 0, argv);
    if(!str2.isString())
        return scheme.wrongContract("string=?", "string?", 1, argv);
    return scheme.getBoolean(
        scheme.stringVal(str1).toLowerCase() == scheme.stringVal(str2).toLowerCase());
}

function substring(argv) {
    var str = argv[0];
    var start = argv[1];
    var end = argv[2];
    if(!scheme.isString(str))
        return scheme.wrongContract("substring", "string?", 0, argv);
    if(!isExactNonnegativeInteger(start))
        return scheme.wrongContract("substring", "exact-nonnegative-integer?", 1, argv);
    if(!isExactNonnegativeInteger(end))
        return scheme.wrongContract("substring", "exact-nonnegative-integer?", 2, argv);
    start = scheme.intVal(start);
    end = scheme.intVal(end);
    if(indexRangeCheck("substring", "string", start, end, scheme.stringLen(str), str)) {
        return scheme.makeString(scheme.charArrayVal(str).slice(start, end));
    }
}

function stringAppend(argv) {
    var charArray = [];
    for(var i = 0; i < argv.length; i++) {
        var obj = argv[i];
        if(!scheme.isString(obj))
            return scheme.wrongContract("string-append", "string?", i, argv);
        charArray = charArray.concat(scheme.charArrayVal(obj));
    }
    return scheme.makeString(charArray);
}

function stringToList(argv) {
    var obj = argv[0];
    if(!scheme.isString(obj))
        return scheme.wrongContract("string->list", "string?", 0, argv);
    var list = scheme.nil;
    for(var charArray = scheme.stringVal(obj), i = charArray.length - 1; i >= 0; i--) {
        list = scheme.cons(scheme.makeChar(charArray[i]), list);
    }
    return list;
}

function listToString(argv) {
    var list = argv[0];
    if(!scheme.isList(list))
        return scheme.wrongContract("list->string", "list?", 0, argv);
    var obj;
    var charArray = [];
    for(var i = 0; !scheme.isEmptyList(list); list = scheme.cdr(list), i++) {
        obj = scheme.car(list);
        if(!scheme.isChar(obj))
            return scheme.wrongContract("list->string", "(listof char?)", 0, argv);
        charArray.push(scheme.charVal(obj));
    }
    return scheme.makeString(charArray);
}

function stringCopy(argv) {
    var str = argv[0];
    if(!scheme.isString(str))
        return scheme.wrongContract("string-copy", "string?", 0, argv);
    return scheme.makeString(scheme.charArrayVal(str).slice(0));
}

function stringFill(argv) {
    var str = argv[0];
    var c = argv[1];
    if(!scheme.isString(str))
        return scheme.wrongContract("string-fill!", "string?", 0, argv);
    if(!scheme.isChar(c))
        return scheme.wrongContract("string-fill!", "char?", 1, argv);
    c = scheme.charVal(c);
    var charArray = scheme.charArrayVal(str);
    for(var i in charArray)
        charArray[i] = c;
    return scheme.voidValue;
}


//--------------------
//contract & check functions
//--------------------
function isExactNonnegativeInteger(obj) {
    return scheme.isInteger(obj) && scheme.intVal(obj) >= 0;
}

function indexRangeCheck(procedureName, type, startIndex, endIndex, length, obj) {
    var invalid = false;
    if(endIndex == -1) {
        if(startIndex >= length || length == 0)
            invalid = "index";
    }
    else if(!(0 <= startIndex && startIndex <= endIndex && startIndex <= length))
        invalid = "starting";
    else if(endIndex > length)
        invalid = "ending";
    if(invalid)
        return scheme.indexOutRangeError(procedureName, type, startIndex, endIndex, invalid, length, obj);

    return true;
}

})(scheme);
