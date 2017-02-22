/*
  包含eval-apply循环
  以及eval过程，evalObjects、evalString等外部接口。
 */
(function(s){
"use strict";

s.initEval = function(env) {
    s.addPrimProc(env, "eval", eval_prim, 2);
}

s.eval = evaluate;
s.apply = apply;

s.evalString = function(str) {
    return s.evalStringWithEnv(str, s.makeInitedBasicEnv());
}

s.evalStringWithEnv = function(str, env) {
    scheme.restError();
    var exps;
    try {
        exps = scheme.readMutil(str);
    } catch(e) {
        if(e instanceof scheme.Error)
            scheme.outputError();
        console.error(e);
    }
    env = env || s.makeInitedBasicEnv();
    return s.evalObjects(exps, env);
}

s.evalObjects = function(exps, env) {
    scheme.restError();
    var valObj;
    try {
        for(var i = 0; i < exps.length; i++) {
            valObj = scheme.eval(exps[i], env);
            scheme.outputValue(valObj);
        }
    } catch(e) {
        if(e instanceof scheme.Error)
            scheme.outputError();
        console.error(e);
    }
    return valObj;//last value
}

function eval_prim(argv) {
    var exp = argv[0];
    var env = argv[1];
    if(!env.isNamespace())
        return s.wrongContract("meval", "namespace?", 0, argv);
    return s.eval(exp, env.val);
}

//-------------
// evaluations
//-------------
function evaluate(exp, env) {
    if(exp == s.voidValue)
        return exp;
    
    if(s.isSelfEvaluating(exp)) {
        return exp;
    }

    else if(exp.isSymbol()) {
        return s.lookupVariableValue(exp, env);
    }

    else if(s.isList(exp) && !exp.isEmptyList()) {
        var first = s.car(exp);
        if(first.isSymbol()) {
            if(first == s.quoteSymbol) {
                return evalQuotation(exp);
            }
            else if(first == s.assignmentSymbol) {
                return evalAssignment(exp, env);
            }
            else if(first == s.defineSymbol) {
                return evalDefinition(exp, env);
            }
            else if(first == s.ifSymbol) {
                return evalIf(exp, env);
            }
            else if(first == s.lambdaSymbol) {
                return evalLambda(exp, env);
            }
            else if(first == s.beginSymbol) {
                return evalSequence(s.beginActions(exp), env);
            }
            else if(first == s.condSymbol) {
                return evaluate(condToIf(exp), env);
            }
            else if(first == s.andSymbol) {
                return evaluate(andToIf(exp), env);
            }
            else if(first == s.orSymbol) {
                return evaluate(orToIf(exp), env);
            }
            else if(first == s.letSymbol) {
                return evaluate(letToCombination(exp), env);
            }
        }
        return apply(evaluate(s.operator(exp), env), listOfValues(s.operands(exp), env));
    }
    else
        s.makeError('eval', "unknown expression type");
}

// eval application
function apply(procedure, argv) {
    if(s.error)
        throw s.error;

    if(procedure.isPrimProc()) {
        return applyPrimitiveProcedure(procedure, argv);
    }
    else if(procedure.isCompProc()) {
        var ok = checkCompoundProcedureArguments(procedure, argv);
        if(ok) {
            var map = {};
            var variables = procedure.val.getParamters();
            if(s.isList(variables)) { // 固定数量参数
                variables = s.listToArray(variables);
                for(var index = 0; index < variables.length; index++)
                    map[variables[index].val] = argv[index];
            }
            else if(variables.isPair()) { // n或更多个参数
                variables = s.pairToArray(variables);
                var index;
                for(index = 0; index < variables.length - 1; index++)
                    map[variables[index].val] = argv[index];
                var restArgv = s.arrayToList(argv.slice(index));
                map[variables[index].val] = restArgv;
            }
            else if(variables.isSymbol()) { // n个参数
                map[variables.val] = s.arrayToList(argv);
            }
            
            var newEnv = s.extendEnv(map, procedure.val.getEnv());
            return evalSequence(procedure.val.getBody(), newEnv);
        }
    }
    else
        s.makeError('application', "expected a procedure that can be applied to arguments");
}

function applyPrimitiveProcedure(proc, argv) {
    var ok = checkPimitiveProcedureArguments(proc, argv);
    if(ok)
        return proc.val.getFunc()(argv);
}

function listOfValues(operands, env) {
    var values = [];
    while(!operands.isEmptyList()) {
        values.push(evaluate(s.car(operands), env));
        operands = s.cdr(operands);
    }
    return values;
}

function evalQuotation(exp) {
    return s.cadr(exp);
}

function evalAssignment(exp, env) {
    s.setVariableValue(s.assignmentVar(exp), evaluate(s.assignmentValue(exp), env), env);
    return s.ok;
}

function evalDefinition(exp, env) {
    var variable = s.definitionVar(exp);
    var value = evaluate(s.definitionVal(exp), env);
    if(value.isCompProc())
        value.val.setName(variable.val);
    s.defineVariable(variable, value, env);
    return s.ok;
}

function evalIf(exp, env) {
    if(s.isTrue(evaluate(s.ifPredicate(exp), env)))
        return evaluate(s.ifConsequent(exp), env);
    else {
        var alt = s.ifAlternative(exp);
        if(alt.isEmptyList()) {
            return s.voidValue;
        } else {
            return evaluate(alt, env);
        }
    }
}

function evalLambda(exp, env) {
    var formals = s.lambdaParamters(exp);
    var minArgs, maxArgs;
    if(s.isList(formals)) {
        minArgs = s.listLength(formals);
    }
    else if(formals.isPair()) {
        minArgs = s.pairsLength(formals);
        maxArgs = -1;
    }
    else if(formals.isSymbol()) {
        minArgs = 0;
        maxArgs = -1;
    }
    else {
        s.makeError('','not an identifier');
    }
    return s.makeCompoundProcedure("", formals, s.lambdaBody(exp), env, minArgs, maxArgs);
}

function evalSequence(exps, env) {
    var values = [];
    while(!exps.isEmptyList()) {
        values.push( evaluate(s.car(exps), env) );
        exps = s.cdr(exps);
    }
    return values[values.length - 1];
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
                s.makeError('badSyntax', "'else' clause must be last");
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

function andToIf(exp, env) {
    var exps = s.andExps(exp);
    return exps.isEmptyList() ? s.True : expandExps(exps);
    var gensym = s.genSymbol();
    function expandExps(exps) {
        var tempVar = s.makeSymbol(gensym);
        var predicate = s.makeApplication(s.makeSymbol("not"), s.cons(tempVar, s.nil));
        var rest = s.cdr(exps);
        return s.makeLet(
            s.makeBindings(s.arrayToList( [s.arrayToList( [tempVar, s.car(exps)] ) ])),
            s.makeIf(predicate, tempVar,
                (rest.isEmptyList() ? tempVar : expandExps(rest))));
    }
}

function orToIf(exp, env) {
    var exps = s.orExps(exp);
    return exps.isEmptyList() ? s.False : expandExps(exps);
    var gensym = s.genSymbol();
    function expandExps(exps) {
        var tempVar = s.makeSymbol(gensym);
        var predicate = tempVar;
        var rest = s.cdr(exps);
        return s.makeLet(
            s.makeBindings(s.arrayToList( [s.arrayToList( [tempVar, s.car(exps)] ) ])),
            s.makeIf(predicate, tempVar,
                (rest.isEmptyList() ? s.False : expandExps(rest))));
    }
}

function letToCombination(exp) {
    var bindings = s.letBindings(exp);
    return s.makeApplication(s.makeLambda(s.letBindingVars(bindings), s.letBody(exp)), s.letBindingVals(bindings));
}

function checkPimitiveProcedureArguments(procedure, argv) {
    return matchArity(procedure, argv);
}

function checkCompoundProcedureArguments(procedure, argv) {
    return matchArity(procedure, argv);
}

function matchArity(procedure, argv) {
    var arity = procedure.val.getArity();
    var min = arity[0];
    var mismatch = false;
    var isAtleast = false;
    var expected = "";
    if(arity.length == 1) {
        if(argv.length != min)
            mismatch = true;
        expected = min;
    }
    else if(arity.length == 2) {
        var max;
        if(arity[1] != -1) {
            max = arity[1];
            expected = min + " to " + max;
        } else {
            max = 0x3FFFFFFE;
            expected = min;
            isAtleast = true;
        }
        if(!(min <= argv.length && argv.length <= max))
            mismatch = true;
    }
    if(mismatch) 
        s.arityMismatchError(procedure.val.getName(), argv, isAtleast, expected, argv.length);
    return !mismatch;
}

})(scheme);