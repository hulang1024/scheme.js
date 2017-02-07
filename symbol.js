(function(s){
"use strict";

var ScmObject = s.ScmObject;

s.initSymbol = function() {
	s.addGlobalPrimProc("symbol?", symbol_p, 1);
}

ScmObject.makeSymbol = function(data) {
	return new ScmObject(6, data);
}
s.symbolVal = function(obj) { return obj.data; }

s.symbolMap = {};
s.pushSymbol = function(name) {
	return s.symbolMap[name] = ScmObject.makeSymbol(name);
}
s.getSymbol = function(name) {
	var sym = s.symbolMap[name];
	return sym ? sym : ScmObject.makeSymbol(name);
}

s.quoteSymbol = s.pushSymbol('quote');
s.ifSymbol = s.pushSymbol('if');
s.defineSymbol = s.pushSymbol('define');
s.assignmentSymbol = s.pushSymbol('set!');
s.lambdaSymbol = s.pushSymbol('lambda');
s.beginSymbol = s.pushSymbol('begin');
s.condSymbol = s.pushSymbol('cond');
s.elseSymbol = s.pushSymbol('else');
s.letSymbol = s.pushSymbol('let');
s.dotSymbol = s.pushSymbol('.');

function symbol_p(argv) {
	return ScmObject.getBoolean(argv[0].isSymbol());
}

})(scheme);
