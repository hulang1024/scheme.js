(function(s){
"use strict";

var ScmObject = s.ScmObject;

function elemAt(list, index) {
	for(var i = 0; i < index; i++)
		list = s.cdr(list);
	return s.car(list);
}

function mapList(func, list) {
	if(list.isEmptyList())
		return s.nil;
	else
		return s.cons(func(s.car(list)), mapList(func, s.cdr(list)));
}
function listLength(list) {
	if(list.isEmptyList())
		return 0;
	else
		return 1 + listLength(s.cdr(list));
}

s.globalEnvironment = new EnvironmentFrame({}, null);
s.error = null;
function EnvironmentFrame(map, baseEnv) {
	this.map = map;
	this.baseEnv = baseEnv;
}

setupEnvironment();
s.evaluate = evaluate;
s.apply = apply;

s.eval = function(forms) {
	s.error = null;//clear error
	var exps = this.parse(forms);
	if(exps.constructor == String) {
		s.console.value += exps;
		return;
	}

	for(var i = 0; i < exps.length; i++) {
		var obj = evaluate(exps[i], s.globalEnvironment);
		//s.console.log(obj);
		if(!s.error)
			printValue(obj);
		else {
			printError();
			break;
		}
	}
}

function printValue(obj) {
	var val = s.printObj(obj);
	if(val != null)
		s.console.value += val + "\n";
}

function printObjs(objs) {
	var values = [];
	objs.forEach(function(obj){
		var val = s.printObj(obj);
		if(val != null)
			values.push(val);
	});
	return values;
}


/*  语法过程  */

function isSelfEvaluating(exp) {
	if(exp.isNumber()) return true;
	else if(exp.isChar()) return true;
	else if(exp.isString()) return true;
	else if(exp.isBoolean()) return true;
	else false;
}
/*
  if
  (if <predicate> <consequent> <alternative>)
*/
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

/*
  lambda
  (lambda (<formal-parameters>) <body>)
*/
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
/*
  assignment
  (set! <var> <exp>)
*/
function assignmentVar(exp) { return s.cadr(exp); }
function assignmentValue(exp) { return s.caddr(exp); }
/*
  cond
  (cond (<p1> <e1>)
        (<p2> <e2>)
		..
		(else <e>))
*/
function condClauses(exp) { return s.cdr(exp); }
function clauesPredicate(clause) { return s.car(clause); }
function clauseActions(clause) { return s.cdr(clause); }
function isElseClause(clause) { return clauesPredicate(clause) == s.elseSymbol; }
/*
  begin
  (begin ...)
*/
function beginActions(exp) {
	return s.cdr(exp);
}
function makeBegin(seq) {
	return s.cons(s.beginSymbol, seq);
}
/*
  let
  (let ((<var1> <exp1>)
        (<var2> <exp2>)
		...)
		<body>)
*/
function letBindings(exp) { return s.cadr(exp); }
function letBody(exp) { return s.cddr(exp); }
function letBindingVars(bindings) {
	return mapList(function(bind){
		return s.car(bind);
	}, bindings);
}
function letBindingVals(bindings) {
	return mapList(function(bind){
		return s.cadr(bind);
	}, bindings);
}
function letToCombination(exp) {
	var bindings = letBindings(exp);
	return makeApplication(makeLambda(letBindingVars(bindings), letBody(exp)), letBindingVals(bindings));
}

/*
 define
 (define <name> <exp>)
 (define (<name> <formal-parameters>) <body>)
*/
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
		// to lambda
        return makeLambda(formals, body);
    }
}

