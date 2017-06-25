/*
  包含eval-apply循环
  以及eval过程，evalObjects、evalString等外部接口。
 */
(function(scheme){
"use strict";

scheme.initEval = function(env) {
    scheme.addPrimProc(env, "eval", eval_prim, 2);
}

scheme.apply = apply;


scheme.evalString = function(str) {
    return scheme.evalStringWithEnv(str, scheme.globalEnv);
}

scheme.evalStringWithNewEnv = function(str) {
    return scheme.evalStringWithEnv(str, scheme.makeGlobalEnv());
}

scheme.evalStringWithEnv = function(str, env) {
    scheme.restError();
    var exps;
    try {
        exps = scheme.readMutil(str);
    } catch(e) {
        if(e instanceof scheme.Error)
            scheme.outputError();
        console.error(e);
    }
    return scheme.evalObjects(exps, env);
}

scheme.evalObjects = function(exps, env) {
    scheme.restError();
    var valObj;
    try {
        for(var idx = 0; idx < exps.length; idx++) {
            valObj = evaluate(exps[idx], env);
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
    if(!scheme.isNamespace(env))
        return scheme.wrongContract("meval", "namespace?", 0, argv);
    return evaluate(exp, env.val);
}

//-------------
// evaluations
//-------------
function evaluate(exp, env) {
    while(true) {
        if(scheme.error)
            throw scheme.error;

        if(exp == scheme.voidValue)
            return exp;

        // 根据表达式类型分派动作
        switch(exp.type) {
            case scheme_integer_type:
            case scheme_double_type:
            case scheme_char_type:
            case scheme_char_string_type:
            case scheme_bool_type:
                // self evaluating
                return exp;
    
            case scheme_symbol_type:
                // 是符号，查询在环境中关联的值
                return scheme.lookup(exp, env);

            case scheme_pair_type:
                // TODO: 是序对，但有可能不是列表
                var operator = scheme.operator(exp);
                // 如果运算符为符号，可能是语法关键字
                if(scheme.isSymbol(operator)) {
                    switch(operator) {
                        case scheme.quoteSymbol:
                            // eval quotation
                            return scheme.quoteObject(exp);
                        case scheme.assignmentSymbol:
                            return evalAssignment(exp, env);
                        case scheme.defineSymbol:
                            return evalDefinition(exp, env);
                        case scheme.ifSymbol:
                            /// 求值if表达式
                            var optionalAlt;
                            // 首先求值谓词表达式
                            // 然后继续判断谓词的值：如果为真，返回后件，否则返回前件
                            exp = scheme.isTrue(evaluate(scheme.ifPredicate(exp), env)) ?
                                scheme.ifConsequent(exp) : (optionalAlt = scheme.ifAlternative(exp),
                                                            scheme.isEmptyList(optionalAlt) ? scheme.voidValue : optionalAlt);
                            // 在if中处于尾上下文，继续求值尾上下文中的表达式
                            continue;
                        case scheme.lambdaSymbol:
                            return evalLambda(exp, env);
                        case scheme.beginSymbol:
                            // 求值顺序表达式/序列
                            var exps = scheme.beginActions(exp);
                            if(!scheme.isEmptyList(exps)) {
                                // 顺序求值尾部前面的表达式
                                for(; ! scheme.isEmptyList( scheme.cdr(exps) ); exps = scheme.cdr(exps) )
                                    evaluate(scheme.car(exps), env);
                                // 获取尾上下文中的表达式
                                exp = scheme.car(exps); // last exp
                                // 继续
                                continue;
                            } else {
                                return scheme.voidValue;
                            }
                        case scheme.letSymbol:
                            // let在语法上变换到lambda
                            exp = scheme.letToCombination(exp);
                            // 继续
                            continue;
                        case scheme.condSymbol:
                            exp = scheme.condToIf(exp);
                            continue;
                        case scheme.caseSymbol:
                            exp = scheme.caseToCond(exp);
                            continue;
                        case scheme.andSymbol:
                            exp = scheme.andToIf(exp);
                            continue;
                        case scheme.orSymbol:
                            exp = scheme.orToIf(exp);
                            continue;
                        case scheme.whenSymbol:
                            exp = scheme.whenToIf(exp);
                            continue;
                        case scheme.unlessSymbol:
                            exp = scheme.unlessToIf(exp);
                            continue;
                        case scheme.doSymbol:
                            exp = scheme.transformDo(exp);
                            continue;
                        case scheme.whileSymbol:
                            exp = scheme.transformWhile(exp);
                            continue;
                        case scheme.forSymbol:
                            exp = scheme.transformFor(exp);
                            continue;
                    }
                }
                /// 另外，是符号但不是语法关键字，或者不是符号，就是过程应用表达式：
                // 首先求值运算符，得到过程对象
                var procedure = evaluate(operator, env);
                // 然后求值运算数，得到实际参数
                var argv = arrayOfValues(scheme.operands(exp), env);
                // 如果是基本过程
                if(scheme.isPrim(procedure)) {
                    return applyPrimitiveProcedure(procedure, argv);
                }
                // 如果是复合过程
                else if(scheme.isComp(procedure)) {
                    // 检查实参个数是否匹配形参个数
                    var ok = matchArity(procedure, argv);
                    if(ok) {
                        // 将过程体转换为begin类型表达式
                        exp = scheme.makeBegin(procedure.val.getBody());
                        // 构造一个用于执行过程应用的新环境
                        env = makeProcedureApplyEnv(procedure, argv);
                    } 
                    // 继续, 在这个新环境上下文中求值过程体。注意这里没有去递归调用evaluate，上同
                    continue;
                } else {
                    scheme.applicationError(procedure);
                    break;
                }
            default:
                return scheme.throwError('eval', "unknown expression type");
        }
    }
}

// 应用:求值过程调用
function apply(procedure, argv) {
    if(scheme.isPrim(procedure)) {
        return applyPrimitiveProcedure(procedure, argv);
    } else if(scheme.isComp(procedure)) {
        var ok = matchArity(procedure, argv);
        if(ok) {
            return evaluate(scheme.makeBegin(procedure.val.getBody()), makeProcedureApplyEnv(procedure, argv));
        }
    } else {
        scheme.applicationError(procedure);
    }
}

function makeProcedureApplyEnv(procedure, argv) {
    //将形式参数约束于对应到实际参数
    var bindings = {};
    var paramters = procedure.val.getParamters();
    var arity = procedure.val.getArity();
    var argvList = scheme.arrayToList(argv);
    if(arity.length == 1) {     // 0个或固定数量参数
        for(var index = 0; index < paramters.length; index++)
            bindings[paramters[index].val] = argv[index];
    } else if(arity[0] > 0 && arity[1] == -1) {   // n或更多个参数
        var index;
        for(index = 0; index < paramters.length - 1; index++)
            bindings[paramters[index].val] = argv[index];
        bindings[paramters[index].val] = scheme.arrayToList(argv.slice(index));
    } else if(arity[0] == 0) {    // n个参数
        bindings[paramters[0].val] = argvList;
    }
    //参考JS的arguments特性
    bindings["arguments"] = argvList;
    bindings["callee"] = procedure;
    
    //构造一个新环境,将创建该过程时的环境作为外围环境
    return scheme.extendEnv(bindings, procedure.val.getEnv());
}

function applyPrimitiveProcedure(procedure, argv) {
    var ok = matchArity(procedure, argv);
    if(ok) {
        return procedure.val.getFunc()(argv);
    }
}

function arrayOfValues(operands, env) {
    var values = [];
    while(!scheme.isEmptyList(operands)) {
        values.push(evaluate(scheme.car(operands), env));
        operands = scheme.cdr(operands);
    }
    return values;
}

function evalAssignment(exp, env) {
    scheme.set(scheme.assignmentVar(exp), evaluate(scheme.assignmentVal(exp), env), env);
    return scheme.voidValue;
}

function evalDefinition(exp, env) {
    var variable = scheme.definitionVar(exp);
    if(!scheme.isSymbol(variable))
        return scheme.throwError('define', "not an identifier: " + scheme.writeToString(variable));
    var value = evaluate(scheme.definitionVal(exp), env);
    if(scheme.isComp(value))
        value.val.setName(scheme.symbolVal(variable));
    scheme.define(variable, value, env);
    return scheme.voidValue;
}

function evalLambda(exp, env) {
    //计算参数数量
    var formals = scheme.lambdaParamters(exp);
    var paramters = [];//参数数组
    var minArgs, maxArgs;
    if(scheme.isPair(formals)) {
        var isList = false;
        var listLen = 0;
        for(var obj = formals; !isList && scheme.isPair(obj); obj = scheme.cdr(obj)) {
            listLen++;
            paramters.push(scheme.car(obj));
            if(scheme.isEmptyList(scheme.car(obj)))
                isList = true;
        }
        if(!scheme.isEmptyList(obj))
            paramters.push(obj);
        else
            isList = scheme.isEmptyList(obj);
        if(isList) {
            minArgs = listLen;
            maxArgs = undefined;
        } else {
            minArgs = listLen;
            maxArgs = -1;
        }
    }
    else if(scheme.isSymbol(formals)) {
        paramters.push(formals);
        minArgs = 0;
        maxArgs = -1;
    }
    else if(scheme.isEmptyList(formals)) {
        minArgs = 0;
        maxArgs = undefined;
    }
    else {
        return scheme.throwError('','not an identifier');
    }
    //做一个过程
    return scheme.makeCompoundProcedure("", paramters, scheme.lambdaBody(exp), env, minArgs, maxArgs);
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
        scheme.arityMismatchError(procedure.val.getName(), argv, isAtleast, expected, argv.length);
    return !mismatch;
}

})(scheme);
