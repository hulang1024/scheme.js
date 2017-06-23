(function(scheme){
"use strict";

scheme.initList = function(env) {
    scheme.addPrimProc(env, "pair?", pair_p, 1);
    scheme.addPrimProc(env, "list?", list_p, 1);
    scheme.addPrimProc(env, "null?", null_p, 1);
    scheme.addPrimProc(env, "cons", cons_prim, 2);
    scheme.addPrimProc(env, "car", car_prim, 1);
    scheme.addPrimProc(env, "cdr", cdr_prim, 1);
    scheme.addPrimProc(env, "set-car!", setCar, 2);
    scheme.addPrimProc(env, "set-cdr!", setCdr, 2);
    scheme.addPrimProc(env, "list", list_prim, 0, -1);
    scheme.addPrimProc(env, "list-ref", listRef, 2);
    scheme.addPrimProc(env, "length", length, 1);
    scheme.addPrimProc(env, "append", append, 0, -1);
    scheme.addPrimProc(env, "reverse", reverse, 1);
    scheme.addPrimProc(env, "list-tail", listTail, 2);
    listFuncNames.forEach(function(funcName){
        scheme.addPrimProc(env, funcName, window.eval('scheme.' + funcName + "_prim"), 1);
    });
}

var listFuncNames = [
    "caar", "cadr", "cdar", "cddr",
    "caaar", "caadr", "cadar", "caddr", "cdaar", "cdadr", "cddar", "cdddr",
    "caaaar", "caaadr", "caadar", "caaddr", "cadaar", "cadadr", "caddar",
    "cadddr", "cdaaar", "cdaadr", "cdadar", "cdaddr", "cddaar", "cddadr", "cdddar", "cddddr"];

(function() {
    listFuncNames.forEach(function(funcName){
        var argName = "argv";
        scheme[funcName] = new Function(argName, genFuncBody(funcName, argName));
        scheme[funcName + "_prim"] = new Function(argName, genPrimBody(funcName, argName));;
    });
    
    function genFuncBody(funcName, argName) {
        var body = argName;
        for(var i = funcName.length - 2; i > 0; i--)
            body = (funcName[i] == 'a' ? "scheme.car" : "scheme.cdr") + "(" +  body + ")";
        return "return " + body;
    }

    function genPrimBody(funcName, argName) {
        var body = "if(!(";
        for(var j = funcName.length - 2; j > 0; j--) {
            var pexp = "argv[0]";
            for(var i = funcName.length - 2; i > j; i--)
                pexp = (funcName[i] == 'a' ? "scheme.car" : "scheme.cdr") + "(" +  pexp + ")";
            pexp = "scheme.isPair(" + pexp + ")";
            body += pexp;
            if(j > 1)
                body += "&&";
        }
        body += ")) return scheme.wrongContract(\"" + funcName + "\", \"pair?\", 0, " + argName + ");";
        body += genFuncBody(funcName, argName + "[0]");
        return body;
    }
})();
    
scheme.makePair = function(val) {
    return new scheme.Object(scheme_pair_type, val);
}

scheme.makeEmptyList = function(val) {
    return new scheme.Object(scheme_null_type, null);
}

scheme.nil = scheme.makeEmptyList();

scheme.arrayToList = function(array) {
    var lst = scheme.nil;
    for(var i = array.length - 1; i >= 0; i--)
        lst = scheme.cons(array[i], lst);
    return lst;
}

scheme.listToArray = function(lst) {
    var array = [];
    while(!scheme.isEmptyList(lst)) {
        array.push(scheme.car(lst));
        lst = scheme.cdr(lst);
    }
    return array;
}

scheme.mapList = function(func, lst, takeArray) {
    var ret = [];
    for(; !scheme.isEmptyList(lst); lst = scheme.cdr(lst))
        ret.push(func(scheme.car(lst)));
    return !takeArray ? scheme.arrayToList(ret) : ret;
}

scheme.append = function(list1, list2) {
    return scheme.isPair(list1) ?
        scheme.cons(scheme.car(list1), scheme.append(scheme.cdr(list1), list2)) : list2;
}

scheme.cons = function(x, y) { return new scheme.makePair([x, y]); }
scheme.car = function(pair) { return pair.val[0]; }
scheme.cdr = function(pair) { return pair.val[1]; }
scheme.setCar = function(pair, pcar) { pair.val[0] = pcar; }
scheme.setCdr = function(pair, pcdr) { pair.val[1] = pcdr; }
scheme.car_prim = car_prim;
scheme.cdr_prim = cdr_prim;
scheme.list = function() { return scheme.arrayToList(arguments); }

scheme.isList = function(obj) {
    for(; scheme.isPair(obj); obj = scheme.cdr(obj))
        if(scheme.isEmptyList(scheme.car(obj)))
            return true;
    return scheme.isEmptyList(obj);
}

scheme.listLength = function(lst) {
    var len = 0;
    while(!scheme.isEmptyList(lst)) {
        lst = scheme.cdr(lst);
        len++;
    }
    return len;
}

function list_p(argv) {
    var obj = argv[0];
    var b = false;
    for(; !b && scheme.isPair(obj); obj = scheme.cdr(obj)) {
        if(scheme.isEmptyList(scheme.car(obj)))
            b = true;
        if(scheme.cdr(obj) === obj) //check cycle ref
            return scheme.False;
    }
    if(!b && scheme.isEmptyList(obj))
        b = true;
    return scheme.getBoolean(b);
}

function pair_p(argv) {
    return scheme.getBoolean(scheme.isPair(argv[0]));
}

function null_p(argv) {
    return scheme.getBoolean(scheme.isEmptyList(argv[0]));
}

function cons_prim(argv){
    return scheme.cons(argv[0], argv[1]);
}

function car_prim(argv) {
    var obj = argv[0];
    if(!scheme.isPair(obj))
        return scheme.wrongContract("car", "pair?", 0, argv);
    return scheme.car(obj);
}

function cdr_prim(argv) {
    var obj = argv[0];
    if(!scheme.isPair(obj))
        return scheme.wrongContract("cdr", "pair?", 0, argv);
    return scheme.cdr(obj);
}

function setCar(argv) {
    var pair = argv[0];
    var pcar = argv[1];
    if(!scheme.isPair(pair))
        return scheme.wrongContract("set-car!", "pair?", 0, argv);
    scheme.setCar(pair, pcar);
    return scheme.voidValue;
}

function setCdr(argv) {
    var pair = argv[0];
    var pcdr = argv[1];
    if(!scheme.isPair(pair))
        return scheme.wrongContract("set-car!", "pair?", 0, argv);
    scheme.setCdr(pair, pcdr);
    return scheme.voidValue;
}

function list_prim(argv) {
    return scheme.arrayToList(argv);
}

function length(argv) {
    var lst = argv[0];
    if(!scheme.isList(lst))
        return scheme.wrongContract("length", "list?", 0, argv);
    return scheme.makeInt(scheme.listLength(lst));
}

function append(argv) {
    var ret = scheme.nil;
    if(argv.length > 0) {
        var i;
        for(i = 0; i < argv.length - 1; i++) {
            if(!(scheme.isPair(argv[i]) || scheme.isEmptyList(argv[i])))
                return scheme.wrongContract("append", "pair?", i, argv);
            ret = scheme.append(ret, argv[i]);
        }
        ret = scheme.append(ret, argv[i]);
    }
    return ret;
}

function reverse(argv) {
    var ret = scheme.nil;
    var lst = argv[0]
    if(!scheme.isList(lst))
        return scheme.wrongContract("reverse", "list?", 0, argv);
    for(; !scheme.isEmptyList(lst); lst = scheme.cdr(lst))
        ret = scheme.cons(scheme.car(lst), ret);
    return ret;
}

function listTail(argv) {
    return doCheckedListRef("list-tail", false, argv);
}

function listRef(argv) {
    return doCheckedListRef("list-ref", true, argv);
}

function doCheckedListRef(name, takecar, argv) {
    var lst = argv[0];
    var k = argv[1];
    if(!scheme.isPair(lst))
        return scheme.wrongContract(name, "pair?", 0, argv);
    if(!scheme.isNumber(k))
        return scheme.wrongContract(name, "exact-nonnegative-integer?", 1, argv);
    k = scheme.intVal(k);
    if(k < 0)
        return scheme.wrongContract(name, "exact-nonnegative-integer?", 1, argv);
    for(var i = 0; i < k; i++) {
        if(!scheme.isPair(lst))
            return scheme.wrongContract(name, "pair?", 0, argv);
        lst = scheme.cdr(lst);
    }
    if(takecar) {
        if(!scheme.isPair(lst))
            return scheme.wrongContract(name, "pair?", 0, argv);
        return scheme.car(lst);
    }
    return lst;
}
})(scheme);
