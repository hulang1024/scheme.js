(function(s){
"use strict";

s.initMyObject = function() {
}

s.makeMyObject = function(val) {
	return new s.Object(30, val);
}
s.objectVal = function(obj) { return obj.val; }

})(scheme);
