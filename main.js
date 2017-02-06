(function(s){
"use strict";

s.initBasicEnv();

s.evalString = function(str) {
	s.error = null;
	var exps = s.parse(str);
	if(exps.constructor == String) {
		s.console.value += exps;
		return;
	}

	for(var i = 0; i < exps.length; i++) {
		try {
			var obj = s.eval(exps[i], s.globalEnvironment);
		} catch(e) {
			s.console.value += e + "\n";
			throw e;
		} 
		if(!s.error)
			s.printValue(obj);
		else {
			s.printError();
			break;
		}
	}
}

})(scheme);
