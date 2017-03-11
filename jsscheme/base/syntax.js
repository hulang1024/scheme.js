(function(s){
"use strict";

// 基本表达式
//quote
var quoteObject = s.cadr;
function makeQuotation(object) {
    return s.list(s.quoteSymbol, object);
}

// application/procedure call
var operator = s.car;
var operands = s.cdr;
function makeApplication(operator, operands) {
    return s.cons(operator, operands || s.nil);
}

// lambda
var lambdaParamters = s.cadr;
var lambdaBody = s.cddr;
function makeLambda(parameters, body) {
    return s.cons(s.lambdaSymbol, s.cons(parameters, body));
}


// if
var ifPredicate = s.cadr;
var ifConsequent = s.caddr;
function ifAlternative(exp) {
    exp = s.cdddr(exp);
    if(exp.isEmptyList())
        return exp;
    else
        return s.car(exp);
}
function makeIf(predicate, consequent, alternative) {
    return s.arrayToList([s.ifSymbol, predicate, consequent].concat(alternative || []));
}

// assignment
var assignmentVar = s.cadr;
var assignmentVal = s.caddr;

// define variable/procedure
function definitionVar(exp) { 
    if(s.cadr(exp).isSymbol())
        return s.cadr(exp);
    else if(s.cadr(exp).isPair())
        return s.caadr(exp);
    else
        return s.cadr(exp);
}
function definitionVal(exp) {
    if(s.cadr(exp).isSymbol())
        return s.caddr(exp);
    else {
        var formals = s.cdadr(exp);
        var body = s.cddr(exp);
        return makeLambda(formals, body);
    }
}
function makeDefinition(variable, value) {
    return s.list(s.defineSymbol, variable, value);
}


//派生表达式

// begin
var beginActions = s.cdr;
function makeBegin(seq) {
    return s.cons(s.beginSymbol, seq);
}

function sequenceExp(seq) {
    if(seq.isEmptyList()) return seq;
    else if(s.cdr(seq).isEmptyList()) return s.car(seq);
    else return makeBegin(seq);
}

// let
function isNamedLet(exp) { return s.cadr(exp).isSymbol(); }
function letVar(exp) { return s.cadr(exp); }
function letBindings(exp) { return (isNamedLet(exp) ? s.caddr : s.cadr)(exp); }
function letBody(exp) { return (isNamedLet(exp) ? s.cdddr : s.cddr)(exp); }
function letBindingVars(bindings) {
    return s.mapList(function(bind){ return s.car(bind); }, bindings);
}
function letBindingInits(bindings) {
    return s.mapList(function(bind){ return s.cadr(bind); }, bindings);
}
function makeBindings(bindings) {
    return bindings;
}
function makeLet(name, bindings, body) {
    return s.arrayToList(name ?
        [s.letSymbol, name, bindings, body] : [s.letSymbol, bindings, body]);
}
// cond
var condClauses = s.cdr;
function clauesPredicate(clause) { return s.car(clause); }
function clauseActions(clause) { return s.cdr(clause); }
function isElseClause(clause) { return clauesPredicate(clause) == s.elseSymbol; }
function makeCond(clauses) { return s.cons(s.condSymbol, clauses); }

//case
var caseKey = s.cadr;
var caseClauses = s.cddr;

// and
var andExps = s.cdr;

// or
var orExps = s.cdr;

// when
var whenTest = s.cadr;
var whenBody = s.cddr;
var unlessTest = s.cadr;
var unlessBody = s.cddr;
function makeWhen(test, body) {
    return s.cons(s.whenSymbol, s.cons(test, body));
}


// do
function doBindings(exp) { return s.cadr(exp); }
function doTest(exp) { return s.caaddr(exp); }
function doExpressions(exp) { return s.cdaddr(exp); }
function doCommands(exp) { return s.cdddr(exp); }
function doBindingVarAndInits(bindings) { 
    return s.mapList(function(bind){
        return s.list(s.car(bind), s.cadr(bind));
    }, bindings);
}
function doBindingSteps(bindings) {
    return s.mapList(function(bind){ return s.caddr(bind); }, bindings);
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
                s.nil,
                s.list(
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
        if(clauses.isEmptyList())
            return s.False;
        var first = s.car(clauses);
        var rest = s.cdr(clauses);
        if(isElseClause(first))
            if(rest.isEmptyList())
                return sequenceExp(clauseActions(first));
            else
                s.throwError('badSyntax', "'else' clause must be last");
        else {
            var predicate = clauesPredicate(first);
            var actionSequence= sequenceExp(clauseActions(first));
            if(actionSequence.isEmptyList())
                return makeIf(s.True, predicate, expandClauses(rest));
            else
                return makeIf(predicate, actionSequence, expandClauses(rest));
        }
    }
}

function caseToCond(exp) {
    var key = caseKey(exp);
    var tempVar = s.genSymbol();
    var clauses = s.mapList(function(clause) {
        return isElseClause(clause) ? clause :
            s.append(s.list(
                makeApplication(s.makeSymbol("memv"), s.list(tempVar, makeQuotation(clauesPredicate(clause))))),
                clauseActions(clause));
        }, caseClauses(exp));
    return makeLet(null, makeBindings(s.list(s.list(tempVar, key))), makeCond(clauses));
}

function andToIf(exp) {
    var exps = andExps(exp);
    if(exps.isEmptyList())
        return s.True;
    var tempVar = s.genSymbol();
    return expandExps(exps);
    function expandExps(exps) {
        var predicate = makeApplication(s.makeSymbol("not"), s.list(tempVar));
        var rest = s.cdr(exps);
        return makeLet(null,
            makeBindings(s.list(s.list(tempVar, s.car(exps)))),
            makeIf(predicate, tempVar,
                (rest.isEmptyList() ? tempVar : expandExps(rest))));
    }
}

function orToIf(exp) {
    var exps = orExps(exp);
    if(exps.isEmptyList())
        return s.False;
    var tempVar = s.genSymbol();
    return expandExps(exps);
    function expandExps(exps) {
        var predicate = tempVar;
        var rest = s.cdr(exps);
        return makeLet(null,
            makeBindings(s.list(s.list(tempVar, s.car(exps)))),
            makeIf(predicate, tempVar,
                (rest.isEmptyList() ? s.False : expandExps(rest))));
    }
}

function whenToIf(exp) {
    return makeIf(s.whenTest(exp), makeBegin(s.whenBody(exp)));
}

function unlessToIf(exp) {
    return makeIf(
        makeApplication(s.makeSymbol("not"), s.list(s.unlessTest(exp))),
        makeBegin(s.unlessBody(exp)));
}

function doToCombination(exp) {
    var bindings = doBindings(exp);
    var iterProcVar = s.genSymbol();
    var ifAlter = sequenceExp(
        s.append(doCommands(exp),
            s.list(makeApplication(iterProcVar, doBindingSteps(bindings)))));
    return makeLet(iterProcVar,
        doBindingVarAndInits(bindings),
        makeIf(doTest(exp), sequenceExp(doExpressions(exp)), ifAlter));
}

function transformWhile(exp) {
    var whileTest = s.cadr(exp);
    var whileBody = s.cddr(exp);
    var loopProcVar = s.genSymbol();
    return makeLet(
        loopProcVar, s.nil,
        makeWhen(whileTest,
            s.append(whileBody, s.list(makeApplication(loopProcVar)))));
}

function transformFor(exp) {
    var forVar = s.cadr(exp);
    var forLst = s.cadddr(exp);
    var forBody = s.cddddr(exp);
    if(s.car(forLst).isNumber() && s.cadr(forLst) && s.caddr(forLst)) {//(<from> to <end>)
        var fromNum = s.car(forLst);
        var endNum = s.caddr(forLst);
        var loopProcVar = s.genSymbol();
        var bindings = s.list(s.list(forVar, fromNum));
        var loopInc = makeApplication(s.makeSymbol("+"), s.list(forVar, s.makeInt(1)));
        var loopCond = makeApplication(s.makeSymbol("<"), s.list(forVar, endNum));
        var whenUse = makeWhen(loopCond,
                        s.append(forBody, s.list(makeApplication(loopProcVar, s.list(loopInc)))));
        return makeLet(loopProcVar, bindings, whenUse);
    }
}

s.quoteObject = quoteObject;
s.operator = operator;
s.operands = operands;
s.lambdaParamters = lambdaParamters;
s.lambdaBody = lambdaBody;
s.ifPredicate = ifPredicate;
s.ifConsequent = ifConsequent;
s.ifAlternative = ifAlternative;
s.assignmentVar = assignmentVar;
s.assignmentVal = assignmentVal;
s.definitionVar = definitionVar;
s.definitionVal = definitionVal;
s.beginActions = beginActions;

s.letToCombination = letToCombination;
s.transformCond = condToIf;
s.transformCase = caseToCond;
s.transformAnd = andToIf;
s.transformOr = orToIf;
s.transformDo = doToCombination;
s.transformWhen = whenToIf;
s.transformUnless = unlessToIf;
s.transformWhile = transformWhile;
s.transformFor = transformFor;
})(scheme);