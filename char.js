(function(s){
"use strict";

var ScmObject = s.ScmObject;

s.initChar = function() {
	s.addGlobalPrimProc("char?", char_p, 1);
}


ScmObject.makeChar = function(data) {
	return new ScmObject(3, data);
}
s.charVal = function(obj) { return obj.data; }

function char_p(argv) {
	return ScmObject.getBoolean(argv[0].isChar());
}

})(scheme);
