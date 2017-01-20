(function(scm){
var ScmObject = scm.ScmObject;
// 符号(作为标识符)
var symbolReg = /^(?![0-9])[a-zA-Z\u4e00-\u9fa5_$0-9>!\-\?\*%]*$/;

// 数值
var decimalReg = /^[+-]?\d+$/;
var hexReg = /^[+-]?0[xX][\da-fA-F]+$/;
var octReg = /^[+-]?0[0-7]$/;
var floatReg = /^[+-]?\d+\.\d+$/;

// 字符
var charReg = /^#\\\w$/;
var stringReg = /^\".*\"$/;

// 布尔
var booleanReg = /^#[tf]|(true|false)$^/;

var emptyListReg = /^\(\)$/;

scm.parse = function(str) {
	var tokens = parseTokens(str);
	var exps = parseSExps(tokens);
	return exps;
}

function isPrimitiveOperator(s) {
	return "+-*/<>=".indexOf(s) > -1 || s == ">=" || s == "<=";
}

function parseTokens(str) {
	// 用正则表达式处理拆分
	var splits = str.split(/(\s+)|([\(\)]{1})/g);
	//console.log(splits);
	//进一步处理
	var tokens = [];
	for(var i = 0; i < splits.length; i++) {
		var str = splits[i];
		if(str != undefined && str.trim().length > 0) {
			tokens.push(str);
		}
	}
	return tokens;
}

function parseSExps(tokens) {
	tokens = tokens.map(function(t){
		if(t == '(') return '[';
		else if(t == ')') return ']';
		else {
			var tk = t;
			if(t[0] == '#' && t[1] == '\\')
				tk = t[0] + '\\\\' + t.substring(1);
			if(t[0] == "'") {
				return "\"\\" + t[0] + t.substring(1) + "\"";
			}
			return "'" + tk + "'";
		}
	}).join(',');
	var arrayExp = "[" + tokens.replace(/\[,/g,'[').replace(/,\]/g,']') + "]";
	var array;
	var error;
	try {
		//console.log('token arrayExp:');
		//console.log(arrayExp);
		array = eval(arrayExp);
	} catch(e) {
		return "parseSExps:解析错误";
	}
	var exps = parse(array);
	if(error == 1)
		return "parse:解析错误";
	else
		return exps;
	
	function parse(array) {
		var exps = [];
		for(var index = 0; index < array.length; index++) {
			if(array[index].constructor == Array) {
				var array1 = parse(array[index]);
				var list;
				if(array1.length > 0) {
					list = scm.cons(array1[array1.length - 1], scm.nil);
					for(var i = array1.length - 2; i >= 0; i--)
						list = scm.cons(array1[i], list);
				} else {
					list = scm.nil;
				}
				exps.push(list);
			}
			else {
				var token = array[index];
				if(symbolReg.test(token) || isPrimitiveOperator(token)) {
					exps.push(scm.getSymbol(token));
				}
				else if(token[0] == '\'') {//quote
					var quoteSym = scm.getSymbol('quote');
					var obj;
					if(token == "'") {
						obj = parse(array.slice(index+1, index+2))[0];
						index++;
					}
					else {
						obj = parseSExps(parseTokens(token.substring(1)))[0];
					}
					exps.push(scm.cons(quoteSym, scm.cons(obj, scm.nil)));
				}
				else if(decimalReg.test(token) || hexReg.test(token) || octReg.test(token)) {
					exps.push(ScmObject.makeInt(parseInt(token)));
				}
				else if(floatReg.test(token)) {
					exps.push(ScmObject.makeReal(parseFloat(token)));
				}
				else if(charReg.test(token)) {
					exps.push(ScmObject.makeChar(token.substr(2)));
				}
				else if(stringReg.test(token)) {
					exps.push(ScmObject.makeString(token.substr(1, token.length - 2)));
				}
				else if(booleanReg.test(token)) {
					exps.push(ScmObject.getBoolean(token == "#t"));
				}
				else {
					error = 1;
				}
			}
		}
		return exps;
	}

}

})(scheme);
