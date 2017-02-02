(function(s){
"use strict";

var ScmObject = s.ScmObject;

s.EnvironmentFrame = function(map, baseEnv) {
	this.map = map;
	this.baseEnv = baseEnv;
}

s.addGlobalPrimProc = function(name, func, minArgs, maxArgs) {
	s.globalEnvironment.map[name] = ScmObject.makePrimProc(name, func, minArgs, maxArgs);
}

s.addGlobalObject = function(name, obj) {
	s.globalEnvironment.map[name] = obj;
}

s.globalEnvironment = new s.EnvironmentFrame({}, null);

//setupEnvironment();

})(scheme);
