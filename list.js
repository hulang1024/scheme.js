(function(s){
"use strict";

s.initList = function() {
    s.addGlobalPrimProc("pair?", pair_p, 1);
    s.addGlobalPrimProc("list?", list_p, 1);
    s.addGlobalPrimProc("null?", null_p, 1);
    s.addGlobalPrimProc("cons", cons_prim, 2);
    s.addGlobalPrimProc("car", car_prim, 1);
    s.addGlobalPrimProc("cdr", cdr_prim, 1);
    s.addGlobalPrimProc("set-car!", setCar, 2);
    s.addGlobalPrimProc("set-cdr!", setCdr, 2);
    s.addGlobalPrimProc("list", list, 0, -1);
    s.addGlobalPrimProc("list-ref", listRef, 2);
    s.addGlobalPrimProc("length", length, 1);
    listFuncNames.forEach(function(funcName){
        s.addGlobalPrimProc(funcName, window.eval('scheme.' + funcName + "_prim"), 1);
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

s.pairToArray = function(pair) {
    var array = [];
    while(pair.isPair()) {
        array.push(s.car(pair));
        pair = s.cdr(pair);
    }
    array.push(pair);
    return array;
}

s.pairsLength = function(pairs) {
    return !pairs.isPair() ? 0 : 1 + s.pairsLength(s.cdr(pairs));
}

s.mapList = function(func, list) {
    if(list.isEmptyList())
        return s.nil;
    else
        return s.cons(func(s.car(list)), s.mapList(func, s.cdr(list)));
}

s.cons = function(x, y) { return new s.makePair([x, y]); }
s.car = function(pair) { return pair.val[0]; }
s.cdr = function(pair) { return pair.val[1]; }
s.setCar = function(pair, pcar) { pair.val[0] = pcar; }
s.setCdr = function(pair, pcdr) { pair.val[1] = pcdr; }
s.list = list;
s.car_prim = car_prim;
s.cdr_prim = cdr_prim;

s.isList = function(obj) {
    for(; obj.isPair(); obj = s.cdr(obj))
        if(s.car(obj).isEmptyList())
            return true;
    return obj.isEmptyList();
}

s.listRef = function(list, index) {
    for(var i = 0; i < index; i++)
        list = s.cdr(list);
    return s.car(list);
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
    for(; !b && obj.isPair(); obj = s.cdr(obj))
        if(s.car(obj).isEmptyList())
            b = true;
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
    var l = s.nil;
    for(var i = argv.length - 1; i >= 0; i--)
        l = s.cons(argv[i], l);
    return l;
}

function listRef(argv) {
    var pair = argv[0];
    var index = argv[1];
    if(!pair.isPair())
        return s.wrongContract("list-ref", "pair?", 0, argv);
    if(!index.isNumber())
        return s.wrongContract("list-ref", "number?", 0, argv);
    index = s.intVal(index);
    for(var i = 0; i < index; i++)
        pair = s.cdr(pair);
    return s.car(pair);
}

function length(argv) {
    var list = argv[0];
    if(!s.isList(list))
        return s.wrongContract("length", "list?", 0, argv);
    return s.makeInt(s.listLength(list));
}

})(scheme);
