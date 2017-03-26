/*
  包含eval-apply循环
  以及eval过程，evalObjects、evalString等外部接口。
 */
(function(s){
"use strict";

s.initEval = function(env) {
    s.addPrimProc(env, "eval", eval_prim, 2);
}

s.apply = apply;


s.evalString = function(str) {
    return s.evalStringWithEnv(str, s.globalEnv);
}

s.evalStringWithNewEnv = function(str) {
    return s.evalStringWithEnv(str, s.makeGlobalEnv());
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
        return s.lookup(exp, env);
    }
    else if(exp.isPair()) {
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
            else if(first == s.letSymbol) return evaluate(s.letToCombination(exp), env);
            else if(first == s.condSymbol) return evaluate(s.transformCond(exp), env);
            else if(first == s.caseSymbol) return evaluate(s.transformCase(exp), env);
            else if(first == s.andSymbol) return evaluate(s.transformAnd(exp), env);
            else if(first == s.orSymbol) return evaluate(s.transformOr(exp), env);
            else if(first == s.whenSymbol) return evaluate(s.transformWhen(exp), env);
            else if(first == s.unlessSymbol) return evaluate(s.transformUnless(exp), env);
            else if(first == s.doSymbol) return evaluate(s.transformDo(exp), env);
            else if(first == s.whileSymbol) return evaluate(s.transformWhile(exp), env);
            else if(first == s.forSymbol) return evaluate(s.transformFor(exp), env);
        }
        return apply(evaluate(s.operator(exp), env), listOfValues(s.operands(exp), env), env);
    }
    else
        return s.throwError('eval', "unknown expression type");
}

// 过程(函数)调用
function apply(procedure, argv, env) {
    if(s.error)
        throw s.error;

    if(procedure.isPrimProc()) {
        var ok = matchArity(procedure, argv);
        if(ok) {
            return procedure.val.getFunc()(argv);
        }
    }
    else if(procedure.isCompProc()) {
        var ok = matchArity(procedure, argv);
        if(ok) {
            //将形式参数约束于对应到实际参数
            var bindings = {};
            var paramters = procedure.val.getParamters();
            var arity = procedure.val.getArity();
            var argvList = s.arrayToList(argv);
            if(arity.length == 1) {     // 0个或固定数量参数
                for(var index = 0; index < paramters.length; index++)
                    bindings[paramters[index].val] = argv[index];
            }
            else if(arity[0] > 0 && arity[1] == -1) {   // n或更多个参数
                var index;
                for(index = 0; index < paramters.length - 1; index++)
                    bindings[paramters[index].val] = argv[index];
                bindings[paramters[index].val] = s.arrayToList(argv.slice(index));
            }
            else if(arity[0] == 0) {    // n个参数
                bindings[paramters[0].val] = argvList;
            }
            //参考JS的arguments特性
            bindings["arguments"] = argvList;
            bindings["callee"] = procedure;
            
            //构造一个新环境,将创建该过程时的环境作为外围环境
            var newEnv = s.extendEnv(bindings, procedure.val.getEnv());
            //在这个新环境上下文中求值过程体
            var lastValue = evalSequence(procedure.val.getBody(), newEnv);
            return lastValue;
        }
    }
    else
        s.applicationError(procedure);
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
    return s.quoteObject(exp);
}

function evalAssignment(exp, env) {
    s.setVariableValue(s.assignmentVar(exp), evaluate(s.assignmentVal(exp), env), env);
    return s.voidValue;
}

function evalDefinition(exp, env) {
    var variable = s.definitionVar(exp);
    if(!variable.isSymbol())
        return s.throwError('define', "not an identifier: " + s.writeToString(variable));
    var value = evaluate(s.definitionVal(exp), env);
    if(value.isCompProc())
        value.val.setName(s.symbolVal(variable));
    s.defineVariable(variable, value, env);
    return s.voidValue;
}

function evalIf(exp, env) {
    if(s.isTrue(evaluate(s.ifPredicate(exp), env)))
        return evaluate(s.ifConsequent(exp), env);
    else {
        var alt = s.ifAlternative(exp);
        if(alt.isEmptyList())
            return s.voidValue;
        else
            return evaluate(alt, env);
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
        return s.throwError('','not an identifier');
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
