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
    s.outputToConsole("</br>");
    return s.voidValue;
}

s.displayToString = function(obj) {
    return s.writeToString(obj, true);
}

var syntaxColorSchemes = {
    "string": "#298026",
    "symbol": "#0000AF",
    "constant": "#298026",
    "comment": "rgb(194,158,31)",
    "parenthesis": "rgb(181,60,36)"
};
function wrapSyntaxColorHTML(type, str) {
    return "<span style=\"color:" + syntaxColorSchemes[type] + "\">" + str + "</span>";
}

s.writeToString = function(obj, display, writeHtml) {
    var str = null;
    if(obj.isUnspecified())
        str = null;
    else if(obj.isNumber()) {
        str = obj.val;
        if(writeHtml)
            str = wrapSyntaxColorHTML("constant", str);
    }
    else if(obj.isChar()) {
        str = "#\\" + s.charVal(obj);
        if(writeHtml)
            str = wrapSyntaxColorHTML("constant", str);
    }
    else if(obj.isString()) {
        str = s.stringVal(obj);
        if(!display)
            str = "\"" + str + "\"";
        if(writeHtml)
            str = wrapSyntaxColorHTML("string", str);
    }
    else if(obj.isSymbol()) {
        str = s.symbolVal(obj);
        if(writeHtml)
            str = wrapSyntaxColorHTML("symbol", str);
    }
    else if(obj.isBoolean()) {
        str = obj.val ? "#t" : "#f";
        if(writeHtml)
            str = wrapSyntaxColorHTML("constant", str);
    }
    else if(obj.isEmptyList()) {
        str = "()";
        if(writeHtml)
            str = wrapSyntaxColorHTML("parenthesis", str);
    }
    else if(s.isList(obj)) {
        if(s.car(obj) == s.quoteSymbol) {
            str = s.writeQuote(obj, writeHtml);
        }
        else
            str = s.writeList(obj, writeHtml);
    }
    else if(obj.isPair()) {
        str = s.writePair(obj, writeHtml);
    }
    else if(obj.isProcedure()) {
        str = '#[procedure:' + obj.val.getName() + ']';
    }
    else if(obj.isNamespace())
        str = '#[namespace:0]';
    else if(obj.isMyObject())
        str = "#object";
    else
        str = obj.val.toString();
    return str;
}

s.writeQuote = function(list, writeHtml) {
    if(s.car(list) == s.quoteSymbol)
        return "'" + s.writeQuote(s.cdr(list), writeHtml);
    else 
        return s.writeToString(s.car(list), false, writeHtml);
}

s.writeList = function(list, writeHtml) {
    var strs = [];
    var obj = list;
    for(; obj.isPair(); obj = s.cdr(obj)) {
        strs.push(s.writeToString(s.car(obj), false, writeHtml));
    }
    if(writeHtml)
        return wrapSyntaxColorHTML("parenthesis", "(")
            + strs.join(' ') + wrapSyntaxColorHTML("parenthesis", ")");
    else
        return '(' + strs.join(' ') + ')';
}

s.writePair = function(pair, writeHtml) {
    var str = '(';
    if(writeHtml)
        str = wrapSyntaxColorHTML("parenthesis", "(");
    for(var i = 0; i < pair.val.length; i++) {
        var obj = pair.val[i];
        str += obj.isPair() ? s.writePair(obj, writeHtml) : s.writeToString(obj, false, writeHtml);
        if(i < pair.val.length - 1)
            str += ' . ';
    }
    if(writeHtml)
        str += wrapSyntaxColorHTML("parenthesis", ")");
    else
        str += ')';
    return str;
}

s.outputValue = function(obj) {
    if(obj.isUnspecified())
        return;
    var val = s.writeToString(obj);
    if(val != null) {
        s.outputToConsole(val);
        s.outputToConsole("</br>");
    }
}

s.outputToConsole = function(str, error, write) {
    if(!s.console)
        return;
    var response = document.createElement('span');
    response.className = "scheme_response";
    if(write)
        response.className += " scheme_write_object";
    if(error) {
        response.className += " scheme_error_info";
        str = str.replace(/\n/g, "</br>").replace(/\s/g, "&nbsp;");
    }
    response.innerHTML = str;
    s.console.appendChild(response);
}

})(scheme);
