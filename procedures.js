(function(scm) {
/*
实际参数列表表示为被实现语言Lisp中的表，例如第一个参数是car(args)
*/
scm.primitiveProcedures =
[
	/* name,
	function,
	函数的预期参数的个数和参数类型合同检查函数名称
		[数量(至少),rest(上限]  如果长度为1,则表示精确数值，否则为范围。如果0表示没有参数,null表示可变长度参数
		数据类型, 如果长度为1，则表示所有参数必须都是指定类型, null表示任何对象
	
	*/
	['+', [sum, [0, null], ['number?']] ],
	['-', [sub, [1, null], ['number?']] ],
	['*', [mul, [0, null], ['number?']] ],
	['/', [div, [1, null], ['number?']] ],
	
	['=', [equalNumber, [2, null], ['number?']] ],
	['<', [lessThan, [2, null], ['real?']] ],
	['>', [greaThan, [2, null], ['real?']] ],
	['<=', [lteq, [2, null], ['real?']] ],
	['>=', [gteq, [2, null], ['real?']] ],
	['abs', [abs, [1], ['real?']] ],
	
	['not', [not, [1], []] ],
	
	['car', [mcar, [1], ['pair?']] ],
	['cdr', [mcdr, [1], ['pair?']] ],
	['cons', [mcons, [2], []] ],
	['set-car!', [setCar, [2], ['pair?', null]] ],
	['set-cdr!', [setCdr, [2], ['pair?', null]] ],
	['list', [mlist, [0, null], []] ],
	['list-ref', [mlistRef, [2], ['pair?', null]] ],
	
	['pair?', [isPair, [1], []] ],
	['list?', [isList, [1], []] ],
	['null?', [isNull, [1], []] ],
	['integer?', [isInteger, [1], []] ],
	['real?', [isReal, [1], []] ],
	['number?', [isNumber, [1], []] ],
	['string?', [isString, [1], []] ],
	['boolean?', [isBoolean, [1], []] ],
	['symbol?', [isSymbol, [1], []] ],
	['procedure?', [isProcedure, [1], []] ],
	['eq?', [equalObjectRef, [2], []] ],
	
	['and', [and, [0, null], []] ],
	['or', [or, [0, null], []] ],
	
	['string->number', [stringToNumber, [1], ['string?']] ],
	
	['eval', [meval, [2], [null, 'namespace?']] ],
	['apply', [mapply, [2], ['procedure?', 'pair?']] ],
	['interaction-environment', [interactionEnvironment, [], []] ],
	
	['display', [display, [1], []] ],
	['newline', [newline, [0], []] ],
	['random-int', [randomInt, [2], []] ],
	['alert', [clientjsAlert, [0, null], []] ],
	['prompt', [clientjsPrompt, [0, null], []] ],
	['confirm', [clientjsConfirm, [0, null], []] ],

	//其它基本过程...
];
scm.primitiveProcedureName = function(proc) { return proc.data[0]; }
scm.primitiveProcedureValue = function(proc) { return proc.data[1]; }
scm.primitiveProcedureFunc = function(proc) { return proc.data[1][0]; }
scm.primitiveProcedureArity = function(proc) { return proc.data[1][1]; }
scm.primitiveProcedureContract = function(proc) { return proc.data[1][2]; }
scm.contractFuncMap = {
	"string?": isString,
	"number?": isNumber,
	"real?": isReal,
	"pair?": isPair,
	"list?": isList,
	"procedure?": isProcedure,
	"namespace?": isNamespace
};

function pushCadrProcedures() {
	var cadrFuncNames = [
		"caar", "cadr", "cdar", "cddr",
		"caaar", "caadr", "cadar", "caddr", "cdaar", "cdadr", "cddar", "cdddr",
		"caaaar", "caaadr", "caadar", "caaddr", "cadaar", "cadadr", "caddar",
			"cadddr", "cdaaar", "cdaadr", "cdadar", "cdaddr", "cddaar", "cddadr", "cdddar", "cddddr"];

	cadrFuncNames.forEach(function(funcName){
		var argName = "args";
		var callExp = argName;
		var cs = funcName.split('').slice(1, funcName.length - 1);
		for(var i = cs.length - 1; i >= 0; i--)
			callExp = (cs[i] == 'a' ? "scheme.car" : "scheme.cdr") + "(" +  callExp + ")";
		var func = new Function(argName, "return " + callExp);
		var mfunName = 'm' + funcName;
		var mfunc = new Function(argName, "return " + ("scheme." + funcName + "(scheme.car(args))"));
		scm[funcName] = func;
		scm[mfunName] = mfunc;
		scm.primitiveProcedures.push( [funcName, [mfunc, [1], ['pair?']] ] );
	});
}
pushCadrProcedures();

scm.isTrue = function(obj) {
	return obj != scm.False;
}
scm.isFalse = function(obj) {
	return obj == scm.False;
}

// import scm
for(var variable in scm)
	eval("var " + variable + "=scm." + variable);


function mcons(args){
	return cons(car(args), cadr(args));
}
function mcar(args) {
	return car(car(args));
}
function mcdr(args) {
	return cdr(car(args));
}

function setCar(args) {
	var pair = car(args);
	var pcar = cadr(args);
	pair.data[0] = pcar;
	return voidValue;
}
function setCdr(args) {
	var pair = car(args);
	var pcdr = cadr(args);
	pair.data[1] = pcdr;
	return voidValue;
}

function mlist(args) {
	return args;
}
function mlistRef(args) {
	var pair = car(args);
	var index = cadr(args).data;
	for(var i = 0; i < index; i++)
		pair = cdr(pair);
	return car(pair);
}

function sum(numbers) {
	return listToArray(numbers).reduce(function(x, y){ return ScmObject.makeReal(x.data + y.data); });
}
function mul(numbers) {
	return listToArray(numbers).reduce(function(x, y){ return ScmObject.makeReal(x.data * y.data); });
}
function sub(numbers) {
	numbers = listToArray(numbers);
	if(numbers.length == 1)
		numbers.unshift(ScmObject.makeInt(0));
	return numbers.reduce(function(x, y){ return ScmObject.makeReal(x.data - y.data); });
}
function div(numbers) {
	numbers = listToArray(numbers);
	if(numbers.length == 1)
		numbers.unshift(ScmObject.makeInt(1));
	return numbers.reduce(function(x, y){ return ScmObject.makeReal(x.data / y.data); });
}

function equalNumber(numbers) {
	numbers = listToArray(numbers);
	var first = numbers[0];
	for(var i = 1; i < numbers.length; i++)
		if(first.data != numbers[i].data)
			return False;
	return True;
}

function equalObjectRef(args) {
	var x = car(args);
	var y = cadr(args);
	if(x.type != y.type)
		return False;
	if(x.isNumber() || x.isChar() || x.isString() || x.isBoolean)
		return ScmObject.getBoolean(x.data == y.data);
	else
		return ScmObject.getBoolean(x == y);
}

function lessThan(reals) {
	reals = listToArray(reals);
	for(var i = 0; i < reals.length - 1; i++)
		if(reals[i].data >= reals[i + 1].data)
			return False;
	return True;
}
function greaThan(reals) {
	reals = listToArray(reals);
	for(var i = 0; i < reals.length - 1; i++)
		if(reals[i].data <= reals[i + 1].data)
			return False;
	return True;
}
function lteq(reals) {
	reals = listToArray(reals);
	for(var i = 0; i < reals.length - 1; i++)
		if(reals[i].data > reals[i + 1].data)
			return False;
	return True;
}
function gteq(reals) {
	reals = listToArray(reals);
	for(var i = 0; i < reals.length - 1; i++)
		if(reals[i].data < reals[i + 1].data)
			return False;
	return True;
}
function abs(args) {
	return new ScmObject.makeReal(Math.abs(car(args)));
}
function not(args) {
	return ScmObject.getBoolean(! car(args).data);
}
function and(objs) {
	objs = listToArray(objs);
	for(var i = 0; i < objs.length; i++)
		if(scm.isFalse(objs[i]))
			return objs[i];
	return True;
}
function or(objs) {
	objs = listToArray(objs);
	for(var i = 0; i < objs.length; i++)
		if(scm.isTrue(objs[i]))
			return objs[i];
	return False;
}

function isInteger(args) { return new ScmObject.getBoolean(car(args).isInteger()); }
function isReal(args) { return new ScmObject.getBoolean(car(args).isReal()); }
function isNumber(args) { return new ScmObject.getBoolean(car(args).isNumber()); }
function isChar(args) { return new ScmObject.getBoolean(car(args).isChar()); }
function isString(args) { return new ScmObject.getBoolean(car(args).isString()); }
function isBoolean(args) { return new ScmObject.getBoolean(car(args).isBoolean()); }
function isSymbol(args) { return new ScmObject.getBoolean(car(args).isSymbol()); }
function isList(args) {
	// 空表或者含有空表的序对
	var obj = car(args);
	var b = false;
	for(; !b && obj.isPair(); obj = cdr(obj))
		if(car(obj).isEmptyList())
			b = true;
	if(!b && obj.isEmptyList())
		b = true;
	return new ScmObject.getBoolean(b);
}
function isPair(args) { return new ScmObject.getBoolean(car(args).isPair()); }
function isNull(args) { return new ScmObject.getBoolean(car(args).isEmptyList());  }
function isProcedure(args) { return new ScmObject.getBoolean(car(args).isProcedure()); }
function isNamespace(args) { return new ScmObject.getBoolean(car(args).isNamespace());  }
function display(args) {
	var val = scm.printObj(car(args));
	if(val != null)
		scm.console.value += val;
	return voidValue;
}
function newline(args) {
	scm.console.value += "\n";
}

function meval(args) {
	var exp = car(args);
	var env = cadr(args).data;
	return scm.evaluate(exp, env);
}
function mapply(args) {
	var procedure = car(args);
	var arguments = cadr(args);
	return scm.apply(procedure, arguments);
}

function interactionEnvironment() {
	return ScmObject.makeNamespace(scm.globalEnvironment);
}

function stringToNumber(args) {
	return ScmObject.makeReal(parseFloat(car(args).data));
}


function clientjsAlert(args) {
	var msg = args.isEmptyList() ? "" : car(args).data;
	return alert(msg);
}
function clientjsPrompt(args) {
	args = listToArray(args);
	var msg = args[0] ? args[0].data : "";
	var val = args[1] ? args[1].data : "";
	return new scm.ScmObject.makeString(prompt(msg, val));
}
function clientjsConfirm(args) {
	var msg = args.isEmptyList() ? "" : car(args).data;
	return new scm.ScmObject.getBoolean(confirm(msg));
}
function randomInt(args) {
	var n = car(args).data;
	var m = cadr(args).data;
	return scm.ScmObject.makeInt(Math.floor(Math.random() * (m - n)) + n);
}

})(scheme);
