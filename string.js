(function(s){
"use strict";

s.initString = function(env) {
    s.addPrimProc(env, "string?", string_p, 1);
    s.addPrimProc(env, "make-string", makeString, 1, 2);
    s.addPrimProc(env, "string", string, 0, -1);
    s.addPrimProc(env, "string-length", stringLength, 1);
    s.addPrimProc(env, "string-ref", stringRef, 2);
    s.addPrimProc(env, "string-set!", stringSet, 3);
    s.addPrimProc(env, "string=?", stringEqual, 2);
    s.addPrimProc(env, "string-ci=?", stringCIEqual, 2);
    s.addPrimProc(env, "substring", substring, 3);
    s.addPrimProc(env, "string->list", stringToList, 1);
    s.addPrimProc(env, "list->string", listToString, 1);
    s.addPrimProc(env, "string-copy", stringCopy, 1);
    s.addPrimProc(env, "string-fill!", stringFill, 2);
    s.addPrimProc(env, "string-append", stringAppend, 0, -1);
}

s.makeString = function(val) {
    if(typeof val == "string")
        val = val.split("");
    return new s.Object(4, val);
}
s.charArrayVal = function(obj) { return obj.val; }
s.stringVal = function(obj) { return obj.val.join(""); }
s.stringLen = function(obj) { return obj.val.length; }

function string_p(argv) {
    return s.getBoolean(argv[0].isString());
}

function makeString(argv) {
    var k = argv[0];
    if(!isExactNonnegativeInteger(k))
        return s.wrongContract("make->string", "exact-nonnegative-integer?", 0, argv);
    k = s.intVal(k);
    var c = '\0';
    if(argv.length == 2) {
        c = argv[1];
        if(!c.isChar())
            return s.wrongContract("make->string", "char?", 1, argv);
        c = s.charVal(c);
    }
    var charArray = [];
    for(; k > 0; k--)
        charArray.push(c);
    return s.makeString(charArray);
}

function string(argv) {
    var charArray = [];
    for(var i = 0; i < argv.length; i++) {
        var obj = argv[i];
        if(!obj.isChar())
            return s.wrongContract("string", "char?", i, argv);
        charArray.push(s.charVal(obj));
    }
    return s.makeString(charArray);
}

function stringLength(argv) {
    var obj = argv[0];
    if(!obj.isString())
        return s.wrongContract("string-length", "string?", 0, argv);
    return s.makeInt(s.stringLen(obj));
}

function stringRef(argv) {
    var str = argv[0];
    var k = argv[1];
    if(!str.isString())
        return s.wrongContract("string-ref", "string?", 0, argv);
    if(!isExactNonnegativeInteger(k))
        return s.wrongContract("string-ref", "exact-nonnegative-integer?", 1, argv);
    k = s.intVal(k);
    if(indexRangeCheck("string-ref", "string", k, -1, s.stringLen(str), str))
        return s.makeChar(s.charArrayVal(str)[k]);
}

function stringSet(argv) {
    var str = argv[0];
    var k = argv[1];
    var c = argv[2];
    if(!str.isString())
        return s.wrongContract("string-set!", "string?", 0, argv);
    if(!isExactNonnegativeInteger(k))
        return s.wrongContract("string-set!", "exact-nonnegative-integer?", 1, argv);
    if(!c.isChar())
        return s.wrongContract("string-set!", "char?", 2, argv);
    k = s.intVal(k);
    if(indexRangeCheck("string-set!", "string", k, -1, s.stringLen(str), str)) {
        s.charArrayVal(str)[k] = s.charVal(c);
        return s.voidValue;
    }
}

function stringEqual(argv) {
    var str1 = argv[0];
    var str2 = argv[1];
    if(!str1.isString())
        return s.wrongContract("string=?", "string?", 0, argv);
    if(!str2.isString())
        return s.wrongContract("string=?", "string?", 1, argv);
    return s.getBoolean(s.stringVal(str1) == s.stringVal(str2));
}

function stringCIEqual(argv) {
    var str1 = argv[0];
    var str2 = argv[1];
    if(!str1.isString())
        return s.wrongContract("string=?", "string?", 0, argv);
    if(!str2.isString())
        return s.wrongContract("string=?", "string?", 1, argv);
    return s.getBoolean(
        s.stringVal(str1).toLowerCase() == s.stringVal(str2).toLowerCase());
}

function substring(argv) {
    var str = argv[0];
    var start = argv[1];
    var end = argv[2];
    if(!str.isString())
        return s.wrongContract("substring", "string?", 0, argv);
    if(!isExactNonnegativeInteger(start))
        return s.wrongContract("substring", "exact-nonnegative-integer?", 1, argv);
    if(!isExactNonnegativeInteger(end))
        return s.wrongContract("substring", "exact-nonnegative-integer?", 2, argv);
    start = s.intVal(start);
    end = s.intVal(end);
    if(indexRangeCheck("substring", "string", start, end, s.stringLen(str), str)) {
        return s.makeString(s.charArrayVal(str).slice(start, end));
    }
}

function stringAppend(argv) {
    var charArray = [];
    for(var i = 0; i < argv.length; i++) {
        var obj = argv[i];
        if(!obj.isString())
            return s.wrongContract("string->append", "string?", i, argv);
        charArray = charArray.concat(s.charArrayVal(obj));
    }
    return s.makeString(charArray);
}

function stringToList(argv) {
    var obj = argv[0];
    if(!obj.isString())
        return s.wrongContract("string->list", "string?", 0, argv);
    var list = s.nil;
    for(var charArray = s.stringVal(obj), i = charArray.length - 1; i >= 0; i--) {
        list = s.cons(s.makeChar(charArray[i]), list);
    }
    return list;
}

function listToString(argv) {
    var list = argv[0];
    if(!s.isList(list))
        return s.wrongContract("list->string", "list?", 0, argv);
    var obj;
    var charArray = [];
    for(var i = 0; !list.isEmptyList(); list = s.cdr(list), i++) {
        obj = s.car(list);
        if(!obj.isChar())
            return s.wrongContract("list->string", "(listof char?)", 0, argv);
        charArray.push(s.charVal(obj));
    }
    return s.makeString(charArray);
}

function stringCopy(argv) {
    var str = argv[0];
    if(!str.isString())
        return s.wrongContract("string-copy", "string?", 0, argv);
    return s.makeString(s.charArrayVal(str).slice(0));
}

function stringFill(argv) {
    var str = argv[0];
    var c = argv[1];
    if(!str.isString())
        return s.wrongContract("string-fill!", "string?", 0, argv);
    if(!c.isChar())
        return s.wrongContract("string-fill!", "char?", 1, argv);
    c = s.charVal(c);
    var charArray = s.charArrayVal(str);
    for(var i in charArray)
        charArray[i] = c;
    return s.voidValue;
}


//--------------------
//contract & check functions
//--------------------
function isExactNonnegativeInteger(obj) {
    return obj.isInteger() && s.intVal(obj) >= 0;
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
        return s.indexOutRangeError(procedureName, type, startIndex, endIndex, invalid, length, obj);

    return true;
}

})(scheme);
