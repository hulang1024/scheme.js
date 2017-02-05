(function(s){
"use strict";

var ScmObject = s.ScmObject;

s.printObj = function(obj, display) {
	var str = null;//外部表示
	if(obj.isNumber()) {
		str = obj.data;
	}
	else if(obj.isChar()) {
		str = "#\\" + s.charVal(obj);
	}
	else if(obj.isString()) {
		str = s.stringVal(obj).join("");
		if(!display)
			str = "\"" + str + "\"";
	}
	else if(obj.isSymbol()) {
		str = s.symbolVal(obj);
	}
	else if(obj.isBoolean()) {
		str = obj.data ? "#t" : "#f";
	}
	else if(obj.isEmptyList()) {
		str = "()";
	}
	else if(s.isList(obj)) {
		if(s.car(obj) == s.quoteSymbol) {
			str = s.printQuote(obj);
		}
		else
			str = s.printList(obj);
	}
	else if(obj.isPair()) {
		str = s.printPair(obj);
	}
	else if(obj.isProcedure()) {
		str = '#<procedure:';
		if(obj.isPrimProc())
			 str += s.primProcName(obj);
		else
			 str += s.compProcName(obj);
		str += '>';
	}
	else if(obj.isNamespace())
		str = '#<namespace:0>';
	else if(obj.isMyObject())
		str = "#object";
	else
		str = obj.data;
	return str;
}

s.printQuote = function(list) {
	if(s.car(list) == s.quoteSymbol)
		return "'" + s.printQuote(s.cdr(list));
	else 
		return s.printObj(s.car(list));
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
