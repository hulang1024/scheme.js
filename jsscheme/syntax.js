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
    return s.arrayToList([s.ifSymbol, predicate, consequent, alternative]);
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
    return s.cons(operator, operands);
}

// assignment
function assignmentVar(exp) { return s.cadr(exp); }
function assignmentVal(exp) { return s.caddr(exp); }

// define variable/function
function definitionVar(exp) { 
    if(s.cadr(exp).isSymbol())
        return s.cadr(exp);
    else
        return s.caadr(exp);
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
    return s.arrayToList([s.defineSymbol, variable, value]);
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

// cond
function condClauses(exp) { return s.cdr(exp); }
function clauesPredicate(clause) { return s.car(clause); }
function clauseActions(clause) { return s.cdr(clause); }
function isElseClause(clause) { return clauesPredicate(clause) == s.elseSymbol; }

// and
function andExps(exp) { return s.cdr(exp); }
// or
function orExps(exp) { return s.cdr(exp); }

// let
function letBindings(exp) { return s.cadr(exp); }
function letBody(exp) { return s.cddr(exp); }
function letBindingVars(bindings) {
    return s.mapList(function(bind){ return s.car(bind); }, bindings);
}
function letBindingInits(bindings) {
    return s.mapList(function(bind){ return s.cadr(bind); }, bindings);
}
function makeBindings(bindings) {
    return bindings;
}
function makeLet(bindings, body) {
    return s.arrayToList([s.letSymbol, bindings, body]);
}

// do
function doBindings(exp) { return s.cadr(exp); }
function doTest(exp) { return s.caaddr(exp); }
function doExpressions(exp) { return s.cdaddr(exp); }
function doCommands(exp) { return s.cdddr(exp); }
function doBindingVars(bindings) { 
    return s.mapList(function(bind){ return s.car(bind); }, bindings);
}
function doBindingInits(bindings) {
    return s.mapList(function(bind){ return s.cadr(bind); }, bindings);
}
function doBindingSteps(bindings) {
    return s.mapList(function(bind){ return s.caddr(bind); }, bindings);
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
s.condClauses = condClauses;
s.clauesPredicate = clauesPredicate;
s.clauseActions = clauseActions;
s.isElseClause = isElseClause;
s.andExps = andExps;
s.orExps = orExps;
s.letBindings = letBindings;
s.letBody = letBody;
s.letBindingVars = letBindingVars;
s.letBindingInits = letBindingInits;
s.makeBindings = makeBindings;
s.makeLet = makeLet;
s.doBindings = doBindings;
s.doTest = doTest;
s.doExpressions = doExpressions;
s.doCommands = doCommands;
s.doBindingVars = doBindingVars;
s.doBindingInits = doBindingInits;
s.doBindingSteps = doBindingSteps;
})(scheme);