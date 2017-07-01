(function(scheme){
"use strict";

/*
作为语法抽象的语法构造器与选择器
 最好是宏，但JS中并不支持宏
*/
// 基本表达式
//quote
var quoteObject = scheme.cadr;
function makeQuotation(object) {
    return scheme.list(scheme.quoteSymbol, object);
}

// application/procedure call
var operator = scheme.car;
var operands = scheme.cdr;
function makeApplication(operator, operands) {
    return scheme.cons(operator, operands || scheme.nil);
}

// lambda
var lambdaParamters = scheme.cadr;
var lambdaBody = scheme.cddr;
function makeLambda(parameters, body) {
    return scheme.cons(scheme.lambdaSymbol, scheme.cons(parameters, body));
}


// if
var ifPredicate = scheme.cadr;
var ifConsequent = scheme.caddr;
function ifAlternative(exp) {
    exp = scheme.cdddr(exp);
    if(scheme.isEmptyList(exp))
        return exp;
    else
        return scheme.car(exp);
}
function makeIf(predicate, consequent, alternative) {
    return scheme.arrayToList([scheme.ifSymbol, predicate, consequent].concat(alternative || []));
}

// assignment
var assignmentVar = scheme.cadr;
var assignmentVal = scheme.caddr;

// define variable/procedure
function definitionVar(exp) { 
    if(scheme.isSymbol(scheme.cadr(exp)))
        return scheme.cadr(exp);
    else if(scheme.isPair(scheme.cadr(exp)))
        return scheme.caadr(exp);
    else
        return scheme.cadr(exp);
}
function definitionVal(exp) {
    if(scheme.isSymbol(scheme.cadr(exp)))
        return scheme.caddr(exp);
    else {
        var formals = scheme.cdadr(exp);
        var body = scheme.cddr(exp);
        return makeLambda(formals, body);
    }
}
function makeDefinition(variable, value) {
    return scheme.list(scheme.defineSymbol, variable, value);
}


//派生表达式

// begin
var beginActions = scheme.cdr;
function makeBegin(seq) {
    return scheme.cons(scheme.beginSymbol, seq);
}
scheme.makeBegin = makeBegin;

function sequenceExp(seq) {
    if(scheme.isEmptyList(seq)) return seq;
    else if(scheme.isEmptyList(scheme.cdr(seq))) return scheme.car(seq);
    else return makeBegin(seq);
}

// let
function isNamedLet(exp) { return scheme.isSymbol(scheme.cadr(exp)); }
function letVar(exp) { return scheme.cadr(exp); }
function letBindings(exp) { return (isNamedLet(exp) ? scheme.caddr : scheme.cadr)(exp); }
function letBody(exp) { return (isNamedLet(exp) ? scheme.cdddr : scheme.cddr)(exp); }
function letBindingVars(bindings) {
    return scheme.mapList(function(bind){ return scheme.car(bind); }, bindings);
}
function letBindingInits(bindings) {
    return scheme.mapList(function(bind){ return scheme.cadr(bind); }, bindings);
}
function makeBindings(bindings) {
    return bindings;
}
function makeLet(name, bindings, body) {
    return scheme.arrayToList(name ?
        [scheme.letSymbol, name, bindings, body] : [scheme.letSymbol, bindings, body]);
}
// cond
var condClauses = scheme.cdr;
function clauesPredicate(clause) { return scheme.car(clause); }
function clauseActions(clause) { return scheme.cdr(clause); }
function isElseClause(clause) { return clauesPredicate(clause) == scheme.elseSymbol; }
function makeCond(clauses) { return scheme.cons(scheme.condSymbol, clauses); }

//case
var caseKey = scheme.cadr;
var caseClauses = scheme.cddr;

// and
var andExps = scheme.cdr;

// or
var orExps = scheme.cdr;

// when
var whenTest = scheme.cadr;
var whenBody = scheme.cddr;
var unlessTest = scheme.cadr;
var unlessBody = scheme.cddr;
function makeWhen(test, body) {
    return scheme.cons(scheme.whenSymbol, scheme.cons(test, body));
}


// do
function doBindings(exp) { return scheme.cadr(exp); }
function doTest(exp) { return scheme.caaddr(exp); }
function doExpressions(exp) { return scheme.cdaddr(exp); }
function doCommands(exp) { return scheme.cdddr(exp); }
function doBindingVarAndInits(bindings) { 
    return scheme.mapList(function(bind){
        return scheme.list(scheme.car(bind), scheme.cadr(bind));
    }, bindings);
}
function doBindingSteps(bindings) {
    return scheme.mapList(function(bind){ return scheme.caddr(bind); }, bindings);
}


//----------
// 语法变换
//----------

function letToCombination(exp) {
    var bindings = letBindings(exp);
    var body = letBody(exp);
    if(isNamedLet(exp)) {
        return makeApplication(
            makeLambda(
                scheme.nil,
                scheme.list(
                    makeDefinition(letVar(exp), makeLambda(letBindingVars(bindings), body)),
                    makeApplication(letVar(exp), letBindingInits(bindings)))));
    }
    else {
        return makeApplication(
            makeLambda(letBindingVars(bindings), body),
            letBindingInits(bindings));
    }
}

function condToIf(exp) {
    return expandClauses(condClauses(exp));
    function expandClauses(clauses) {
        if(scheme.isEmptyList(clauses))
            return scheme.False;
        var first = scheme.car(clauses);
        var rest = scheme.cdr(clauses);
        if(isElseClause(first))
            if(scheme.isEmptyList(rest))
                return sequenceExp(clauseActions(first));
            else
                scheme.throwError('badSyntax', "'else' clause must be last");
        else {
            var predicate = clauesPredicate(first);
            var actionSequence= sequenceExp(clauseActions(first));
            if(scheme.isEmptyList(actionSequence))
                return makeIf(scheme.True, predicate, expandClauses(rest));
            else
                return makeIf(predicate, actionSequence, expandClauses(rest));
        }
    }
}

function caseToCond(exp) {
    var key = caseKey(exp);
    var tempVar = scheme.genSymbol();
    var clauses = scheme.mapList(function(clause) {
        return isElseClause(clause) ? clause :
            scheme.append(scheme.list(
                makeApplication(scheme.makeSymbol("memv"), scheme.list(tempVar, makeQuotation(clauesPredicate(clause))))),
                clauseActions(clause));
        }, caseClauses(exp));
    return makeLet(null, makeBindings(scheme.list(scheme.list(tempVar, key))), makeCond(clauses));
}

function andToIf(exp) {
    var exps = andExps(exp);
    if(scheme.isEmptyList(exps))
        return scheme.True;
    var tempVar = scheme.genSymbol();
    return expandExps(exps);
    function expandExps(exps) {
        var predicate = makeApplication(scheme.makeSymbol("not"), scheme.list(tempVar));
        var rest = scheme.cdr(exps);
        return makeLet(null,
            makeBindings(scheme.list(scheme.list(tempVar, scheme.car(exps)))),
            makeIf(predicate, tempVar,
                (scheme.isEmptyList(rest) ? tempVar : expandExps(rest))));
    }
}

function orToIf(exp) {
    var exps = orExps(exp);
    if(scheme.isEmptyList(exps))
        return scheme.False;
    var tempVar = scheme.genSymbol();
    return expandExps(exps);
    function expandExps(exps) {
        var predicate = tempVar;
        var rest = scheme.cdr(exps);
        return makeLet(null,
            makeBindings(scheme.list(scheme.list(tempVar, scheme.car(exps)))),
            makeIf(predicate, tempVar,
                (scheme.isEmptyList(rest) ? scheme.False : expandExps(rest))));
    }
}

function whenToIf(exp) {
    return makeIf(whenTest(exp), makeBegin(whenBody(exp)));
}

function unlessToIf(exp) {
    return makeIf(
        makeApplication(scheme.makeSymbol("not"), scheme.list(unlessTest(exp))),
        makeBegin(unlessBody(exp)));
}

function doToCombination(exp) {
    var bindings = doBindings(exp);
    var iterProcVar = scheme.genSymbol();
    var ifAlter = sequenceExp(
        scheme.append(doCommands(exp),
            scheme.list(makeApplication(iterProcVar, doBindingSteps(bindings)))));
    return makeLet(iterProcVar,
        doBindingVarAndInits(bindings),
        makeIf(doTest(exp), sequenceExp(doExpressions(exp)), ifAlter));
}

function transformWhile(exp) {
    var whileTest = scheme.cadr(exp);
    var whileBody = scheme.cddr(exp);
    var loopProcVar = scheme.genSymbol();
    return makeLet(
        loopProcVar, scheme.nil,
        makeWhen(whileTest,
            scheme.append(whileBody, scheme.list(makeApplication(loopProcVar)))));
}

function transformFor(exp) {
    var forVar = scheme.cadr(exp);
    var forLst = scheme.cadddr(exp);
    var forBody = scheme.cddddr(exp);
    if(scheme.isNumber(scheme.car(forLst)) && scheme.cadr(forLst) && scheme.caddr(forLst)) {//(<from> to <end>)
        var fromNum = scheme.car(forLst);
        var endNum = scheme.caddr(forLst);
        var loopProcVar = scheme.genSymbol();
        var bindings = scheme.list(scheme.list(forVar, fromNum));
        var loopInc = makeApplication(scheme.makeSymbol("+"), scheme.list(forVar, scheme.makeInt(1)));
        var loopCond = makeApplication(scheme.makeSymbol("<"), scheme.list(forVar, endNum));
        var whenUse = makeWhen(loopCond,
                        scheme.append(forBody, scheme.list(makeApplication(loopProcVar, scheme.list(loopInc)))));
        return makeLet(loopProcVar, bindings, whenUse);
    }
}


scheme.quoteObject = quoteObject;
scheme.operator = operator;
scheme.operands = operands;
scheme.lambdaParamters = lambdaParamters;
scheme.lambdaBody = lambdaBody;
scheme.makeIf = makeIf;
scheme.ifPredicate = ifPredicate;
scheme.ifConsequent = ifConsequent;
scheme.ifAlternative = ifAlternative;
scheme.assignmentVar = assignmentVar;
scheme.assignmentVal = assignmentVal;
scheme.definitionVar = definitionVar;
scheme.definitionVal = definitionVal;
scheme.beginActions = beginActions;
scheme.sequenceExp = sequenceExp;

scheme.letToCombination = letToCombination;
scheme.condToIf = condToIf;
scheme.caseToCond = caseToCond;
scheme.andToIf = andToIf;
scheme.orToIf = orToIf;
scheme.transformDo = doToCombination;
scheme.whenToIf = whenToIf;
scheme.unlessToIf = unlessToIf;
scheme.transformWhile = transformWhile;
scheme.transformFor = transformFor;
})(scheme);
