(function(s){
"use strict";

var ScmObject = s.ScmObject;

s.initString = function() {
	var addGlobalPrimProc = s.addGlobalPrimProc;
	
	addGlobalPrimProc("string?", isString, 1);
	addGlobalPrimProc("make-string", makeString, 1, 2);
	addGlobalPrimProc("string", string, 0, -1);
	addGlobalPrimProc("string-length", stringLength, 1);
	addGlobalPrimProc("string-ref", stringRef, 2);
	addGlobalPrimProc("string-set!", stringSet, 3);
	addGlobalPrimProc("string=?", stringEqual, 2);
	addGlobalPrimProc("string-ci=?", stringCIEqual, 2);
	addGlobalPrimProc("substring", substring, 3);
	addGlobalPrimProc("string->list", stringToList, 1);
	addGlobalPrimProc("list->string", listToString, 1);
	addGlobalPrimProc("string-copy", stringCopy, 1);
	addGlobalPrimProc("string-fill!", stringFill, 2);
	addGlobalPrimProc("string-append", stringAppend, 0, -1);
}


ScmObject.makeString = function(data) {
	return new ScmObject(4, data);
}
s.charArrayVal = function(obj) { return obj.data; }
s.stringVal = function(obj) { return obj.data.join(""); }
s.stringLen = function(obj) { return obj.data.length; }


function isString(argv) {
	return ScmObject.getBoolean(argv[0].isString());
}

function makeString(argv) {
	var k = argv[0];
	if(!isExactNonnegativeInteger(k))
		return s.wrongContract("make->string", argv, "exact-nonnegative-integer?", k, 0);
	var c = ScmObject.makeChar('\0');
	if(argv.length == 2) {
		c = argv[1];
		if(!c.isChar())
			return s.wrongContract("make->string", argv, "char?", c, 1);
	}
	k = s.intVal(k);
	c = s.charVal(c);
	var charArray = [];
	for(; k > 0; k--) {
		charArray.push(c);
	}
	return ScmObject.makeString(charArray);
}

function string(argv) {
	var charArray = [];
	var obj;
	for(var i = 0; i < argv.length; i++) {
		obj = argv[i];
		if(!obj.isChar())
			return s.wrongContract("string", argv, "char?", obj, i);
		charArray.push(s.charVal(obj));
	}
	return ScmObject.makeString(charArray);
}

function stringLength(argv) {
	var obj = argv[0];
	if(!obj.isString())
		return s.wrongContract("string-length", argv, "string?", obj, 0);
	return ScmObject.makeInt(s.stringLen(obj));
}

function stringRef(argv) {
	var str = argv[0];
	var k = argv[1];
	if(!str.isString())
		return s.wrongContract("string-ref", argv, "string?", str, 0);
	if(!isExactNonnegativeInteger(k))
		return s.wrongContract("string-ref", argv, "exact-nonnegative-integer?", k, 1);
	k = s.intVal(k);
	if(indexRangeCheck("string-ref", "string", k, -1, s.stringLen(str), str))
		return ScmObject.makeChar(s.charArrayVal(str)[k]);
}

function stringSet(argv) {
	var str = argv[0];
	var k = argv[1];
	var c = argv[2];

	if(!str.isString())
		return s.wrongContract("string-set!", argv, "string?", str, 0);
	if(!isExactNonnegativeInteger(k))
		return s.wrongContract("string-set!", argv, "exact-nonnegative-integer?", k, 1);
	if(!c.isChar())
		return s.wrongContract("string-set!", argv, "char?", c, 2);
	k = s.intVal(k);
	if(indexRangeCheck("string-set!", "string", k, -1, s.stringLen(str), str)) {
		s.charArrayVal(str)[k] = s.charVal(c);
		return s.voidValue;
	}
}

function stringEqual(argv) {
	var str1 = argv[0];
	var str2 = argv[1];
	if(!str1.isString())
		return s.wrongContract("string=?", argv, "string?", str1, 0);
	if(!str2.isString())
		return s.wrongContract("string=?", argv, "string?", str2, 1);
	return ScmObject.getBoolean(s.stringVal(str1) == s.stringVal(str2));
}

function stringCIEqual(argv) {
	var str1 = argv[0];
	var str2 = argv[1];
	if(!str1.isString())
		return s.wrongContract("string=?", argv, "string?", str1, 0);
	if(!str2.isString())
		return s.wrongContract("string=?", argv, "string?", str2, 1);
	return ScmObject.getBoolean(
		s.stringVal(str1).toLowerCase() == s.stringVal(str2).toLowerCase());
}

function substring(argv) {
	var str = argv[0];
	var start = argv[1];
	var end = argv[2];
	if(!str.isString())
		return s.wrongContract("substring", argv, "string?", str, 0);
	if(!isExactNonnegativeInteger(start))
		return s.wrongContract("substring", argv, "exact-nonnegative-integer?", start, 1);
	if(!isExactNonnegativeInteger(end))
		return s.wrongContract("substring", argv, "exact-nonnegative-integer?", end, 2);
	start = s.intVal(start);
	end = s.intVal(end);
	if(indexRangeCheck("substring", "string", start, end, s.stringLen(str), str)) {
		return ScmObject.makeString(s.charArrayVal(str).slice(start, end));
	}
}

function stringAppend(argv) {
	var charArray = [];
	var obj;
	for(var i = 0; i < argv.length; i++) {
		obj = argv[i];
		if(!obj.isString())
			return s.wrongContract("string->append", argv, "string?", obj, i);
		charArray = charArray.concat(s.charArrayVal(obj));
	}
	return ScmObject.makeString(charArray);
}

function stringToList(argv) {
	var obj = argv[0];
	if(!obj.isString())
		return s.wrongContract("string->list", argv, "string?", obj, 0);
	var list = s.nil;
	for(var charArray = s.stringVal(obj), i = charArray.length - 1; i >= 0; i--) {
		list = s.cons(ScmObject.makeChar(charArray[i]), list);
	}
	return list;
}

function listToString(argv) {
	var list = argv[0];
	if(!s.isList(list))
		return s.wrongContract("list->string", argv, "list?", list, 0);
	var obj;
	var charArray = [];
	for(var i = 0; !list.isEmptyList(); list = s.cdr(list), i++) {
		obj = s.car(list);
		if(!obj.isChar())
			return s.wrongContract("list->string", argv, "char?", obj, i);
		charArray.push(s.charVal(obj));
	}
	return ScmObject.makeString(charArray);
}

function stringCopy(argv) {
	var str = argv[0];
	if(!str.isString())
		return s.wrongContract("string-copy", argv, "string?", str, 0);
	return ScmObject.makeString(s.charArrayVal(str).slice(0));
}

function stringFill(argv) {
	var str = argv[0];
	var c = argv[1];
	if(!str.isString())
		return s.wrongContract("string-fill!", argv, "string?", str, 0);
	if(!c.isChar())
		return s.wrongContract("string-fill!", argv, "char?", c, 1);
	c = s.charVal(c);
	var charArray = s.charArrayVal(str);
	for(var i in charArray)
		charArray[i] = c;
	return s.voidValue;
}


//--------------------
//contract & check functions
//--------------------
function isExactNonnegativeInteger(obj) {
	return obj.isInteger() && s.intVal(obj) >= 0;
}

function indexRangeCheck(procedureName, type, startIndex, endIndex, length, obj) {
	var invalid = false;
	if(endIndex == -1) {
		if(startIndex >= length || length == 0)
			invalid = "index";
	}
	else if(!(0 <= startIndex && startIndex <= endIndex && startIndex <= length))
		invalid = "starting";
	else if(endIndex > length)
		invalid = "ending";
	if(invalid)
		return s.makeIndexOutRangeError(procedureName, type, startIndex, endIndex, invalid, length, obj);

	return true;
}

})(scheme);
