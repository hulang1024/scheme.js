(function(s){
"use strict";

var symbolReg = /^(?![0-9])[a-zA-Z_$0-9\!\-\?\*%\.\+\-\*\/\<\>\=\u4e00-\u9fa5]+$/;
var decimalReg = /^[+-]?\d+$/;
var floatReg = /^[+-]?\d+\.\d+$/;
var charReg = /^#\\/;
var stringReg = /^\".*\"$/;
var booleanReg = /^#[tf]|(true|false)$^/;
var vectorReg = /^#\(/;
var emptyListReg = /^\(\)$/;

s.initRead = function() {
    s.addGlobalPrimProc("read", read, 0, 1);
}

function read(argv) {
    var objs;
    do {
        objs = s.readMutil(window.prompt());
    } while (!objs.length);
    return objs[0];
}

s.readMutil = function(src) {
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

    var splits = pstr.split(/(".*")|(\s+)|([\(\)]{1})/g);
    var tokens = splits.filter(function(str) { return str && str.trim(); });
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
    try {
        //console.log('token arrayExp:');
        //console.log(arrayExp);
        array = eval(arrayExp);
    } catch(e) {
        s.makeError("read", "unexpected");
        return;
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
                                    s.makeError("read", "unexpected");
                                    break;
                                }
                            }
                            currPair = nextPair;
                        }
                    } else {
                        s.makeError("read", "unexpected");
                    }
                } else {
                    pair = s.nil;
                }
                result.push(pair);
            }
            else {
                var token = array[index];
                if(decimalReg.test(token)) {
                    result.push(s.makeInt(parseInt(token)));
                }
                else if(floatReg.test(token)) {
                    result.push(s.makeReal(parseFloat(token)));
                }
                else if(symbolReg.test(token)) {
                    result.push(s.internSymbol(token));
                }
                else if(token[0] == "'") {//quote
                    var quoteSym = s.internSymbol('quote');
                    var obj;
                    if(token == "'") {
                        obj = inner(array.slice(index+1, index+2))[0];
                        index++;
                    }
                    else {
                        obj = s.readMutil(token.substring(1))[0];
                    }
                    result.push(s.cons(quoteSym, s.cons(obj, s.nil)));
                }
                else if(vectorReg.test(token)) {//vector
                }
                else if(charReg.test(token)) {
                    result.push(s.makeChar(token.substr(2)));
                }
                else if(stringReg.test(token)) {
                    result.push(s.makeString(token.substr(1, token.length - 2).split("")));
                }
                else if(booleanReg.test(token)) {
                    result.push(s.getBoolean(token == "#t" || token == "#true"));
                }
                else {
                    s.makeError("read", "unexpected");
                }
            }
        }
        return result;
    }
}

})(scheme);
