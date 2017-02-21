(function(s){
"use strict";

s.initSymbol = function(env) {
    s.addPrimProc(env, "symbol?", symbol_p, 1);
}

s.makeSymbol = function(val) {
    return new s.Object(6, val);
}
s.symbolVal = function(obj) { return obj.val; }

s.symbolTable = [];
s.internSymbol = function(str) {
    var nameInTable = "__scheme_symbol_" + str;
    var sym = s.symbolTable[nameInTable];//no eg toString, prototype..
    if(!(sym instanceof s.Object)) {
        sym = s.makeSymbol(str);
        s.symbolTable[nameInTable] = sym;
    }
    return sym;
}

s.quoteSymbol = s.internSymbol('quote');
s.ifSymbol = s.internSymbol('if');
s.defineSymbol = s.internSymbol('define');
s.assignmentSymbol = s.internSymbol('set!');
s.lambdaSymbol = s.internSymbol('lambda');
s.beginSymbol = s.internSymbol('begin');
s.condSymbol = s.internSymbol('cond');
s.elseSymbol = s.internSymbol('else');
s.letSymbol = s.internSymbol('let');
s.dotSymbol = s.internSymbol('.');
s.andSymbol = s.internSymbol('and');
s.orSymbol = s.internSymbol('or');

function symbol_p(argv) {
    return s.getBoolean(argv[0].isSymbol());
}

var gensymNum = 0;
s.genSymbol = function() {
    gensymNum++;
    return "__gensym_" + gensymNum;
}

})(scheme);
