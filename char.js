(function(s){
"use strict";

var ScmObject = s.ScmObject;

s.initChar = function() {
	var addGlobalPrimProc = s.addGlobalPrimProc;
	
	addGlobalPrimProc("char?", isChar, 1);
}


ScmObject.makeChar = function(data) {
	return new ScmObject(3, data);
}
s.charVal = function(obj) { return obj.data; }

function isChar(argv) {
	return ScmObject.getBoolean(argv[0].isChar());
}

})(scheme);
