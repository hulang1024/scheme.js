(function(s) {
"use strict";

s.initMyObject = function(env) {
    s.addPrimProc(env, "random-int", randomInt, 2);
    s.addPrimProc(env, "alert", clientjsAlert, 0, 1);
    s.addPrimProc(env, "prompt", clientjsPrompt, 0, 2);
    s.addPrimProc(env, "confirm", clientjsConfirm, 0, 1);
    
    s.addPrimProc(env, "getElementById", getElementById, 2);
    s.addPrimProc(env, "getElementsByClassName", getElementsByClassName, 2);
    s.addPrimProc(env, "getElementsByName", getElementsByName, 2);
    s.addPrimProc(env, "getElementsByTagName", getElementsByTagName, 2);
    s.addPrimProc(env, "dom-set", setDomProperty, 3);
    s.addPrimProc(env, "dom-get", getDomProperty, 2);
    s.addPrimProc(env, "dom-set-event", setDomEventProperty, 3);
    s.addPrimProc(env, "mo-get", getMOProperty, 2);
    s.addObject(env, "window", s.makeMyObject(window));
    s.addObject(env, "document", s.makeMyObject(window.document));
}

//-------------------
// query dom elements
//-------------------
function getElementById(argv) {
    var dom = argv[0];
    var id = argv[1];
    if(!dom.isMyObject())
        return s.wrongContract("getElementById", "object?", 0, argv);
    if(!id.isString())
        return s.wrongContract("getElementById", "string?", 1, argv);
    return s.makeMyObject(s.objectVal(dom).getElementById(s.stringVal(id)));
}

function getElementsByClassName(argv) {
    var dom = argv[0];
    var className = argv[1];
    if(!dom.isMyObject())
        return s.wrongContract("getElementsByClassName", "object?", 0, argv);
    if(!className.isString())
        return s.wrongContract("getElementsByClassName", "string?", 1, argv);
    return s.makeMyObject(s.objectVal(dom).getElementById(s.stringVal(className)));
}

function getElementsByName(argv) {
    var dom = argv[0];
    var name = argv[1];
    if(!dom.isMyObject())
        return s.wrongContract("getElementsByName", "object?", 0, argv);
    if(!name.isString())
        return s.wrongContract("getElementsByName", "string?", 1, argv);
    return s.makeMyObject(s.objectVal(dom).getElementById(s.stringVal(name)));
}

function getElementsByTagName(argv) {
    var dom = argv[0];
    var tagName = argv[1];
    if(!dom.isMyObject())
        return s.wrongContract("getElementsByTagName", "object?", 0, argv);
    if(!tagName.isString())
        return s.wrongContract("getElementsByTagName", "string?", 1, argv);
    return s.makeMyObject(s.objectVal(dom).getElementById(s.stringVal(tagName)));
}

//----------------------------------
// dom object property setter/getter
//----------------------------------
function setDomProperty(argv) {
    var dom = argv[0];
    var propName = argv[1];
    var value = argv[2];
    if(!dom.isMyObject())
        return s.wrongContract("dom-set", "object?", 0, argv);
    if(!propName.isSymbol())
        return s.wrongContract("dom-set", "symbol?", 1, argv);
    s.objectVal(dom)[s.symbolVal(propName)] = value.isString() ? s.stringVal(value) : value.val;
    return value;
}

function setDomEventProperty(argv) {
    var dom = argv[0];
    var eventName = argv[1];
    var proc = argv[2];
    if(!dom.isMyObject())
        return s.wrongContract("dom-set-event", "object?", 0, argv);
    if(!eventName.isSymbol())
        return s.wrongContract("dom-set-event", "symbol?", 1, argv);
    if(!proc.isProcedure())
        return s.wrongContract("dom-set-event", "procedure?", 2, argv);
    s.objectVal(dom)[s.symbolVal(eventName)] = function(event) {
        var argv = [s.makeMyObject(event)];
        s.apply(proc, argv);
    }
    return proc;
}

function getDomProperty(argv) {
    var dom = argv[0];
    var propName = argv[1];
    if(!dom.isMyObject())
        return s.wrongContract("dom-get", "object?", 0, argv);
    if(!propName.isSymbol())
        return s.wrongContract("dom-get", "symbol?", 1, argv);
    return jsObjectToScmObject(s.objectVal(dom)[s.symbolVal(propName)]);
}

function getMOProperty(argv) {
    var mo = argv[0];
    var propName = argv[1];
    if(!mo.isMyObject())
        return s.wrongContract("mo-get", "object?", 0, argv);
    if(!propName.isSymbol())
        return s.wrongContract("mo-get", "symbol?", 1, argv);
    return jsObjectToScmObject(s.objectVal(mo)[s.symbolVal(propName)]);
}


function clientjsAlert(argv) {
    var msg = argv.length > 0 ? s.displayToString(argv[0]) : "";
    window.alert(msg);
    return s.voidValue;
}

function clientjsPrompt(argv) {
    var msg = argv.length > 0 ? s.displayToString(argv[0]) : "";
    var val = argv.length > 1 ? s.displayToString(argv[1]) : "";
    return s.makeString(window.prompt(msg, val));
}

function clientjsConfirm(argv) {
    var msg = argv.length > 0 ? s.displayToString(argv[0]) : "";
    return s.getBoolean(window.confirm(msg));
}

function randomInt(argv) {
    var n = argv[0];
    var m = argv[1];
    if(!n.isInteger())
        return s.wrongContract("random-int", "integer?", 0, argv);
    if(!n.isInteger())
        return s.wrongContract("random-int", "integer?", 1, argv);
    n = s.intVal(n);
    m = s.intVal(m);
    return s.makeInt(Math.floor(Math.random() * (m - n)) + n);
}

function jsObjectToScmObject(jsObj) {
    if(typeof jsObj == "undefined")
        return s.makeMyObject(jsObj);
    switch(jsObj.constructor) {
        case Number: return s.makeReal(jsObj);
        case String: return s.makeString(jsObj);
        case Boolean: return s.makeBoolean(jsObj);
        default: return s.makeMyObject(jsObj);
    }
}

})(scheme);