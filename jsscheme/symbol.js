(function(s){
"use strict";

s.initSymbol = function(env) {
    s.addPrimProc(env, "symbol?", symbol_p, 1);
    s.addPrimProc(env, "symbol->string", symbolToString, 1);
    s.addPrimProc(env, "string->symbol", stringToSymbol, 1);
    
    s.resetGenSymbol();
}

s.makeSymbol = function(val) {
    return new s.Object(6, val);
}
s.symbolVal = function(obj) { return obj.val; }

s.symbolTable = [];
s.internSymbol = function(str) {
    var nameInTable = "__scheme_symbol_" + str;
    var sym = s.symbolTable[nameInTable];
    if(!(sym instanceof s.Object)) {
        sym = s.makeSymbol(str);
        s.symbolTable[nameInTable] = sym;
    }
    return sym;
}

s.dotSymbol = s.internSymbol('.');
s.quoteSymbol = s.internSymbol('quote');
s.ifSymbol = s.internSymbol('if');
s.defineSymbol = s.internSymbol('define');
s.assignmentSymbol = s.internSymbol('set!');
s.lambdaSymbol = s.internSymbol('lambda');
s.beginSymbol = s.internSymbol('begin');
s.condSymbol = s.internSymbol('cond');
s.caseSymbol = s.internSymbol('case');
s.elseSymbol = s.internSymbol('else');
s.andSymbol = s.internSymbol('and');
s.orSymbol = s.internSymbol('or');
s.whenSymbol = s.internSymbol('when');
s.unlessSymbol = s.internSymbol('unless');
s.letSymbol = s.internSymbol('let');
s.doSymbol = s.internSymbol('do');
s.whileSymbol = s.internSymbol('while');
s.forSymbol = s.internSymbol('for');

function symbol_p(argv) {
    return s.getBoolean(argv[0].isSymbol());
}

function symbolToString(argv) {
    if(!argv[0].isSymbol())
        return s.wrongContract("symbol->string", "symbol?", 0, argv);
    return s.makeString(s.symbolVal(argv[0]).toLowerCase());
}

function stringToSymbol(argv) {
    if(!argv[0].isString())
        return s.wrongContract("string->symbol", "string?", 0, argv);
    return s.makeSymbol(s.stringVal(argv[0]));
}


var gensymNum = 0;
s.resetGenSymbol = function() {
    gensymNum = 0;
}
s.genSymbol = function() {
    gensymNum++;
    return s.makeSymbol("__scheme_gensym_" + gensymNum);
}

})(scheme);
