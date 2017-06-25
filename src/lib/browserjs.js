(function(scheme) {
"use strict";

scheme.initJSObject = function(env) {
    scheme.addPrimProc(env, "jso?", jsObject_p, 1);
    scheme.addPrimProc(env, "jsfn?", jsFunction_p, 1);
    
    scheme.addPrimProc(env, "jso-set", setJSOProperty, 2);
    scheme.addPrimProc(env, "jso-get", getJSOProperty, 2);
    scheme.addPrimProc(env, "call-jsfn", callJSFunc, 2, -1);
    
    scheme.addPrimProc(env, "random-int", randomInt, 2);
    scheme.addPrimProc(env, "alert", clientjsAlert, 0, 1);
    scheme.addPrimProc(env, "prompt", clientjsPrompt, 0, 2);
    scheme.addPrimProc(env, "confirm", clientjsConfirm, 0, 1);
    
    scheme.addPrimProc(env, "getElementById", getElementById, 2);
    scheme.addPrimProc(env, "getElementsByClassName", getElementsByClassName, 2);
    scheme.addPrimProc(env, "getElementsByName", getElementsByName, 2);
    scheme.addPrimProc(env, "getElementsByTagName", getElementsByTagName, 2);
    scheme.addPrimProc(env, "dom-set", setDomProperty, 3);
    scheme.addPrimProc(env, "dom-get", getDomProperty, 2);
    scheme.addPrimProc(env, "dom-set-event", setDomEventProperty, 3);
    
    scheme.addPrimProc(env, "draw-box-pointer", drawBoxAndPointer, 1);
    
    scheme.addPrimProc(env, "ajax-load", ajaxLoad, 2);
    
    scheme.addObject(env, "window", scheme.makeJSObject(window));
    scheme.addObject(env, "document", scheme.makeJSObject(window.document));
}

scheme.makeJSObject = function(val) {
    return new scheme.Object(scheme_jsobject_type, val);
}
scheme.objectVal = function(obj) { return obj.val; }

function isJSFunction(argv) {
    var o = argv[0];
    return scheme.isJSObject(o) && typeof o == "function";
}

function jsObject_p(argv) {
    return scheme.getBoolean(scheme.isJSObject(argv[0]));
}

function jsFunction_p(argv) {
    return scheme.getBoolean(isJSFunction(argv[0]));
}

function setJSOProperty(argv) {
    var jso = argv[0];
    var propName = argv[1];
    var value = argv[2];
    if(!scheme.isJSObject(jso))
        return scheme.wrongContract("jso-set", "jsobject?", 0, argv);
    if(!scheme.isSymbol(propName))
        return scheme.wrongContract("jso-set", "symbol?", 1, argv);
    scheme.objectVal(jso)[scheme.symbolVal(propName)] = scheme.isString(value) ? scheme.stringVal(value) : value.val;
    return value;
}

function getJSOProperty(argv) {
    var jso = argv[0];
    var propName = argv[1];
    if(!scheme.isJSObject(jso))
        return scheme.wrongContract("jso-get", "jsobject?", 0, argv);
    if(!scheme.isSymbol(propName))
        return scheme.wrongContract("jso-get", "symbol?", 1, argv);
    return scheme.objectVal(jso)[scheme.symbolVal(propName)];
}

function callJSFunc(argv) {
    var func = argv[0];
    var thisArg = argv[1];
    if(!isJSFunction(func))
        return scheme.wrongContract("call-jsfn", "jsfn?", 0, argv);
    if(!scheme.isJSObject(thisArg))
        return scheme.wrongContract("call-jsfn", "jso?", 0, argv);
    var jsos = argv.slice(1).map(function(fn){ return fn.val; });
    return scheme.objectVal(fn).apply(scheme.objectVal(thisArg), jsos);
}

//-------------------
// query dom elements
//-------------------
function getElementById(argv) {
    var dom = argv[0];
    var id = argv[1];
    if(!scheme.isJSObject(dom))
        return scheme.wrongContract("getElementById", "jsobject?", 0, argv);
    if(!scheme.isString(id))
        return scheme.wrongContract("getElementById", "string?", 1, argv);
    return scheme.makeJSObject(scheme.objectVal(dom).getElementById(scheme.stringVal(id)));
}

function getElementsByClassName(argv) {
    var dom = argv[0];
    var className = argv[1];
    if(!scheme.isJSObject(dom))
        return scheme.wrongContract("getElementsByClassName", "jsobject?", 0, argv);
    if(!scheme.isString(className))
        return scheme.wrongContract("getElementsByClassName", "string?", 1, argv);
    return scheme.makeJSObject(scheme.objectVal(dom).getElementById(scheme.stringVal(className)));
}

function getElementsByName(argv) {
    var dom = argv[0];
    var name = argv[1];
    if(!scheme.isJSObject(dom))
        return scheme.wrongContract("getElementsByName", "jsobject?", 0, argv);
    if(!scheme.isString(name))
        return scheme.wrongContract("getElementsByName", "string?", 1, argv);
    return scheme.makeJSObject(scheme.objectVal(dom).getElementById(scheme.stringVal(name)));
}

function getElementsByTagName(argv) {
    var dom = argv[0];
    var tagName = argv[1];
    if(!scheme.isJSObject(dom))
        return scheme.wrongContract("getElementsByTagName", "jsobject?", 0, argv);
    if(!scheme.isString(tagName))
        return scheme.wrongContract("getElementsByTagName", "string?", 1, argv);
    return scheme.makeJSObject(scheme.objectVal(dom).getElementById(scheme.stringVal(tagName)));
}

//----------------------------------
// dom object property setter/getter
//----------------------------------
function setDomProperty(argv) {
    var dom = argv[0];
    var propName = argv[1];
    var value = argv[2];
    if(!scheme.isJSObject(dom))
        return scheme.wrongContract("dom-set", "jsobject?", 0, argv);
    if(!scheme.isSymbol(propName))
        return scheme.wrongContract("dom-set", "symbol?", 1, argv);
    scheme.objectVal(dom)[scheme.symbolVal(propName)] = scheme.isString(value) ? scheme.stringVal(value) : value.val;
    return value;
}

function setDomEventProperty(argv) {
    var dom = argv[0];
    var eventName = argv[1];
    var proc = argv[2];
    if(!scheme.isJSObject(dom))
        return scheme.wrongContract("dom-set-event", "jsobject?", 0, argv);
    if(!scheme.isSymbol(eventName))
        return scheme.wrongContract("dom-set-event", "symbol?", 1, argv);
    if(!scheme.isProcedure(proc))
        return scheme.wrongContract("dom-set-event", "procedure?", 2, argv);
    scheme.objectVal(dom)[scheme.symbolVal(eventName)] = function(event) {
        var argv = [scheme.makeJSObject(event)];
        scheme.apply(proc, argv);
    }
    return proc;
}

function getDomProperty(argv) {
    var dom = argv[0];
    var propName = argv[1];
    if(!scheme.isJSObject(dom))
        return scheme.wrongContract("dom-get", "jsobject?", 0, argv);
    if(!scheme.isSymbol(propName))
        return scheme.wrongContract("dom-get", "symbol?", 1, argv);
    return jsObjectToScmObject(scheme.objectVal(dom)[scheme.symbolVal(propName)]);
}


function clientjsAlert(argv) {
    var msg = argv.length > 0 ? scheme.displayToString(argv[0]) : "";
    window.alert(msg);
    return scheme.voidValue;
}

function clientjsPrompt(argv) {
    var msg = argv.length > 0 ? scheme.displayToString(argv[0]) : "";
    var val = argv.length > 1 ? scheme.displayToString(argv[1]) : "";
    return scheme.makeString(window.prompt(msg, val));
}

function clientjsConfirm(argv) {
    var msg = argv.length > 0 ? scheme.displayToString(argv[0]) : "";
    return scheme.getBoolean(window.confirm(msg));
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
    return scheme.voidValue;
}

function randomInt(argv) {
    var n = argv[0];
    var m = argv[1];
    if(!scheme.isInteger(n))
        return scheme.wrongContract("random-int", "integer?", 0, argv);
    if(!scheme.isInteger(m))
        return scheme.wrongContract("random-int", "integer?", 1, argv);
    n = scheme.intVal(n);
    m = scheme.intVal(m);
    return scheme.makeInt(Math.floor(Math.random() * (m - n)) + n);
}

function ajaxLoad(argv) {
    var filePath = argv[0];
    var onLoadProc = argv[1];
    
    if(!scheme.isString(filePath))
        return scheme.wrongContract("ajax-load", "string?", 0, argv);
    if(!scheme.isProcedure(onLoadProc))
        return scheme.wrongContract("ajax-load", "procedure?", 1, argv);

    var req = new XMLHttpRequest();
    req.open('GET', '../' + scheme.stringVal(filePath), true);
    req.addEventListener('load', function(event){
        var src = event.target.responseText;
        scheme.evalString(src);
        try {
            scheme.apply(onLoadProc, []);
        } catch(e) {
            scheme.outputError();
            throw e;
        }
    }, false);
    req.send(null);

    return scheme.voidValue;
}

function jsObjectToScmObject(jsObj) {
    if(typeof jsObj == "undefined")
        return scheme.makeJSObject(jsObj);
    switch(jsObj.constructor) {
        case Number: return scheme.makeDouble(jsObj);
        case String: return scheme.makeString(jsObj);
        case Boolean: return scheme.makeBoolean(jsObj);
        default: return scheme.makeJSObject(jsObj);
    }
}

})(scheme);