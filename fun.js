//function

(function(s){
"use strict";

var ScmObject = s.ScmObject;

s.initFun = function() {
	var addGlobalPrimProc = s.addGlobalPrimProc;
	
	addGlobalPrimProc("procedure?", isProcedure, 1);
	addGlobalPrimProc("apply", mapply, 2);
	addGlobalPrimProc("eval", meval, 2);
	addGlobalPrimProc("for-each", mforEach, 2);
}

function isProcedure(argv) {
	return ScmObject.getBoolean(argv[0].isProcedure());
}

function meval(argv) {
	var exp = argv[0];
	var env = argv[1];
	if(!env.isNamespace())
		return s.wrongContract("meval", argv, "namespace?", env);
	return s.eval(exp, env.data);
}
function mapply(argv) {
	var procedure = argv[0];
	if(!procedure.isProcedure())
		return s.wrongContract("mapply", argv, "procedure?", procedure);
	var argv1 = argv[1];
	if(!argv1.isPair())
		return s.wrongContract("mapply", argv, "pair?", argv1);
	return s.apply(procedure, s.listToArray(argv1));
}


function mforEach(argv) {
	var proc = argv[0];
	if(!proc.isProcedure())
		return s.wrongContract("mfor-each", argv, "procedure?", proc, 0);
	var list = argv[1];
	if(!list.isPair())
		return s.wrongContract("mfor-each", argv, "pair?", list, 1);
	
	while(!list.isEmptyList()) {
		s.apply(proc, [s.car(list)]);
		list = s.cdr(list);
	}
	return s.ok;
}


})(scheme);
