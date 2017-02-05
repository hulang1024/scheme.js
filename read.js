(function(s){
"use strict";

var ScmObject = s.ScmObject;

// 符号(作为标识符)
var symbolReg = /^(?![0-9])[a-zA-Z_$0-9\!\-\?\*%\.\+\-\*\/\<\>\=\u4e00-\u9fa5]+$/;

// 数值
var decimalReg = /^[+-]?\d+$/;
var hexReg = /^[+-]?0[xX][\da-fA-F]+$/;
var octReg = /^[+-]?0[0-7]$/;
var floatReg = /^[+-]?\d+\.\d+$/;

// 字符
var charReg = /^#\\/;
var stringReg = /^\".*\"$/;

// 布尔
var booleanReg = /^#[tf]|(true|false)$^/;

var vectorReg = /^#\(/;
var emptyListReg = /^\(\)$/;

s.parse = function(str) {
	//delete comment line
	str += '\n';
	var pstr = "";
	var state = 0;
	for(var i=0;i<str.length;i++) {
		if(str[i]=="\"") {
			switch(state) {
			case 0: state = 1; break;
			case 1: state = 0; break;
			}
		}
		else if(str[i] == ";") {
			if(state == 0) {
				i++;
				while(i < str.length && str[i] != '\n') i++;
			}
		}
		pstr += str[i];
	}
	
	var tokens = parseTokens(pstr);
	var exps = parseSExps(tokens);
	return exps;
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
				tk = t[0] + '\\' + t.substring(1);
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
		return "read:unexpected";
	}
	var exps = parse(array);
	if(error == 1)
		return "read:unexpected";
	else
		return exps;
	
	function parse(array) {
		var exps = [];
		for(var index = 0; index < array.length; index++) {
			if(array[index].constructor == Array) {
				var array1 = parse(array[index]);
				var pair;
				if(array1.length > 0) {
					var currPair;
					if(array1[0] != s.dotSymbol) {
						pair = currPair = s.cons(array1[0], s.nil);
						for(var i = 1; i < array1.length; i++) {
							var elem = array1[i];
							if(elem != s.dotSymbol) {
								var nextPair = s.cons(array1[i], s.nil);
								s.setCdr(currPair, nextPair);
							} else {
								++i;
								if(i == array1.length - 1)
									s.setCdr(currPair, array1[i]);
								else {
									error = 1;
									break;
								}
							}
							currPair = nextPair;
						}
					} else {
						error = 1;
					}
				} else {
					pair = s.nil;
				}
				exps.push(pair);
			}
			else {
				var token = array[index];
				if(decimalReg.test(token) || hexReg.test(token) || octReg.test(token)) {
					exps.push(ScmObject.makeInt(parseInt(token)));
				}
				else if(floatReg.test(token)) {
					exps.push(ScmObject.makeReal(parseFloat(token)));
				}
				else if(symbolReg.test(token)) {
					exps.push(s.getSymbol(token));
				}
				else if(token[0] == "'") {//quote
					var quoteSym = s.getSymbol('quote');
					var obj;
					if(token == "'") {
						obj = parse(array.slice(index+1, index+2))[0];
						index++;
					}
					else {
						obj = parseSExps(parseTokens(token.substring(1)))[0];
					}
					exps.push(s.cons(quoteSym, s.cons(obj, s.nil)));
				}
				else if(vectorReg.test(token)) {//vector
				}
				else if(charReg.test(token)) {
					exps.push(ScmObject.makeChar(token.substr(2)));
				}
				else if(stringReg.test(token)) {
					exps.push(ScmObject.makeString(token.substr(1, token.length - 2).split("")));
				}
				else if(booleanReg.test(token)) {
					exps.push(ScmObject.getBoolean(token == "#t" || token == "#true"));
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
