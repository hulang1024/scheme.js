(function(scheme){
"use strict";

scheme.initFun = function(env) {
    scheme.addPrimProc(env, "procedure?", procedure_p, 1);
    scheme.addPrimProc(env, "apply", apply, 2, -1);
    scheme.addPrimProc(env, "for-each", forEach, 2);
    scheme.addPrimProc(env, "map", map, 2, -1);
    scheme.addPrimProc(env, "void", void_prim, 0);
    scheme.addPrimProc(env, "void?", void_p, 1);
}

function procedure_p(argv) {
    return scheme.getBoolean(scheme.isProcedure(argv[0]));
}

function apply(argv) {
    var procedure = argv[0];
    var argv1 = argv[1];
    if(!scheme.isProcedure(procedure))
        return scheme.wrongContract("apply", "procedure?", 0, argv);
    if(!scheme.isList(argv1))
        return scheme.wrongContract("apply", "list?", 1, argv);
    return scheme.apply(procedure, scheme.listToArray(argv1));
}

function forEach(argv) {
    var proc = argv[0];
    var list = argv[1];
    if(!scheme.isProcedure(proc))
        return scheme.wrongContract("for-each", "procedure?", 0, argv);
    if(!scheme.isList(list))
        return scheme.wrongContract("for-each", "list?", 1, argv);
    while(!scheme.isEmptyList(list)) {
        scheme.apply(proc, [scheme.car(list)]);
        list = scheme.cdr(list);
    }
    return scheme.voidValue;
}

function map(argv) {
    var proc = argv[0];
    var lists = argv.slice(1);
    if(!scheme.isProcedure(proc))
        return scheme.wrongContract("map", "procedure?", 0, argv);
    for(var i = 0; i < lists.length; i++) {
        if(!scheme.isList(lists[i]))
            return scheme.wrongContract("map", "list?", i + 1, argv);
    }
    
    var ret = [];
    var appArgv = [];
    for(var first = lists[0]; !scheme.isEmptyList(first); first = scheme.cdr(first)) {
        var appArgv = [];
        appArgv.push(scheme.car(first));
        for(var i = 1; i < lists.length; i++) {
            if(!scheme.isList(lists[i]))
                return scheme.wrongContract("map", "list?", i + 1, argv);
            appArgv.push(scheme.car(lists[i]));
            lists[i] = scheme.cdr(lists[i]);
        }
        ret.push(scheme.apply(proc, appArgv));
    }
    return scheme.arrayToList(ret);
}

function void_prim(argv) {
    return scheme.voidValue;
}

function void_p(argv) {
    return scheme.getBoolean(argv[0] === scheme.voidValue);
}
})(scheme);
