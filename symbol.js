(function(s){
"use strict";

s.initSymbol = function() {
    s.addGlobalPrimProc("symbol?", symbol_p, 1);
}

s.makeSymbol = function(val) {
    return new s.Object(6, val);
}
s.symbolVal = function(obj) { return obj.val; }

s.symbolTable = {};
s.internSymbol = function(str) {
    var sym = s.symbolTable[str];
    if(sym == undefined) {
        sym = s.makeSymbol(str);
        s.symbolTable[str] = sym;
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

function symbol_p(argv) {
    return s.getBoolean(argv[0].isSymbol());
}

})(scheme);
