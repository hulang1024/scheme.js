(function(s){
"use strict";

var ScmObject = s.ScmObject;

s.printObj = function(obj) {
	var value;
	if(obj instanceof ScmObject) {
		if(obj.isNumber()) {
			value = obj.data;
		}
		if(obj.isString()) {
			value = obj.data;
		}
		else if(obj.isBoolean()) {
			value = obj.data ? "#t" : "#f";
		}
		else if(s.isList(obj)) {
			value = s.printList(obj);
		}
		else if(obj.isPair()) {
			value = s.printPair(obj);
		}
		else if(obj.isProcedure()) {
			value = '#<procedure:';
			if(obj.isPrimProc())
				 value += s.primProcName(obj);
			else
				 value += s.compProcName(obj);
			value += '>';
		}
		else if(obj.isNamespace())
			value = '#<namespace:0>';
		else
			value = obj.data;
	}
	else
		value = null;
	return value;
}

s.printList = function(list) {
	var objs = [];
	var obj = list;
	for(; obj.isPair(); obj = s.cdr(obj)) {
		objs.push(s.printObj(s.car(obj)));
	}
	return '(' + objs.join(' ') + ')';
}

s.printPair = function(pair) {
	var str = '(';
	for(var i = 0; i < pair.data.length; i++) {
		var obj = pair.data[i];
		str += obj.isPair() ? s.printPair(obj) : s.printObj(obj);
		if(i < pair.data.length - 1)
			str += ' . ';
	}
	str += ')';
	return str;
}

})(scheme);
