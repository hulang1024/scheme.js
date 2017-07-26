(function(scm){
"use strict";

scm.initPrint = function(env) {
    scm.addPrimProc(env, "write", write, 1, 2);
    scm.addPrimProc(env, "display", display, 1, 2);
    scm.addPrimProc(env, "newline", newline, 0);
    scm.addPrimProc(env, "error", error, 1, 3);
}

function write(argv) {
    scm.console.log("write", scm.writeToString(argv[0], false));
    return scm.voidValue;
}

function display(argv) {
    scm.console.log("display", scm.displayToString(argv[0]));
    return scm.voidValue;
}

function newline(argv) {
    scm.console.log(null, "</br>");
    return scm.voidValue;
}

function error(argv) {
    var str = "";
    for(var i = argv.length - 2; i >= 0; i--)
        str += scm.displayToString(argv[i]);
    scm.console.log("error", str + "\n");
    return scm.voidValue;
}

scm.displayToString = function(obj) {
    return scm.writeToString(obj, true);
}

scm.writeToString = function(obj, display) {
    var str = null;
    
    switch(obj.type) {
    case scheme_void_type:
        str = null;
        break;
    case scheme_integer_type:
        str = scm.intVal(obj);
        break;
    case scheme_double_type:
        str = scm.doubleVal(obj);
        break;
    case scheme_char_type:
        str = "#\\" + scm.charVal(obj);
        break;
    case scheme_char_string_type:
        str = scm.stringVal(obj);
        if(!display)
            str = "\"" + str + "\"";
        break;
    case scheme_symbol_type:
        str = scm.symbolVal(obj);
        break;
    case scheme_bool_type:
        str = scm.isTrue(obj) ? "#t" : "#f";
        break;
    case scheme_null_type:
        str = "()";
        break;
    case scheme_pair_type:
        if(scm.isList(obj)) {
            if(scm.car(obj) == scm.quoteSymbol)
                str = scm.writeQuote(obj);
            else
                str = scm.writeList(obj);
        } else {
            str = scm.writePair(obj);
        }
        break;
    case scheme_prim_type:
    case scheme_comp_type:
        str = '#[procedure:' + obj.getName() + "]";
        break;
    case scheme_namespace_type:
        str = '#[namespace:0]';
        break;
    case scheme_input_port_type:
        str = '#[input-port]';
        break;
    case scheme_output_port_type:
        str = '#[output-port]';
        break;
    case scheme_jsobject_type:
        str = scm.objectVal(obj);
        break;
    default:
        str = obj.toString();
    }
    
    return str;
}

scm.writeQuote = function(list) {
    if(scm.car(list) == scm.quoteSymbol)
        return "'" + scm.writeQuote(scm.cdr(list));
    else 
        return scm.writeToString(scm.car(list), false);
}

scm.writeList = function(list) {
    var strs = [];
    var obj = list;
    for(; scm.isPair(obj); obj = scm.cdr(obj))
        strs.push(scm.writeToString(scm.car(obj), false));
    return '(' + strs.join(' ') + ')';
}

scm.writePair = function(pair) {
    var str = '(';
    var obj = pair;
    for(; scm.isPair(obj); obj = scm.cdr(obj))
        str += scm.writeToString(scm.car(obj), false) + " ";
    str += ". " + scm.writeToString(obj, false);
    return str + ')';
}

scm.outputValue = function(obj) {
    if(obj && scm.isVoid(obj))
        return;
    var val = scm.writeToString(obj);
    if(val != null) {
        scm.console && scm.console.log(null, val + "</br>");
    }
}

})(scheme);
