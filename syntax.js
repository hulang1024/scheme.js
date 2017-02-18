(function(s){
"use strict";

// if
function ifPredicate(exp) { return s.cadr(exp); }
function ifConsequent(exp) { return s.caddr(exp); }
function ifAlternative(exp) {
    exp = s.cdddr(exp);
    if(exp.isEmptyList())
        return exp;
    else // alternative
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

// application
function operator(exp) { return s.car(exp); }
function operands(exp) { return s.cdr(exp); }
function makeApplication(operator, operands) {
    return s.cons(operator, operands);
}

// assignment
function assignmentVar(exp) { return s.cadr(exp); }
function assignmentValue(exp) { return s.caddr(exp); }

// cond
function condClauses(exp) { return s.cdr(exp); }
function clauesPredicate(clause) { return s.car(clause); }
function clauseActions(clause) { return s.cdr(clause); }
function isElseClause(clause) { return clauesPredicate(clause) == s.elseSymbol; }

// and
function andExps(exp) { return s.cdr(exp); }
// or
function orExps(exp) { return s.cdr(exp); }

// begin
function beginActions(exp) {
    return s.cdr(exp);
}
function makeBegin(seq) {
    return s.cons(s.beginSymbol, seq);
}

// let
function letBindings(exp) { return s.cadr(exp); }
function letBody(exp) { return s.cddr(exp); }
function letBindingVars(bindings) {
    return s.mapList(function(bind){
        return s.car(bind);
    }, bindings);
}
function letBindingVals(bindings) {
    return s.mapList(function(bind){
        return s.cadr(bind);
    }, bindings);
}
function makeBindings(bindings) {
    return bindings;
}
function makeLet(bindings, body) {
    return s.arrayToList([s.letSymbol, bindings, body]);
}

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

function isSelfEvaluating(exp) {
    return (exp.isNumber() || exp.isChar() || exp.isString() || exp.isBoolean());
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
s.assignmentValue = assignmentValue;
s.condClauses = condClauses;
s.clauesPredicate = clauesPredicate;
s.clauseActions = clauseActions;
s.isElseClause = isElseClause;
s.andExps = andExps;
s.orExps = orExps;
s.beginActions = beginActions;
s.makeBegin = makeBegin;
s.letBindings = letBindings;
s.letBody = letBody;
s.letBindingVars = letBindingVars;
s.letBindingVals = letBindingVals;
s.makeBindings = makeBindings;
s.makeLet = makeLet;
s.definitionVar = definitionVar;
s.definitionVal = definitionVal;
s.isSelfEvaluating = isSelfEvaluating;
})(scheme);