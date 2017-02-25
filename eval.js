/*
  包含eval-apply循环
  以及eval过程，evalObjects、evalString等外部接口。
 */
(function(s){
"use strict";

s.debug = false;

s.initEval = function(env) {
    s.addPrimProc(env, "eval", eval_prim, 2);
}

s.apply = apply;

s.evalString = function(str) {
    return s.evalStringWithEnv(str, s.debug ? s.globalEnvironment : s.makeInitedBasicEnv());
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
            valObj = evaluate(exps[i], env);
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
    return evaluate(exp, env.val);
}

//-------------
// evaluations
//-------------
function evaluate(exp, env) {
    if(exp == s.voidValue) {
        return exp;
    }
    else if(isSelfEvaluating(exp)) {
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
            else if(first == s.doSymbol) {
                return evaluate(doToCombination(exp), env);
            }
        }
        return apply(evaluate(s.operator(exp), env), listOfValues(s.operands(exp), env));
    }
    else
        s.makeError('eval', "unknown expression type");
}

// 过程(函数)调用
function apply(procedure, argv) {
    if(s.error)
        throw s.error;

    if(procedure.isPrimProc()) {
        return applyPrimitiveProcedure(procedure, argv);
    }
    else if(procedure.isCompProc()) {
        var ok = matchArity(procedure, argv);
        if(ok) {
            //将形式参数约束于对应到实际参数
            var map = {};
            var paramters = procedure.val.getParamters();
            var arity = procedure.val.getArity();
            var argvList = s.arrayToList(argv);
            if(arity.length == 1) {     // 0个或固定数量参数
                for(var index = 0; index < paramters.length; index++)
                    map[paramters[index].val] = argv[index];
            }
            else if(arity[0] > 0 && arity[1] == -1) {   // n或更多个参数
                var index;
                for(index = 0; index < paramters.length - 1; index++)
                    map[paramters[index].val] = argv[index];
                map[paramters[index].val] = s.arrayToList(argv.slice(index));
            }
            else if(arity[0] == 0) {    // n个参数
                map[paramters[0].val] = argvList;
            }
            //参考JS的arguments特性
            map["arguments"] = argvList;
            map["callee"] = procedure;
            
            //构造一个新环境,将创建该过程时的环境作为外围环境
            var newEnv = s.extendEnv(map, procedure.val.getEnv());
            //在这个新环境上下文中求值过程体
            var lastValue = evalSequence(procedure.val.getBody(), newEnv);
            return lastValue;
        }
    }
    else
        s.applicationError(procedure);
}

function applyPrimitiveProcedure(proc, argv) {
    var ok = matchArity(proc, argv);
    if(ok)
        return proc.val.getFunc()(argv);
}

function isSelfEvaluating(exp) {
    return (exp.isNumber() || exp.isChar() || exp.isString() || exp.isBoolean());
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
    s.setVariableValue(s.assignmentVar(exp), evaluate(s.assignmentVal(exp), env), env);
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
    //计算参数数量
    var formals = s.lambdaParamters(exp);
    var paramters = [];//参数数组
    var minArgs, maxArgs;
    if(formals.isPair()) {
        var isList = false;
        var listLen = 0;
        for(var obj = formals; !isList && obj.isPair(); obj = s.cdr(obj)) {
            listLen++;
            paramters.push(s.car(obj));
            if(s.car(obj).isEmptyList())
                isList = true;
        }
        if(!obj.isEmptyList())
            paramters.push(obj);
        else
            isList = obj.isEmptyList();
        if(isList) {
            minArgs = listLen;
            maxArgs = undefined;
        } else {
            minArgs = listLen;
            maxArgs = -1;
        }
    }
    else if(formals.isSymbol()) {
        paramters.push(formals);
        minArgs = 0;
        maxArgs = -1;
    }
    else if(formals.isEmptyList()) {
        minArgs = 0;
        maxArgs = undefined;
    }
    else {
        s.makeError('','not an identifier');
    }
    //做一个过程
    return s.makeCompoundProcedure("", paramters, s.lambdaBody(exp), env, minArgs, maxArgs);
}

function evalSequence(exps, env) {
    var lastValue = s.voidValue;
    for(; !exps.isEmptyList(); exps = s.cdr(exps))
        lastValue = evaluate(s.car(exps), env);
    return lastValue;
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
    if(exps.isEmptyList())
        return s.True;

    var tempVar = s.genSymbol();
    return expandExps(exps);
    function expandExps(exps) {
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
    if(exps.isEmptyList())
        return s.False;
    
    var tempVar = s.genSymbol();
    return expandExps(exps);
    function expandExps(exps) {
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
    return s.makeApplication(
        s.makeLambda(s.letBindingVars(bindings), s.letBody(exp)),
        s.letBindingInits(bindings));
}

function doToCombination(exp) {
    /*
    (define-syntax do
      (syntax-rules ()
        ((do ((variable1 init1 step1) ...)
             (test expression ...)
             command ...)
         ((lambda ()
           (define (iter variable1 ...)
             (if test
                 (begin expression ...)
                 (begin command ...
                        (iter step1 ...))))
           (iter init1 ...))))))
    */
    var bindings = s.doBindings(exp);
    var iterProcVar = s.genSymbol();
    var ifAlter = s.sequenceExp(
        s.append(s.doCommands(exp),
            s.cons(s.makeApplication(iterProcVar, s.doBindingSteps(bindings)), s.nil)));
    var iterProcBody = s.cons(
        s.makeIf(s.doTest(exp),
            s.sequenceExp(s.doExpressions(exp)), ifAlter), s.nil);
    var letBody = s.arrayToList([
        s.makeDefinition(iterProcVar, s.makeLambda(s.doBindingVars(bindings), iterProcBody)),
        s.makeApplication(iterProcVar, s.doBindingInits(bindings))]);
    return s.makeApplication(s.makeLambda(s.nil, letBody), s.nil);
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