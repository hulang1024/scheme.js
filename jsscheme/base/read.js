(function(scheme){
"use strict";

var symbolReg = /^(?![0-9])[a-zA-Z_$0-9\!\-\?\*%\.\+\-\*\/\<\>\=\u4e00-\u9fa5]+$/;
var decimalReg = /^[+-]?\d+$/;
var floatReg = /^[+-]?\d+\.\d+$/;
var charReg = /^#\\/;
var stringReg = /^\".*\"$/;
var booleanReg = /^#[tf]|(true|false)$^/;
var vectorReg = /^#\(/;
var emptyListReg = /^\(\)$/;

scheme.initRead = function(env) {
    scheme.addPrimProc(env, "read", read, 0, 1);
}

function read(argv) {
    var objs;
    do {
        objs = scheme.readMutil(window.prompt());
    } while (!objs.length);
    return objs[0];
}

scheme.readMutil = function(src) {
    //delete comment line
    src += '\n';
    var pstr = "";
    var state = 0;
    for(var i=0;i<src.length;i++) {
        if(src[i]=="\"") {
            switch(state) {
            case 0: state = 1; break;
            case 1: state = 0; break;
            }
        }
        else if(src[i] == ";") {
            if(state == 0) {
                for(i++; i < src.length && src[i] != '\n'; ) i++;
            }
        }
        pstr += src[i];
    }
    pstr = pstr.substring(0, pstr.length-1);

    function getTokens(splits) {
        var tokens = [], part, s;
        for(var i = 0; i < splits.length; i++) {
            part = splits[i];
            if(part && part.trim()) {
                tokens.push(part);
            }
        }
        return tokens;
    }
    var tokens = getTokens(pstr.split(/(".*")|(\s+)|([\(\)]{1})/g));
    tokens = tokens.map(function(t){
        if(t == '(') return '[';
        else if(t == ')') return ']';
        else {
            if(t[0] == "#" && t[1] == "\\")
                return "'" + t[0] + "\\" + t.substring(1) + "'";
            else if(t[0] == "\"")
                return "'" + t[0] + t.substring(1) + "'";
            else if(t[0] == "'")
                return "\"\\" + t[0] + t.substring(1) + "\"";

            return "'" + t + "'";
        }
    }).join(',');
    var arrayExp = "[" + tokens.replace(/\[,/g,'[').replace(/,\]/g,']') + "]";
    var array;
    try {
        //console.log('token arrayExp:');
        //console.log(arrayExp);
        array = eval(arrayExp);
    } catch(e) {
        return scheme.throwError("read", "unexpected");
    }
    return inner(array);
    
    function inner(array) {
        var result = [];
        for(var index = 0; index < array.length; index++) {
            if(array[index].constructor == Array) {
                var array1 = inner(array[index]);
                var pair;
                if(array1.length > 0) {
                    var currPair;
                    if(array1[0] != scheme.dotSymbol) {
                        pair = currPair = scheme.cons(array1[0], scheme.nil);
                        for(var i = 1; i < array1.length; i++) {
                            var elem = array1[i];
                            if(elem != scheme.dotSymbol) {
                                var nextPair = scheme.cons(array1[i], scheme.nil);
                                scheme.setCdr(currPair, nextPair);
                            } else {
                                ++i;
                                if(i == array1.length - 1)
                                    scheme.setCdr(currPair, array1[i]);
                                else {
                                    scheme.throwError("read", "unexpected");
                                    break;
                                }
                            }
                            currPair = nextPair;
                        }
                    } else {
                        scheme.throwError("read", "unexpected");
                    }
                } else {
                    pair = scheme.nil;
                }
                result.push(pair);
            }
            else {
                var token = array[index];
                if(decimalReg.test(token)) {
                    result.push(scheme.makeInt(parseInt(token)));
                }
                else if(floatReg.test(token)) {
                    result.push(scheme.makeReal(parseFloat(token)));
                }
                else if(symbolReg.test(token)) {
                    result.push(scheme.internSymbol(token));
                }
                else if(token[0] == "'") {//quote
                    var quoteSym = scheme.internSymbol('quote');
                    var obj;
                    if(token == "'") {
                        obj = inner(array.slice(index+1, index+2))[0];
                        index++;
                    }
                    else {
                        obj = scheme.readMutil(token.substring(1))[0];
                    }
                    result.push(scheme.cons(quoteSym, scheme.cons(obj, scheme.nil)));
                }
                else if(vectorReg.test(token)) {//vector
                }
                else if(charReg.test(token)) {
                    var val = token.substr(2);
                    if(val == "space") val = " ";
                    else if(val == "newline") val = "\n";
                    result.push(scheme.makeChar(val));
                }
                else if(stringReg.test(token)) {
                    result.push(scheme.makeString(token.substr(1, token.length - 2).split("")));
                }
                else if(booleanReg.test(token)) {
                    result.push(scheme.getBoolean(token == "#t" || token == "#true"));
                }
                else {
                    return scheme.throwError("read", "unexpected");
                }
            }
        }
        return result;
    }
}
})(scheme);