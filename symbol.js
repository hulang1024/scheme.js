(function(s){
"use strict";

var ScmObject = s.ScmObject;

s.initSymbol = function() {
	var addGlobalPrimProc = s.addGlobalPrimProc;
	
	addGlobalPrimProc("symbol?", isSymbol, 1);
}

ScmObject.makeSymbol = function(data) {
	return new ScmObject(6, data);
}
s.symbolVal = function(obj) { return obj.data; }

// 符号表
s.symbolMap = {};
s.pushSymbol = function(name) {
	return s.symbolMap[name] = ScmObject.makeSymbol(name);
}
s.getSymbol = function(name) {
	var sym = s.symbolMap[name];
	return sym ? sym : ScmObject.makeSymbol(name);
}

// 基本符号
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

function isSymbol(argv) {
	return ScmObject.getBoolean(argv[0].isSymbol());
}

})(scheme);
