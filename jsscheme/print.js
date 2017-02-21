(function(s){
"use strict";

s.initPrint = function(env) {
    s.addPrimProc(env, "write", write, 1);
    s.addPrimProc(env, "display", display, 1);
    s.addPrimProc(env, "newline", newline, 0);
}

function write(argv) {
    s.console.log("write", s.writeToString(argv[0], false));
    return s.voidValue;
}

function display(argv) {
    s.console.log("display", s.displayToString(argv[0], false));
    return s.voidValue;
}

function newline(argv) {
    s.console.log(null, "</br>");
    return s.voidValue;
}

s.displayToString = function(obj) {
    return s.writeToString(obj, true);
}

s.writeToString = function(obj, display) {
    var str = null;
    if(obj.isUnspecified())
        str = null;
    else if(obj.isNumber()) {
        str = obj.val;
    }
    else if(obj.isChar()) {
        str = "#\\" + s.charVal(obj);
    }
    else if(obj.isString()) {
        str = s.stringVal(obj);
        if(!display)
            str = "\"" + str + "\"";
    }
    else if(obj.isSymbol()) {
        str = s.symbolVal(obj);
    }
    else if(obj.isBoolean()) {
        str = obj.val ? "#t" : "#f";
    }
    else if(obj.isEmptyList()) {
        str = "()";
    }
    else if(obj.isPair()) {
        if(s.isList(obj)) {
            if(s.car(obj) == s.quoteSymbol)
                str = s.writeQuote(obj);
            else
                str = s.writeList(obj);
        } else {
            str = s.writePair(obj);
        }
    }
    else if(obj.isProcedure()) {
        str = '#[procedure:' + obj.val.getName() + "]";
    }
    else if(obj.isNamespace())
        str = '#[namespace:0]';
    else if(obj.isJSObject())
        str = s.objectVal(obj);
    else
        str = obj.val.toString();
    return str;
}

s.writeQuote = function(list) {
    if(s.car(list) == s.quoteSymbol)
        return "'" + s.writeQuote(s.cdr(list));
    else 
        return s.writeToString(s.car(list), false);
}

s.writeList = function(list) {
    var strs = [];
    var obj = list;
    for(; obj.isPair(); obj = s.cdr(obj))
        strs.push(s.writeToString(s.car(obj), false));
    return '(' + strs.join(' ') + ')';
}

s.writePair = function(pair) {
    var str = '(';
    var obj = pair;
    for(; obj.isPair(); obj = s.cdr(obj))
        str += s.writeToString(s.car(obj), false) + " ";
    str += ". " + s.writeToString(obj, false);
    return str + ')';
}

s.outputValue = function(obj) {
    if(obj.isUnspecified())
        return;
    var val = s.writeToString(obj);
    if(val != null) {
        s.console.log(null, val + "</br>");
    }
}

})(scheme);
