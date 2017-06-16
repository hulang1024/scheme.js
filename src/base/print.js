(function(scheme){
"use strict";

scheme.initPrint = function(env) {
    scheme.addPrimProc(env, "write", write, 1);
    scheme.addPrimProc(env, "display", display, 1);
    scheme.addPrimProc(env, "newline", newline, 0);
    scheme.addPrimProc(env, "error", error, 1, 3);
}

function write(argv) {
    scheme.console.log("write", scheme.writeToString(argv[0], false));
    return scheme.voidValue;
}

function display(argv) {
    scheme.console.log("display", scheme.displayToString(argv[0]));
    return scheme.voidValue;
}

function newline(argv) {
    scheme.console.log(null, "</br>");
    return scheme.voidValue;
}

function error(argv) {
    var str = "";
    for(var i = argv.length - 2; i >= 0; i--)
        str += scheme.displayToString(argv[i]);
    scheme.console.log("error", str + "\n");
    return scheme.voidValue;
}

scheme.displayToString = function(obj) {
    return scheme.writeToString(obj, true);
}

scheme.writeToString = function(obj, display) {
    var str = null;
    if(!(obj instanceof scheme.Object))
        str = obj;
    else if(scheme.isVoid(obj))
        str = null;
    else if(scheme.isNumber(obj)) {
        str = obj.val;
    }
    else if(scheme.isChar(obj)) {
        str = "#\\" + scheme.charVal(obj);
    }
    else if(scheme.isString(obj)) {
        str = scheme.stringVal(obj);
        if(!display)
            str = "\"" + str + "\"";
    }
    else if(scheme.isSymbol(obj)) {
        str = scheme.symbolVal(obj);
    }
    else if(scheme.isBoolean(obj)) {
        str = obj.val ? "#t" : "#f";
    }
    else if(scheme.isEmptyList(obj)) {
        str = "()";
    }
    else if(scheme.isPair(obj)) {
        if(scheme.isList(obj)) {
            if(scheme.car(obj) == scheme.quoteSymbol)
                str = scheme.writeQuote(obj);
            else
                str = scheme.writeList(obj);
        } else {
            str = scheme.writePair(obj);
        }
    }
    else if(scheme.isProcedure(obj)) {
        str = '#[procedure:' + obj.val.getName() + "]";
    }
    else if(scheme.isNamespace(obj))
        str = '#[namespace:0]';
    else if(scheme.isJSObject(obj))
        str = scheme.objectVal(obj);
    else {
        str = obj.val.toString();
    }
    return str;
}

scheme.writeQuote = function(list) {
    if(scheme.car(list) == scheme.quoteSymbol)
        return "'" + scheme.writeQuote(scheme.cdr(list));
    else 
        return scheme.writeToString(scheme.car(list), false);
}

scheme.writeList = function(list) {
    var strs = [];
    var obj = list;
    for(; scheme.isPair(obj); obj = scheme.cdr(obj))
        strs.push(scheme.writeToString(scheme.car(obj), false));
    return '(' + strs.join(' ') + ')';
}

scheme.writePair = function(pair) {
    var str = '(';
    var obj = pair;
    for(; scheme.isPair(obj); obj = scheme.cdr(obj))
        str += scheme.writeToString(scheme.car(obj), false) + " ";
    str += ". " + scheme.writeToString(obj, false);
    return str + ')';
}

scheme.outputValue = function(obj) {
    if(obj && scheme.isVoid(obj))
        return;
    var val = scheme.writeToString(obj);
    if(val != null) {
        scheme.console && scheme.console.log(null, val + "</br>");
    }
}

})(scheme);
