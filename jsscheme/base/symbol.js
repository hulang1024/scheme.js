(function(scheme){
"use strict";

scheme.initSymbol = function(env) {
    scheme.addPrimProc(env, "symbol?", symbol_p, 1);
    scheme.addPrimProc(env, "symbol->string", symbolToString, 1);
    scheme.addPrimProc(env, "symbol->string-ci", symbolToStringCi, 1);
    scheme.addPrimProc(env, "string->symbol", stringToSymbol, 1);
    
    scheme.resetGenSymbol();
}

scheme.makeSymbol = function(val) {
    return new scheme.Object(scheme_symbol_type, val);
}
scheme.symbolVal = function(obj) { return obj.val; }

scheme.symbolTable = [];
scheme.internSymbol = function(str) {
    var nameInTable = "__scheme_symbol_" + str;
    var sym = scheme.symbolTable[nameInTable];
    if(!(sym instanceof scheme.Object)) {
        sym = scheme.makeSymbol(str);
        scheme.symbolTable[nameInTable] = sym;
    }
    return sym;
}

scheme.dotSymbol = scheme.internSymbol('.');
scheme.quoteSymbol = scheme.internSymbol('quote');
scheme.ifSymbol = scheme.internSymbol('if');
scheme.defineSymbol = scheme.internSymbol('define');
scheme.assignmentSymbol = scheme.internSymbol('set!');
scheme.lambdaSymbol = scheme.internSymbol('lambda');
scheme.beginSymbol = scheme.internSymbol('begin');
scheme.condSymbol = scheme.internSymbol('cond');
scheme.caseSymbol = scheme.internSymbol('case');
scheme.elseSymbol = scheme.internSymbol('else');
scheme.andSymbol = scheme.internSymbol('and');
scheme.orSymbol = scheme.internSymbol('or');
scheme.whenSymbol = scheme.internSymbol('when');
scheme.unlessSymbol = scheme.internSymbol('unless');
scheme.letSymbol = scheme.internSymbol('let');
scheme.doSymbol = scheme.internSymbol('do');
scheme.whileSymbol = scheme.internSymbol('while');
scheme.forSymbol = scheme.internSymbol('for');

function symbol_p(argv) {
    return scheme.getBoolean(scheme.isSymbol(argv[0]));
}

function symbolToString(argv) {
    if(!scheme.isSymbol(argv[0]))
        return scheme.wrongContract("symbol->string", "symbol?", 0, argv);
    return scheme.makeString(scheme.symbolVal(argv[0]).toLowerCase());
}

function symbolToStringCi(argv) {
    if(!scheme.isSymbol(argv[0]))
        return scheme.wrongContract("symbol->string", "symbol?", 0, argv);
    return scheme.makeString(scheme.symbolVal(argv[0]));
}

function stringToSymbol(argv) {
    if(!scheme.isString(argv[0]))
        return scheme.wrongContract("string->symbol", "string?", 0, argv);
    return scheme.makeSymbol(scheme.stringVal(argv[0]));
}


var gensymNum = 0;
scheme.resetGenSymbol = function() {
    gensymNum = 0;
}
scheme.genSymbol = function() {
    gensymNum++;
    return scheme.makeSymbol("__scheme_gensym_" + gensymNum);
}

})(scheme);
