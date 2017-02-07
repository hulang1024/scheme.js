﻿//function

(function(s){
"use strict";

var ScmObject = s.ScmObject;

s.initFun = function() {
	s.addGlobalPrimProc("procedure?", procedure_p, 1);
	s.addGlobalPrimProc("apply", apply, 2);
	s.addGlobalPrimProc("for-each", forEach, 2);
}

function procedure_p(argv) {
	return ScmObject.getBoolean(argv[0].isProcedure());
}

function apply(argv) {
	var procedure = argv[0];
	var argv1 = argv[1];
	if(!procedure.isProcedure())
		return s.wrongContract("mapply", argv, "procedure?", procedure);
	if(!argv1.isPair())
		return s.wrongContract("mapply", argv, "pair?", argv1);
	return s.apply(procedure, s.listToArray(argv1));
}

function forEach(argv) {
	var proc = argv[0];
	var list = argv[1];
	if(!proc.isProcedure())
		return s.wrongContract("mfor-each", argv, "procedure?", proc, 0);
	if(!list.isPair())
		return s.wrongContract("mfor-each", argv, "pair?", list, 1);
	while(!list.isEmptyList()) {
		s.apply(proc, [s.car(list)]);
		list = s.cdr(list);
	}
	return s.ok;
}

})(scheme);