(function(s){
"use strict";

// if
function ifPredicate(exp) { return s.cadr(exp); }
function ifConsequent(exp) { return s.caddr(exp); }
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

// lambda
function lambdaParamters(exp) { return s.cadr(exp); }
function lambdaBody(exp) { return s.cddr(exp); }
function makeLambda(parameters, body) {
    return s.cons(s.lambdaSymbol, s.cons(parameters, body));
}

// application/procedure call
function operator(exp) { return s.car(exp); }
function operands(exp) { return s.cdr(exp); }
function makeApplication(operator, operands) {
    return s.cons(operator, operands || s.nil);
}

// assignment
function assignmentVar(exp) { return s.cadr(exp); }
function assignmentVal(exp) { return s.caddr(exp); }

// define variable/procedure
function isProcedureDefinition(exp) {
    return s.cadr(exp).isPair();
}

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
function beginActions(exp) {
    return s.cdr(exp);
}
function makeBegin(seq) {
    return s.cons(s.beginSymbol, seq);
}

function sequenceExp(seq) {
    if(seq.isEmptyList()) return seq;
    else if(s.cdr(seq).isEmptyList()) return s.car(seq);
    else return s.makeBegin(seq);
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
function condClauses(exp) { return s.cdr(exp); }
function clauesPredicate(clause) { return s.car(clause); }
function clauseActions(clause) { return s.cdr(clause); }
function isElseClause(clause) { return clauesPredicate(clause) == s.elseSymbol; }

// and
function andExps(exp) { return s.cdr(exp); }
// or
function orExps(exp) { return s.cdr(exp); }


// when
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


//------
// 变换
//------

function transformProcedureDefinition(exp) {
    var variable = s.caadr(exp);
    var formals = s.cdadr(exp);
    var body = s.cddr(exp);
    return s.makeDefinition(variable, makeLambda(formals, body));
}

function letToCombination(exp) {
    var bindings = s.letBindings(exp);
    var body = s.letBody(exp);
    if(s.isNamedLet(exp)) {
        return s.makeApplication(
            s.makeLambda(
                s.nil,
                s.list(
                    s.makeDefinition(s.letVar(exp), s.makeLambda(s.letBindingVars(bindings), body)),
                    s.makeApplication(s.letVar(exp), s.letBindingInits(bindings)))));
    }
    else {
        return s.makeApplication(
            s.makeLambda(s.letBindingVars(bindings), body),
            s.letBindingInits(bindings));
    }
}

function condToIf(exp) {
    return expandClauses(s.condClauses(exp));
    function expandClauses(clauses) {
        if(clauses.isEmptyList())
            return s.False;
        var first = s.car(clauses);
        var rest = s.cdr(clauses);
        if(s.isElseClause(first))
            if(rest.isEmptyList())
                return s.sequenceExp(s.clauseActions(first));
            else
                s.throwError('badSyntax', "'else' clause must be last");
        else {
            var predicate = s.clauesPredicate(first);
            var actionSequence= s.sequenceExp(s.clauseActions(first));
            if(actionSequence.isEmptyList())
                return s.makeIf(s.True, predicate, expandClauses(rest));
            else
                return s.makeIf(predicate, actionSequence, expandClauses(rest));
        }
    }
}

function andToIf(exp) {
    var exps = s.andExps(exp);
    if(exps.isEmptyList())
        return s.True;
    var tempVar = s.genSymbol();
    return expandExps(exps);
    function expandExps(exps) {
        var predicate = s.makeApplication(s.makeSymbol("not"), s.list(tempVar));
        var rest = s.cdr(exps);
        return s.makeLet(null,
            s.makeBindings(s.list(s.list(tempVar, s.car(exps)))),
            s.makeIf(predicate, tempVar,
                (rest.isEmptyList() ? tempVar : expandExps(rest))));
    }
}

function orToIf(exp) {
    var exps = s.orExps(exp);
    if(exps.isEmptyList())
        return s.False;
    var tempVar = s.genSymbol();
    return expandExps(exps);
    function expandExps(exps) {
        var predicate = tempVar;
        var rest = s.cdr(exps);
        return s.makeLet(null,
            s.makeBindings(s.list(s.list(tempVar, s.car(exps)))),
            s.makeIf(predicate, tempVar,
                (rest.isEmptyList() ? s.False : expandExps(rest))));
    }
}

function transformWhen(exp) {
    return s.makeIf(s.whenTest(exp), s.makeBegin(s.whenBody(exp)));
}

function transformUnless(exp) {
    return s.makeIf(
        s.makeApplication(s.makeSymbol("not"), s.list(s.unlessTest(exp))),
        s.makeBegin(s.unlessBody(exp)));
}

function doToCombination(exp) {
    var bindings = s.doBindings(exp);
    var iterProcVar = s.genSymbol();
    var ifAlter = s.sequenceExp(
        s.append(s.doCommands(exp),
            s.list(s.makeApplication(iterProcVar, s.doBindingSteps(bindings)))));
    return s.makeLet(iterProcVar,
        s.doBindingVarAndInits(bindings),
        s.makeIf(s.doTest(exp), s.sequenceExp(s.doExpressions(exp)), ifAlter));
}

function transformWhile(exp) {
    var whileTest = s.cadr(exp);
    var whileBody = s.cddr(exp);
    var loopProcVar = s.genSymbol();
    return s.makeLet(
        loopProcVar, s.nil,
        s.makeWhen(whileTest,
            s.append(whileBody, s.list(s.makeApplication(loopProcVar)))));
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
        var loopInc = s.makeApplication(s.makeSymbol("+"), s.list(forVar, s.makeInt(1)));
        var loopCond = s.makeApplication(s.makeSymbol("<"), s.list(forVar, endNum));
        var whenUse = s.makeWhen(loopCond,
                        s.append(forBody, s.list(s.makeApplication(loopProcVar, s.list(loopInc)))));
        return s.makeLet(loopProcVar, bindings, whenUse);
    }
}

s.ifPredicate = ifPredicate;
s.ifConsequent = ifConsequent;
s.ifAlternative = ifAlternative;
s.makeIf = makeIf;
s.lambdaParamters = lambdaParamters;
s.lambdaBody = lambdaBody;
s.makeLambda = makeLambda;
s.operator = operator;
s.operands = operands;
s.makeApplication = makeApplication;
s.assignmentVar = assignmentVar;
s.assignmentVal = assignmentVal;
s.definitionVar = definitionVar;
s.definitionVal = definitionVal;
s.makeDefinition = makeDefinition;

s.sequenceExp = sequenceExp;
s.beginActions = beginActions;
s.makeBegin = makeBegin;
s.letVar = letVar;
s.letBindings = letBindings;
s.letBody = letBody;
s.letBindingVars = letBindingVars;
s.letBindingInits = letBindingInits;
s.makeBindings = makeBindings;
s.makeLet = makeLet;
s.condClauses = condClauses;
s.clauesPredicate = clauesPredicate;
s.clauseActions = clauseActions;
s.isElseClause = isElseClause;
s.andExps = andExps;
s.orExps = orExps;
s.whenTest = s.cadr;
s.whenBody = s.cddr;
s.makeWhen = makeWhen;
s.unlessTest = s.cadr;
s.unlessBody = s.cddr;
s.isNamedLet = isNamedLet;
s.doBindings = doBindings;
s.doTest = doTest;
s.doExpressions = doExpressions;
s.doCommands = doCommands;
s.doBindingVarAndInits = doBindingVarAndInits;
s.doBindingSteps = doBindingSteps;

s.letToCombination = letToCombination;
s.condToIf = condToIf;
s.andToIf = andToIf;
s.orToIf = orToIf;
s.doToCombination = doToCombination;
s.transformWhen = transformWhen;
s.transformUnless = transformUnless;
s.transformWhile = transformWhile;
s.transformFor = transformFor;
})(scheme);