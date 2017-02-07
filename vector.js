(function(s){
"use strict";

var ScmObject = s.ScmObject;

s.initVector = function() {
}

ScmObject.makeVector = function(data) {
	return new ScmObject(11, data);
}

})(scheme);
