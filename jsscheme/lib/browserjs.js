(function(s) {
"use strict";

s.initJSObject = function(env) {
    s.addPrimProc(env, "jso?", jsObject_p, 1);
    s.addPrimProc(env, "jsfn?", jsFunction_p, 1);
    
    s.addPrimProc(env, "jso-set", setJSOProperty, 2);
    s.addPrimProc(env, "jso-get", getJSOProperty, 2);
    s.addPrimProc(env, "call-jsfn", callJSFunc, 2, -1);
    
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
    
    s.addPrimProc(env, "draw-box-pointer", drawBoxAndPointer, 1);

    s.addObject(env, "window", s.makeJSObject(window));
    s.addObject(env, "document", s.makeJSObject(window.document));
}

s.makeJSObject = function(val) {
    return new s.Object(30, val);
}
s.objectVal = function(obj) { return obj.val; }

function isJSFunction(argv) {
    var o = argv[0];
    return o.isJSObject() && typeof o == "function";
}

function jsObject_p(argv) {
    return s.getBoolean(argv[0].isJSObject());
}

function jsFunction_p(argv) {
    return s.getBoolean(isJSFunction(argv[0]));
}

function setJSOProperty(argv) {
    var jso = argv[0];
    var propName = argv[1];
    var value = argv[2];
    if(!jso.isJSObject())
        return s.wrongContract("jso-set", "jsobject?", 0, argv);
    if(!propName.isSymbol())
        return s.wrongContract("jso-set", "symbol?", 1, argv);
    s.objectVal(jso)[s.symbolVal(propName)] = value.isString() ? s.stringVal(value) : value.val;
    return value;
}

function getJSOProperty(argv) {
    var jso = argv[0];
    var propName = argv[1];
    if(!jso.isJSObject())
        return s.wrongContract("jso-get", "jsobject?", 0, argv);
    if(!propName.isSymbol())
        return s.wrongContract("jso-get", "symbol?", 1, argv);
    return s.objectVal(jso)[s.symbolVal(propName)];
}

function callJSFunc(argv) {
    var func = argv[0];
    var thisArg = argv[1];
    if(!isJSFunction(func))
        return s.wrongContract("call-jsfn", "jsfn?", 0, argv);
    if(!thisArg.isJSObject())
        return s.wrongContract("call-jsfn", "jso?", 0, argv);
    var jsos = argv.slice(1).map(function(fn){ return fn.val; });
    return s.objectVal(fn).apply(s.objectVal(thisArg), jsos);
}

//-------------------
// query dom elements
//-------------------
function getElementById(argv) {
    var dom = argv[0];
    var id = argv[1];
    if(!dom.isJSObject())
        return s.wrongContract("getElementById", "jsobject?", 0, argv);
    if(!id.isString())
        return s.wrongContract("getElementById", "string?", 1, argv);
    return s.makeJSObject(s.objectVal(dom).getElementById(s.stringVal(id)));
}

function getElementsByClassName(argv) {
    var dom = argv[0];
    var className = argv[1];
    if(!dom.isJSObject())
        return s.wrongContract("getElementsByClassName", "jsobject?", 0, argv);
    if(!className.isString())
        return s.wrongContract("getElementsByClassName", "string?", 1, argv);
    return s.makeJSObject(s.objectVal(dom).getElementById(s.stringVal(className)));
}

function getElementsByName(argv) {
    var dom = argv[0];
    var name = argv[1];
    if(!dom.isJSObject())
        return s.wrongContract("getElementsByName", "jsobject?", 0, argv);
    if(!name.isString())
        return s.wrongContract("getElementsByName", "string?", 1, argv);
    return s.makeJSObject(s.objectVal(dom).getElementById(s.stringVal(name)));
}

function getElementsByTagName(argv) {
    var dom = argv[0];
    var tagName = argv[1];
    if(!dom.isJSObject())
        return s.wrongContract("getElementsByTagName", "jsobject?", 0, argv);
    if(!tagName.isString())
        return s.wrongContract("getElementsByTagName", "string?", 1, argv);
    return s.makeJSObject(s.objectVal(dom).getElementById(s.stringVal(tagName)));
}

//----------------------------------
// dom object property setter/getter
//----------------------------------
function setDomProperty(argv) {
    var dom = argv[0];
    var propName = argv[1];
    var value = argv[2];
    if(!dom.isJSObject())
        return s.wrongContract("dom-set", "jsobject?", 0, argv);
    if(!propName.isSymbol())
        return s.wrongContract("dom-set", "symbol?", 1, argv);
    s.objectVal(dom)[s.symbolVal(propName)] = value.isString() ? s.stringVal(value) : value.val;
    return value;
}

function setDomEventProperty(argv) {
    var dom = argv[0];
    var eventName = argv[1];
    var proc = argv[2];
    if(!dom.isJSObject())
        return s.wrongContract("dom-set-event", "jsobject?", 0, argv);
    if(!eventName.isSymbol())
        return s.wrongContract("dom-set-event", "symbol?", 1, argv);
    if(!proc.isProcedure())
        return s.wrongContract("dom-set-event", "procedure?", 2, argv);
    s.objectVal(dom)[s.symbolVal(eventName)] = function(event) {
        var argv = [s.makeJSObject(event)];
        s.apply(proc, argv);
    }
    return proc;
}

function getDomProperty(argv) {
    var dom = argv[0];
    var propName = argv[1];
    if(!dom.isJSObject())
        return s.wrongContract("dom-get", "jsobject?", 0, argv);
    if(!propName.isSymbol())
        return s.wrongContract("dom-get", "symbol?", 1, argv);
    return jsObjectToScmObject(s.objectVal(dom)[s.symbolVal(propName)]);
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

function drawBoxAndPointer(argv) {
    var win = window.open("", new Date().getTime(),
        "width=1000, height=700, location=no, status=no, toolbar=no, left=400");
    var canvas = document.createElement("canvas");   
    canvas.width = 900;
    canvas.height = 600;
    win.document.body.append(canvas);
    
    var ctx = canvas.getContext("2d");
    BoxAndPointer.calc(BoxAndPointer.from(argv[0])).draw(ctx);
    return s.voidValue;
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
        return s.makeJSObject(jsObj);
    switch(jsObj.constructor) {
        case Number: return s.makeReal(jsObj);
        case String: return s.makeString(jsObj);
        case Boolean: return s.makeBoolean(jsObj);
        default: return s.makeJSObject(jsObj);
    }
}

})(scheme);