/*
eval-apply为实现语言中 数据和过程的 递归(嵌套)组合手段与抽象手段
@param exp 表达式
@param env 环境，提供约束于表达式的变量与值的集合
*/
function evaluate(exp, env) {
	if(s.error)
		return s.error;
	if(exp == s.voidValue)
		return exp;
	if(isSelfEvaluating(exp)) {
		return exp;
	}
	// 变量
	else if(exp.isSymbol()) {
		return lookupVariableValue(exp, env);
	}
	// 过程应用
	else if(exp.isPair()) {
		// 基本
		var obj = s.car(exp);
		if(obj.isSymbol()) {
			if(obj == s.quoteSymbol) {// (quote ...)
				return evalQuotation(exp);
			}
			else if(obj == s.assignmentSymbol) {// (set! ...) 
				return evalAssignment(exp, env);
			}
			else if(obj == s.defineSymbol) {// (define ...)
				return evalDefinition(exp, env);
			}
			else if(obj == s.ifSymbol) {// (if ...)
				return evalIf(exp, env);
			}
			else if(obj == s.lambdaSymbol) { // (lambda ...) 
				return ScmObject.makeCompProc(lambdaParamters(exp), lambdaBody(exp), env, "");
			}
			else if(obj == s.beginSymbol) {// (begin ...)
				return evalSequence(beginActions(exp), env);
			}
			else if(obj == s.condSymbol) { // (cond ...)
				return evaluate(condToIf(exp), env);
			}
			else if(obj == s.letSymbol) { // (let ...)
				return evaluate(letToCombination(exp), env);
			}
		}
		// 其它过程应用
		/*过程应用表达式的运算符部分可以是过程名，也可以是一个lambda或表达式，因此要求值*/
		return apply(evaluate(operator(exp), env), listOfValues(operands(exp), env));
	}
	else
		s.makeError('exp', "eval:不支持的表达式类型");
}


/*
将过程应用于实参
*/
function apply(procedure, argvs) {
	if(s.error)
		return s.error;

	if(procedure.isPrimProc()) {
		return applyPrimitiveProcedure(procedure, argvs);
	}
	else if(procedure.isCompProc()) {
		var result = checkCompoundProcedureArguments(procedure, argvs);
		if(result) {
			var compEnv = extendEnvironment(s.compProcParamters(procedure), argvs, s.compProcEnv(procedure));
			return evalSequence(s.compProcBody(procedure), compEnv);
		}
	}
	else
		s.makeError('', "application: expected a procedure that can be applied to arguments");
}

function evalQuotation(exp) {
	return s.cadr(exp);
}
function evalAssignment(exp, env) {
	setVariableValue(assignmentVar(exp), evaluate(assignmentValue(exp), env), env);
	return s.ok;
}
function evalDefinition(exp, env) {
	var variable = definitionVar(exp);
	var valueExp = definitionVal(exp);
	var value;
	if(s.car(valueExp) == s.lambdaSymbol) {
		value = ScmObject.makeCompProc(lambdaParamters(valueExp), lambdaBody(valueExp), env, variable.data);
	}
	else
		value = evaluate(valueExp, env);
	defineVariable(variable, value, env);
	return s.ok;
}
function listOfValues(operands, env) {
	var values = mapList(function(exp){
		return evaluate(exp, env);
	}, operands);
	return values;
}
function evalIf(exp, env) {
	if(s.isTrue(evaluate(ifPredicate(exp), env)))
		return evaluate(ifConsequent(exp), env);
	else {
		var alt = ifAlternative(exp);
		if(alt.isEmptyList()) {
			return s.voidValue;
		} else {
			return evaluate(alt, env);
		}
	}
}
function evalSequence(exps, env) {
	var values = [];
	s.listToArray(exps).forEach(function(exp){
		values.push( evaluate(exp, env) );
	});
	return values[values.length - 1];
}
function condToIf(exp) {
	return expandClauses(condClauses(exp));
	
	function expandClauses(clauses) {
		if(clauses.isEmptyList())
			return ScmObject.getBoolean(false);
		var first = s.car(clauses);
		var rest = s.cdr(clauses);
		if(isElseClause(first))
			if(rest.isEmptyList())
				return sequenceExp(clauseActions(first));
			else
				s.makeError('badSyntax', "'else' clause must be last");
		else {
			var predicate = clauesPredicate(first);
			var actionSequence= sequenceExp(clauseActions(first));
			if(actionSequence.isEmptyList())
				return makeIf(s.True, predicate, expandClauses(rest));
			else
				return makeIf(predicate, actionSequence, expandClauses(rest));
		}
	}
	function sequenceExp(seq) {
		if(seq.isEmptyList()) return seq;
		else if(s.cdr(seq).isEmptyList()) return s.car(seq);
		return makeBegin(seq);
	}
}

