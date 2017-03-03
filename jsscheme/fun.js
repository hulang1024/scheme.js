(function(s){
"use strict";

s.initFun = function(env) {
    s.addPrimProc(env, "procedure?", procedure_p, 1);
    s.addPrimProc(env, "apply", apply, 2, -1);
    s.addPrimProc(env, "for-each", forEach, 2);
    s.addPrimProc(env, "map", map, 2, -1);
    s.addPrimProc(env, "void", void_prim, 0);
    s.addPrimProc(env, "void?", void_p, 1);
}

function procedure_p(argv) {
    return s.getBoolean(argv[0].isProcedure());
}

function apply(argv) {
    var procedure = argv[0];
    var argv1 = argv[1];
    if(!procedure.isProcedure())
        return s.wrongContract("apply", "procedure?", 0, argv);
    if(!argv1.isPair())
        return s.wrongContract("apply", "list?", 1, argv);
    return s.apply(procedure, s.listToArray(argv1));
}

function forEach(argv) {
    var proc = argv[0];
    var list = argv[1];
    if(!proc.isProcedure())
        return s.wrongContract("for-each", "procedure?", 0, argv);
    if(!list.isPair())
        return s.wrongContract("for-each", "pair?", 1, argv);
    while(!list.isEmptyList()) {
        s.apply(proc, [s.car(list)]);
        list = s.cdr(list);
    }
    return s.voidValue;
}

function map(argv) {
    var proc = argv[0];
    var lists = argv.slice(1);
    if(!proc.isProcedure())
        return s.wrongContract("map", "procedure?", 0, argv);
    for(var i = 0; i < lists.length; i++) {
        if(!lists[i].isPair())
            return s.wrongContract("map", "list?", i+1, argv);
    }
    
    var ret = [];
    var appArgv = [];
    for(var first = lists[0]; !first.isEmptyList(); first = s.cdr(first)) {
        var appArgv = [];
        appArgv.push(s.car(first));
        for(var i = 1; i < lists.length; i++) {
            if(!lists[i].isPair())
                return s.wrongContract("map", "list?", i+1, argv);
            appArgv.push(s.car(lists[i]));
            lists[i] = s.cdr(lists[i]);
        }
        ret.push(s.apply(proc, appArgv));
    }
    return s.arrayToList(ret);
}

function void_prim(argv) {
    return s.voidValue;
}

function void_p(argv) {
    return s.getBoolean(argv[0] === s.voidValue);
}
})(scheme);
