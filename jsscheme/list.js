(function(s){
"use strict";

s.initList = function(env) {
    s.addPrimProc(env, "pair?", pair_p, 1);
    s.addPrimProc(env, "list?", list_p, 1);
    s.addPrimProc(env, "null?", null_p, 1);
    s.addPrimProc(env, "cons", cons_prim, 2);
    s.addPrimProc(env, "car", car_prim, 1);
    s.addPrimProc(env, "cdr", cdr_prim, 1);
    s.addPrimProc(env, "set-car!", setCar, 2);
    s.addPrimProc(env, "set-cdr!", setCdr, 2);
    s.addPrimProc(env, "list", list, 0, -1);
    s.addPrimProc(env, "list-ref", listRef, 2);
    s.addPrimProc(env, "length", length, 1);
    s.addPrimProc(env, "append", append, 0, -1);
    s.addPrimProc(env, "reverse", reverse, 1);
    s.addPrimProc(env, "list-tail", listTail, 2);
    listFuncNames.forEach(function(funcName){
        s.addPrimProc(env, funcName, window.eval('scheme.' + funcName + "_prim"), 1);
    });
}

var listFuncNames = [
    "caar", "cadr", "cdar", "cddr",
    "caaar", "caadr", "cadar", "caddr", "cdaar", "cdadr", "cddar", "cdddr",
    "caaaar", "caaadr", "caadar", "caaddr", "cadaar", "cadadr", "caddar",
    "cadddr", "cdaaar", "cdaadr", "cdadar", "cdaddr", "cddaar", "cddadr", "cdddar", "cddddr"];

function genListFuncs() {
    listFuncNames.forEach(function(funcName){
        var argName = "argv";
        s[funcName] = new Function(argName, genFuncBody(funcName, argName));
        s[funcName + "_prim"] = new Function(argName, genPrimBody(funcName, argName));;
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
            pexp += ".isPair()";
            body += pexp;
            if(j > 1)
                body += "&&";
        }
        body += ")) return scheme.wrongContract(\"" + funcName + "\", \"pair?\", 0, " + argName + ");";
        body += genFuncBody(funcName, argName + "[0]");
        return body;
    }
}

genListFuncs();
    
s.makePair = function(val) {
    return new s.Object(7, val);
}

s.makeEmptyList = function(val) {
    return new s.Object(0, null);
}

s.nil = s.makeEmptyList();

s.arrayToList = function(array) {
    var list = s.nil;
    for(var i = array.length - 1; i >= 0; i--)
        list = s.cons(array[i], list);
    return list;
}

s.listToArray = function(list) {
    var array = [];
    while(!list.isEmptyList()) {
        array.push(s.car(list));
        list = s.cdr(list);
    }
    return array;
}

s.mapList = function(func, list) {
    var ret = [];
    for(; !list.isEmptyList(); list = s.cdr(list))
        ret.push(func(s.car(list)));
    return s.arrayToList(ret);
}

s.append = function(list1, list2) {
    return list1.isPair() ?
        s.cons(s.car(list1), s.append(s.cdr(list1), list2)) : list2;
}

s.cons = function(x, y) { return new s.makePair([x, y]); }
s.car = function(pair) { return pair.val[0]; }
s.cdr = function(pair) { return pair.val[1]; }
s.setCar = function(pair, pcar) { pair.val[0] = pcar; }
s.setCdr = function(pair, pcdr) { pair.val[1] = pcdr; }
s.car_prim = car_prim;
s.cdr_prim = cdr_prim;

s.isList = function(obj) {
    for(; obj.isPair(); obj = s.cdr(obj))
        if(s.car(obj).isEmptyList())
            return true;
    return obj.isEmptyList();
}

s.listLength = function(list) {
    var len = 0;
    while(!list.isEmptyList()) {
        list = s.cdr(list);
        len++;
    }
    return len;
}

function list_p(argv) {
    var obj = argv[0];
    var b = false;
    for(; !b && obj.isPair(); obj = s.cdr(obj)) {
        if(s.car(obj).isEmptyList())
            b = true;
        if(s.cdr(obj) === obj) //check cycle ref
            return s.False;
    }
    if(!b && obj.isEmptyList())
        b = true;
    return s.getBoolean(b);
}

function pair_p(argv) {
    return s.getBoolean(argv[0].isPair());
}

function null_p(argv) {
    return s.getBoolean(argv[0].isEmptyList());
}

function cons_prim(argv){
    return s.cons(argv[0], argv[1]);
}

function car_prim(argv) {
    var obj = argv[0];
    if(!obj.isPair())
        return s.wrongContract("car", "pair?", 0, argv);
    return s.car(obj);
}

function cdr_prim(argv) {
    var obj = argv[0];
    if(!obj.isPair())
        return s.wrongContract("cdr", "pair?", 0, argv);
    return s.cdr(obj);
}

function setCar(argv) {
    var pair = argv[0];
    var pcar = argv[1];
    if(!pair.isPair())
        return s.wrongContract("set-car!", "pair?", 0, argv);
    s.setCar(pair, pcar);
    return s.voidValue;
}

function setCdr(argv) {
    var pair = argv[0];
    var pcdr = argv[1];
    if(!pair.isPair())
        return s.wrongContract("set-car!", "pair?", 0, argv);
    s.setCdr(pair, pcdr);
    return s.voidValue;
}

function list(argv) {
    return s.arrayToList(argv);
}

function length(argv) {
    var list = argv[0];
    if(!s.isList(list))
        return s.wrongContract("length", "list?", 0, argv);
    return s.makeInt(s.listLength(list));
}

function append(argv) {
    var ret = s.nil;
    if(argv.length > 0) {
        var i;
        for(i = 0; i < argv.length - 1; i++) {
            if(!(argv[i].isPair() || argv[i].isEmptyList()))
                return s.wrongContract("append", "pair?", i, argv);
            ret = s.append(ret, argv[i]);
        }
        ret = s.append(ret, argv[i]);
    }
    return ret;
}

function reverse(argv) {
    var ret = s.nil;
    var lst = argv[0]
    if(!s.isList(lst))
        return s.wrongContract("reverse", "list?", 0, argv);
    for(; !lst.isEmptyList(); lst = s.cdr(lst))
        ret = s.cons(s.car(lst), ret);
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
    if(!lst.isPair())
        return s.wrongContract(name, "pair?", 0, argv);
    if(!k.isNumber())
        return s.wrongContract(name, "exact-nonnegative-integer?", 1, argv);
    k = s.intVal(k);
    if(k < 0)
        return s.wrongContract(name, "exact-nonnegative-integer?", 1, argv);
    for(var i = 0; i < k; i++) {
        if(!lst.isPair())
            return s.wrongContract(name, "pair?", 0, argv);
        lst = s.cdr(lst);
    }
    if(takecar) {
        if(!lst.isPair())
            return s.wrongContract(name, "pair?", 0, argv);
        return s.car(lst);
    }
    return lst;
}
})(scheme);