function applyPrimitiveProcedure(primprocedure, argvs) {
	var result = checkPimitiveProcedureArguments(primprocedure, argvs);
	if(result) {
		var func = s.primProcFunc(primprocedure);
		return func(argvs);
	}
	else
		return result;
}

function setupEnvironment() {
	s.initPrimitiveProcedures(s.globalEnvironment);
}

function lookupVariableValue(variable, env) {
	var value;
	while(env && (value = env.map[variable.data]) == undefined)
		env = env.baseEnv;
	if(value == undefined)
		s.makeError('undefined', variable.data);
	return value;
}

function extendEnvironment(variables, values, baseEnv) {
	var map = {};
	variables = s.listToArray(variables);
	values = s.listToArray(values);
	for(var i = 0; i < variables.length; i++)
		map[variables[i].data] = values[i];
	return new EnvironmentFrame(map, baseEnv);
}
function defineVariable(variable, value, env) {
	var name = variable.data;
	env.map[name] = value;
}
function setVariableValue(variable, value, env) {
	var name = variable.data;
	if(env.map[name])
		env.map[name] = value;
	else
		s.makeError('undefined', name);
}

function checkPimitiveProcedureArguments(procedure, argvs) {
	var procedureName = s.primProcName(procedure);
	var arity = s.primProcArity(procedure);
	return matchArity(procedureName, argvs, arity);
}

function checkCompoundProcedureArguments(procedure, argvs) {
	var procedureName = s.compProcName(procedure);
	var arity = [];
	arity[0] = listLength(s.compProcParamters(procedure));
	var result = matchArity(procedureName, argvs, arity);
	return result;
}

function matchArity(procedureName, argvs, arity) {
	var expectedAtleast = arity[0];
	var mismatch = false;
	var argvsLen = listLength(argvs);
	if(arity.length == 1) {
		if(argvsLen != expectedAtleast)
			mismatch = true;
	}
	else if(arity.length == 2) {
		var max = arity[1] != null ? arity : 10000;
		if(!(expectedAtleast <= argvsLen && argvsLen <= max))
			mismatch = true;
	}
	if(mismatch) {
		s.makeArityMismatchError(procedureName, argvs, (arity.length != 1), expectedAtleast, argvsLen);
		return false;
	}
	else
		return true;
}

function printError() {
	var error = s.error;
	var errorType = error[0];
	switch(errorType) {
	case 'arityMismatch':
		var procedureName = error[1];
		var argvs = error[2];
		var isAtleast = error[3];
		var expected = error[4];
		var given = error[5];
		var info = procedureName + ': ' + 'arity mismatch;';
		info += "\n  the expected number of argvs does not match the given number";
		info += "\n   expected: " + (isAtleast ? 'at least ' : '') + expected;
		info += "\n   given: " + given;
		if(argvs.length > 0)
			info += "\n   argvs: \n\t" + printObjs(argvs);
		break;
	case 'contractViolation':
		var procedureName = error[1];
		var argvs = error[2];
		var expected = error[3];
		var given = error[4];
		var argPosition = error[5];
		var info = procedureName + ': ' + 'contract violation;';
		info += "\n  expected: " + expected;
		info += "\n  given: " + s.printObj(given);
		info += "\n  argument position: " + argPosition + "st";
		info += "\n  argvs: \n\t" + printObjs(argvs);
		break;
	case 'undefined':
		var id = error[1];
		var info = id + ": undefined;";
		info += "\n cannot reference undefined identifier";
		break;
	default:
		info = error[0] + ": " + error[1];
	}
	s.console.value += info + "\n";
}

})(scheme);