(function(s){
"use strict";

var ScmObject = s.ScmObject;

s.initMyObject = function() {
}

ScmObject.makeMyObject = function(data) {
	return new ScmObject(30, data);
}
s.objectVal = function(obj) { return obj.data; }


})(scheme);
