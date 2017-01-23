(function(scm){
for(var variable in scm)
	eval("var " + variable + "=scm." + variable);

function elemAt(list, index) {
	for(var i = 0; i < index; i++)
		list = cdr(list);
	return car(list);
}

function mapList(func, list) {
	if(list.isEmptyList())
		return nil;
	else
		return cons(func(car(list)), mapList(func, cdr(list)));
}
function listLength(list) {
	if(list.isEmptyList())
		return 0;
	else
		return 1 + listLength(cdr(list));
}

scm.globalEnvironment = null;
var error = null;
function EnvironmentFrame(map, baseEnv) {
	this.map = map;
	this.baseEnv = baseEnv;
}

setupEnvironment();
scm.evaluate = evaluate;
scm.apply = apply;

hasFormError = function() {
	return error != null;
};

scm.eval = function(forms) {
	error = null;
	var exps = this.parse(forms);
	//console.log('parse result:');
	//console.log(exps);
	if(exps.constructor == String)
		scm.console.value += exps;
	var values = [];
	for(var i = 0; i < exps.length; i++) {
		var obj = evaluate(exps[i], scm.globalEnvironment);
		//console.log(obj);
		if(error) {
			printError();
		}
		else
			printValue(obj);
	}
}

function printValue(obj) {
	var val = printObj(obj);
	if(val != undefined && val != null)
		scm.console.value += val + "\n";
}

function printObjs(objs) {
	var values = [];
	objs.forEach(function(obj){
		var val = printObj(obj);
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
function ifPredicate(exp) { return cadr(exp); }
function ifConsequent(exp) { return caddr(exp); }
function ifAlternative(exp) {
	exp = cdddr(exp);
	if(exp.isEmptyList())
		return exp;
	else // alternative
		return car(exp);
}
function makeIf(predicate, consequent, alternative) {
	return arrayToList([ifSymbol, predicate, consequent, alternative]);
}

/*
  lambda
  (lambda (<formal-parameters>) <body>)
*/
function lambdaParamters(exp) { return cadr(exp); }
function lambdaBody(exp) { return cddr(exp); }
function makeLambda(parameters, body) {
	return cons(lambdaSymbol, cons(parameters, body));
}
// application
function operator(exp) { return car(exp); }
function operands(exp) { return cdr(exp); }
function makeApplication(operator, operands) {
	return cons(operator, operands);
}
/*
  assignment
  (set! <var> <exp>)
*/
function assignmentVar(exp) { return cadr(exp); }
function assignmentValue(exp) { return caddr(exp); }
/*
  cond
  (cond (<p1> <e1>)
        (<p2> <e2>)
		..
		(else <e>))
*/
function condClauses(exp) { return cdr(exp); }
function clauesPredicate(clause) { return car(clause); }
function clauseActions(clause) { return cdr(clause); }
function isElseClause(clause) { return clauesPredicate(clause) == elseSymbol; }
/*
  begin
  (begin ...)
*/
function beginActions(exp) {
	return cdr(exp);
}
function makeBegin(seq) {
	return cons(beginSymbol, seq);
}
/*
  let
  (let ((<var1> <exp1>)
        (<var2> <exp2>)
		...)
		<body>)
*/
function letBindings(exp) { return cadr(exp); }
function letBody(exp) { return cddr(exp); }
function letBindingVars(bindings) {
	return mapList(function(bind){
		return car(bind);
	}, bindings);
}
function letBindingVals(bindings) {
	return mapList(function(bind){
		return cadr(bind);
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
	if(cadr(exp).isSymbol())
		return cadr(exp);
	else
		return caadr(exp);
}
function definitionVal(exp) {
    if(cadr(exp).isSymbol())
        return caddr(exp);
    else {
        var formals = cdadr(exp);
        var body = cddr(exp);
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
	if(error)
		return error;
	if(exp == voidValue)
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
		var obj = car(exp);
		if(obj.isSymbol()) {
			if(obj == quoteSymbol) {// (quote ...)
				return evalQuotation(exp);
			}
			else if(obj == assignmentSymbol) {// (set! ...) 
				return evalAssignment(exp, env);
			}
			else if(obj == defineSymbol) {// (define ...)
				return evalDefinition(exp, env);
			}
			else if(obj == ifSymbol) {// (if ...)
				return evalIf(exp, env);
			}
			else if(obj == lambdaSymbol) { // (lambda ...) 
				return ScmObject.makeCompProc(lambdaParamters(exp), lambdaBody(exp), env, "");
			}
			else if(obj == beginSymbol) {// (begin ...)
				return evalSequence(beginActions(exp), env);
			}
			else if(obj == condSymbol) { // (cond ...)
				return evaluate(condToIf(exp), env);
			}
			else if(obj == letSymbol) { // (let ...)
				return evaluate(letToCombination(exp), env);
			}
		}
		// 其它过程应用
    /*过程应用表达式的运算符部分可以是过程名，也可以是一个lambda或表达式，因此要求值*/
		return apply(evaluate(operator(exp), env), listOfValues(operands(exp), env));
	}
	else
		makeError('exp', "eval:不支持的表达式类型");
}

/*
将过程应用于实参
*/
function apply(procedure, arguments) {
	if(error)
		return error;
	if(procedure == undefined)
		return;
	if(procedure.isPrimProc()) {
		return applyPrimitiveProcedure(procedure, arguments);
	}
  //复合过程
	else if(procedure.isCompProc()) {
		var result = checkCompoundProcedureArguments(procedure, arguments);
		if(result === true) {
			return evalSequence(compProcBody(procedure),
				extendEnvironment(compProcParamters(procedure), arguments, compProcEnv(procedure)));
		}
	}
	else
		makeError('', "application: expected a procedure that can be applied to arguments");
}

function evalQuotation(exp) {
	return cadr(exp);
}
function evalAssignment(exp, env) {
	setVariableValue(assignmentVar(exp), evaluate(assignmentValue(exp), env), env);
	return ok;
}
function evalDefinition(exp, env) {
	var variable = definitionVar(exp);
	var valueExp = definitionVal(exp);
	var value;
	if(car(valueExp) == lambdaSymbol) {
		value = ScmObject.makeCompProc(lambdaParamters(valueExp), lambdaBody(valueExp), env, variable.data);
	}
	else
		value = evaluate(valueExp, env);
	defineVariable(variable, value, env);
	return ok;
}
function listOfValues(operands, env) {
	var values = mapList(function(exp){
		return evaluate(exp, env);
	}, operands);
	return values;
}
function evalIf(exp, env) {
	if(isTrue(evaluate(ifPredicate(exp), env)))
		return evaluate(ifConsequent(exp), env);
	else {
		var alt = ifAlternative(exp);
		if(alt.isEmptyList()) {
			return voidValue;
		} else {
			return evaluate(alt, env);
		}
	}
}
function evalSequence(exps, env) {
	var values = [];
	listToArray(exps).forEach(function(exp){
		values.push( evaluate(exp, env) );
	});
	return values[values.length - 1];
}
function condToIf(exp) {
	return expandClauses(condClauses(exp));
	
	function expandClauses(clauses) {
		if(clauses.isEmptyList())
			return ScmObject.getBoolean(false);
		var first = car(clauses);
		var rest = cdr(clauses);
		if(isElseClause(first))
			if(rest.isEmptyList())
				return sequenceExp(clauseActions(first));
			else
				makeError('badSyntax', "'else' clause must be last");
		else {
			var predicate = clauesPredicate(first);
			var actionSequence= sequenceExp(clauseActions(first));
			if(actionSequence.isEmptyList())
				return makeIf(True, predicate, expandClauses(rest));
			else
				return makeIf(predicate, actionSequence, expandClauses(rest));
		}
	}
	function sequenceExp(seq) {
		if(seq.isEmptyList()) return seq;
		else if(cdr(seq).isEmptyList()) return car(seq);
		return makeBegin(seq);
	}
}

function applyPrimitiveProcedure(primprocedure, arguments) {
	var result = checkPimitiveProcedureArguments(primprocedure, arguments);
	if(result === true) {
		var func = primitiveProcedureFunc(primprocedure);
		return func(arguments);
	}
	else
		return result;
}

function setupEnvironment() {
	var initalEnv = new EnvironmentFrame({}, null);
	scm.primitiveProcedures.map(function(proc){
		defineVariable(ScmObject.makeSymbol(proc[0]), ScmObject.makePrimProc(proc), initalEnv);
	});
	scm.globalEnvironment = initalEnv;
}

function lookupVariableValue(variable, env) {
	var value;
	while(env && (value = env.map[variable.data]) == undefined)
		env = env.baseEnv;
	if(value == undefined)
		makeError('undefined', variable.data);
	return value;
}

function extendEnvironment(variables, values, baseEnv) {
	var map = {};
	variables = listToArray(variables);
	values = listToArray(values);
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
		makeError('undefined', variable.data);
}

function checkPimitiveProcedureArguments(procedure, arguments) {
	var procedureName = primitiveProcedureName(procedure);
	var arity = primitiveProcedureArity(procedure);
	var result = matchArity(procedureName, arguments, arity);
	if(result === true) {
		var contract = primitiveProcedureContract(procedure);
		result = checkContract(procedureName, arguments, contract);
	}
	return result;
}
function checkCompoundProcedureArguments(procedure, arguments) {
	var procedureName = compProcName(procedure);
	var arity = [];
	arity[0] = listLength(compProcParamters(procedure));
	var result = matchArity(procedureName, arguments, arity);
	return result;
}
function matchArity(procedureName, arguments, arity) {
	var expectedAtleast = arity[0];
	var mismatch = false;
	var argumentsLen = listLength(arguments);
	if(arity.length == 1) {
		if(argumentsLen != expectedAtleast)
			mismatch = true;
	}
	else if(arity.length == 2) {
		var max = arity[1] != null ? arity : 10000;
		if(!(expectedAtleast <= argumentsLen && argumentsLen <= max))
			mismatch = true;
	}
	if(mismatch) 
		makeArityMismatchError(procedureName, arguments, (arity.length != 1), expectedAtleast, argumentsLen);
	else
		return true;
}

function checkContract(procedureName, arguments, contract) {
	arguments = listToArray(arguments);
	if(contract.length > 0) {
		var pos;
		if(contract.length == 1) {
			for(pos = 0; pos < arguments.length; pos++) {
				if(isFalse(contractFuncMap[contract[0]](cons(arguments[pos], nil))))
					break;
			}
		}
		else  {
			for(pos = 0; pos < arguments.length; pos++) {
				if(contract[pos] != null && isFalse(contractFuncMap[contract[pos]](cons(arguments[pos], nil))))
					break;
			}
		}
		if(pos < arguments.length) {
			makeContractViolationError(procedureName, arguments, contract[pos], arguments[pos], (pos + 1));
		}
	}
	return true;
}

function makeArityMismatchError(procedureName, arguments, isAtleast, expected, given) {
	makeError('arityMismatch', procedureName, arguments, isAtleast, expected, given);
}
function makeContractViolationError(procedureName, arguments, expected, given, argPosition) {
	makeError('contractViolation', procedureName, arguments, expected, given, argPosition);
}
function makeError() {
	error = [].slice.call(arguments, 0);
}

function printError() {
	var errorType = error[0];
	switch(errorType) {
	case 'arityMismatch':
		var procedureName = error[1];
		var arguments = error[2];
		var isAtleast = error[3];
		var expected = error[4];
		var given = error[5];
		var info = procedureName + ': ' + 'arity mismatch;';
		info += "\n  the expected number of arguments does not match the given number";
		info += "\n   expected: " + (isAtleast ? 'at least ' : '') + expected;
		info += "\n   given: " + given;
		if(arguments.length > 0)
			info += "\n   arguments: \n\t" + printObjs(arguments);
		break;
	case 'contractViolation':
		var procedureName = error[1];
		var arguments = error[2];
		var expected = error[3];
		var given = error[4];
		var argPosition = error[5];
		var info = procedureName + ': ' + 'contract violation;';
		info += "\n  expected: " + expected;
		info += "\n  given: " + printObj(given);
		info += "\n  argument position: " + argPosition + "st";
		info += "\n  arguments: \n\t" + printObjs(arguments);
		break;
	case 'undefined':
		var id = error[1];
		var info = id + ": undefined;";
		info += "\n cannot reference undefined identifier";
		break;
	default:
		info = error[1];
	}
	scm.console.value += info + "\n";
}

})(scheme);