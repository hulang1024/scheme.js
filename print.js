(function(s){
"use strict";

s.initPrint = function() {
    s.addGlobalPrimProc("write", write, 1);
    s.addGlobalPrimProc("display", display, 1);
    s.addGlobalPrimProc("newline", newline, 0);
}

function write(argv) {
    s.outputToConsole(s.writeToString(argv[0], false), false, true);
    return s.voidValue;
}

function display(argv) {
    s.outputToConsole(s.displayToString(argv[0], false), false, true);
    return s.voidValue;
}

function newline(argv) {
    s.outputToConsole("\n");
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
    else if(s.isList(obj)) {
        if(s.car(obj) == s.quoteSymbol) {
            str = s.writeQuote(obj);
        }
        else
            str = s.writeList(obj);
    }
    else if(obj.isPair()) {
        str = s.writePair(obj);
    }
    else if(obj.isProcedure()) {
        str = '#<procedure:' + obj.val.getName() + '>';
    }
    else if(obj.isNamespace())
        str = '#<namespace:0>';
    else if(obj.isMyObject())
        str = "#object";
    else
        str = obj.val.toString();
    return str;
}

s.writeQuote = function(list) {
    if(s.car(list) == s.quoteSymbol)
        return "'" + s.writeQuote(s.cdr(list));
    else 
        return s.writeToString(s.car(list));
}

s.writeList = function(list) {
    var objs = [];
    var obj = list;
    for(; obj.isPair(); obj = s.cdr(obj)) {
        objs.push(s.writeToString(s.car(obj)));
    }
    return '(' + objs.join(' ') + ')';
}

s.writePair = function(pair) {
    var str = '(';
    for(var i = 0; i < pair.val.length; i++) {
        var obj = pair.val[i];
        str += obj.isPair() ? s.writePair(obj) : s.writeToString(obj);
        if(i < pair.val.length - 1)
            str += ' . ';
    }
    str += ')';
    return str;
}

s.outputValue = function(obj) {
    if(obj.isUnspecified())
        return;
    var val = s.writeToString(obj);
    if(val != null) {
        s.outputToConsole(val);
        s.outputToConsole("\n");
    }
}

s.outputToConsole = function(str, error, write) {
    if(!s.console)
        return;
    var response = document.createElement('span');
    response.innerText = str;
    response.className = "scheme_response";
    if(write)
        response.className += " scheme_write_object";
    if(error)
        response.className += " scheme_error_info";
    s.console.appendChild(response);
}

})(scheme);
