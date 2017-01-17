var scheme = {};
(function(scm){
scm.ScmObject = function(type, data) {
	/*
	integer=1,real=2,char=3,string=4,boolean=5,symbol=6,pair=7,primitive_procedure=8,compound_procedure=9,EmptyList=0
	*/
	this.type = type;
	this.data = data;
	this.isInteger = function() { return this.type == 1; }
	this.isReal = function() { return this.type == 1 || this.type == 2; }
	this.isNumber = function() { return this.type == 1 || this.type == 2; }
	this.isChar = function() { return this.type == 3 }
	this.isString = function() { return this.type == 4; }
	this.isBoolean = function() { return this.type == 5; }
	this.isSymbol = function() { return this.type == 6; }
	this.isPair = function() { return this.type == 7; }
	this.isPrimProc = function() { return this.type == 8; }
	this.isCompProc = function() { return this.type == 9; }
	this.isProcedure = function() { return this.type == 8 || this.type == 9; }
	this.isEmptyList = function() { return this.type == 0; }
}
var ScmObject = scm.ScmObject;

ScmObject.makeInt = function(data) {
	return new ScmObject(1, data);
}
ScmObject.makeReal = function(data) {
	return new ScmObject(2, data);
}
ScmObject.makeChar = function(data) {
	return new ScmObject(3, data);
}
ScmObject.makeString = function(data) {
	return new ScmObject(4, data);
}
ScmObject.makeBoolean = function(data) {
	return new ScmObject(5, data);
}
ScmObject.makeSymbol = function(data) {
	return new ScmObject(6, data);
}
ScmObject.makePair = function(data) {
	return new ScmObject(7, data);
}
ScmObject.makePrimProc = function(obj) {
	return new ScmObject(8, obj);
}
ScmObject.makeCompProc = function(parameters, body, env, name) {
	return new ScmObject(9, [parameters, body, env, name]);
}

/*
  procedure getters
*/
scm.compProcParamters = function(proc) { return proc.data[0]; }
scm.compProcBody = function(proc) { return proc.data[1]; }
scm.compProcEnv = function(proc) { return proc.data[2]; }
scm.compProcName = function(proc) { return proc.data[3] }

ScmObject.makeEmptyList = function(data) {
	return new ScmObject(0, null);
}

scm.arrayToList = function(array) {
	var list = scm.cons(array[array.length - 1], scm.nil);
	for(var i = array.length - 2; i >= 0; i--)
		list = scm.cons(array[i], list);
	return list;
}
scm.listToArray = function(list) {
	var array = [];
	while(!list.isEmptyList()) {
		array.push(car(list));
		list = cdr(list);
	}
	return array;
}

// 基本常量值
scm.True = ScmObject.makeBoolean(true);
scm.False = ScmObject.makeBoolean(false);
scm.nil = ScmObject.makeEmptyList();
scm.ok = 1;
scm.voidValue = 2;

ScmObject.getBoolean = function(data) {
	return data ? scm.True : scm.False;
}

// 符号表
scm.symbolMap = {};
scm.pushSymbol = function(name) {
	return scm.symbolMap[name] = ScmObject.makeSymbol(name);
}
scm.getSymbol = function(name) {
	var sym = scm.symbolMap[name];
	return sym ? sym : ScmObject.makeSymbol(name);
}
// 基本符号
scm.quoteSymbol = scm.pushSymbol('quote');
scm.ifSymbol = scm.pushSymbol('if');
scm.defineSymbol = scm.pushSymbol('define');
scm.assignmentSymbol = scm.pushSymbol('set!');
scm.lambdaSymbol = scm.pushSymbol('lambda');
scm.beginSymbol = scm.pushSymbol('begin');
scm.condSymbol = scm.pushSymbol('cond');
scm.elseSymbol = scm.pushSymbol('else');
scm.letSymbol = scm.pushSymbol('let');

function cons(x, y){
	return new ScmObject.makePair([x, y]);
}
function car(pair) {
	return pair.data[0];
}
function cdr(pair) {
	return pair.data[1];
}

scm.cons = cons;
scm.car = car;
scm.cdr = cdr;

function isList(obj) {
	for(; obj.isPair(); obj = cdr(obj))
		if(car(obj).isEmptyList())
			return true;
	return obj.isEmptyList();
}

scm.printObj = function(obj) {
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
		else if(isList(obj)) {
			value = scm.printList(obj);
		}
		else if(obj.isPair()) {
			value = scm.printPair(obj);
		}
		else if(obj.isProcedure()) {
			value = '#<procedure:';
			if(obj.isPrimProc())
				 value += scm.primitiveProcedureName(obj);
			else
				 value += scm.compProcName(obj);
			value += '>';
		}
		else if(obj == scm.voidSymbol) 
			value = null;
		else
			value = obj.data;
	}
	else if(obj == scm.ok)
		value = null;
	return value;
}

scm.printList = function(list) {
	var objs = [];
	var obj = list;
	for(; obj.isPair(); obj = cdr(obj)) {
		objs.push(scm.printObj(car(obj)));
	}
	return '(' + objs.join(' ') + ')';
}

scm.printPair = function(pair) {
	var str = '(';
	for(var i = 0; i < pair.data.length; i++) {
		var obj = pair.data[i];
		str += obj.isPair() ? scm.printPair(obj) : scm.printObj(obj);
		if(i < pair.data.length - 1)
			str += ' . ';
	}
	str += ')';
	return str;
}

})(scheme);
