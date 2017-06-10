# 如何写一个（Scheme）解释器

## 目标读者

菜鸟。

## 0.熟悉目标实现语言

请找相关Scheme教程 :d，[R5RS.PDF](schem-r5rscn.pdf)

## 1.解释器

&emsp;&emsp;我们要写的解释器，是做解释工作的一种程序，它能够理解代码的意义，并执行所要求的动作。

## 2.熟悉实现所用语言

&emsp;&emsp;在用一种语言实现另一种语言的解释器之前，你应该先熟悉实现所用语言。它就像用中文表达英语世界中的概念，必须先熟悉中文，然后才能选用合适的中文词语，去描述英语中对应的概念。  
如果你熟悉JavaScript（JS），那么至少应该理解对象，函数等等。我这里只介绍JS :)。


## 3.开始词法+语法分析

&emsp;&emsp;当我们看到一段Scheme或者其它语言的文本时，我们会理解它是由不同的单词，并且会以语句，关键字等单位组成的。我们的第一步是语法分析，是从代码文本转换到一种数据结构的过程。
我们会对该解释器输入一段代码例如`(+ 1 2)`，这样的代码之前通常是通过输入到文本编辑器编辑得到的，它们存储在内存中或者编码为文本文件存在硬盘里，然后通过复制等程序会到达某个地址的内存中，在JS程序中被抽象成字符串变量。而我们知道，字符串是一维的字符数组，那么我们怎么取出运算符`+`，数字`1`和数字`2`呢？取子字符串：
```js
var str = "(+ 1 2)";
var operator = str.substring(1, 2);
var operand1 = str.substring(3, 4);
var operand2 = str.substring(5, 6);
```
一种更好的方法，用正则:
```js
var str = "(add 12 23)";
var m = str.match(/[\+\-\*\/\w]+|[\(\)]/g);
var operator = m[1];
for(var n = 1; n < m.length - 1; n++) {
    var operandN = m[n];
    console.log(operandN);
}
```
可是我们的Scheme程序不会像`(add 12 23)`这么简单，如何解析复杂表达式呢？例如下面这样的：
```scheme
; Scheme+过程调用表达式
(
  +         ; operator
  (* 3 5)   ; operand1
  (- 10 6)  ; operand2
            ; operandN
)
```
这个问题可以暂时放下，先考虑下面的问题。
我们应该将这些结果缓存起来（成为`operator`，`operand1`和`operand2`），后续就不用再次取出，既提高了性能，也方便后续解释器模块进一步处理，慢慢靠近代码本来的含义。同样的这个原因，我们在此阶段需要输出属性信息，例如`12`是一个数值，而`add`和`+`则是一个标识符等。  
它们就像中文中的单词，那么我们该如何表示这样一个单词呢，以及它们之间的数据关系？我们可以看到，Scheme语法如此简洁统一，Scheme语言元素的关系在于它们在不在同一对括号里：`*`、`3`和`5`在同一对括号里，`-`、`10`和`6`在同一对括号里，以及`+`、`(* 3 5)`和`(- 10 6)`在同一对括号里，即它们是“粘”在一起的，operand1和operand2是整个+表达式单元中的两个子单元。稍加思考，我们发现可以用JS数组表示那样的关系：
```scheme
/* Scheme+过程调用表达式的JS数组表示 */
[
  '+',          // operator
  ['*', 3, 5],  // operand1
  ['-', 10, 6]  // operand2
                // operandN
]
```
上面这种表示法其实是一些人曾尝试过的做法，但是后来我们会发现，如果语法分析的结果是Scheme对象，那么对于`quote`运算符等重要特性的实现，仅仅只要返回Scheme对象即可，而不用去解释时转换。下面是quote的例子：
```scheme
; quote用法示例
(define l (quote (* 7 8 9)))  ; quote将(* 7 8 9)看作表的外部表示
(list? l)                     ; 判断是否一个表，返回#t
(map display l)               ; 输出l的4个元素：+、7、8、9和空表'()
(car l)                       ; 返回符号*
(cdr l)                       ; 返回表(7 8 9)
(quote +)                     ; 返回符号+
(symbol? (quote +))           ; 判断是否一个符号，返回#t
(quote 3)                     ; 返回数字3
(integer? (quote 3))          ; 判断是否一个整数，返回#t
```

## 4.Scheme对象

&emsp;&emsp;我们决定将表达式`(+ (* 3 5) (- 10 6))`用Scheme表表示，Scheme表基于Scheme序对表示，因此我们要实现Scheme序对，然后是表。  
只要我们实现了Scheme序对和表，我们也就是完成了Scheme数据的表示和Scheme程序的表示。接下来我们考虑Scheme序对在JS中的实现和表示。  
要认识到我们看不了太远，但要尽可能的往前看，并在当前勇于做一些决定。抽象可以延迟某些表示的决定。一种数据抽象方法是基于选择器函数和构造函数：由于本质上是函数，我们保持函数在"使用"层面的行为上，它的"实现"是可替换和修改的。一次完成不了所有事，要做着反复重写重构程序的准备。
你应该已经知道了序对是什么。序对是下面的抽象定义，用JS描述：
```js
var z = cons(x, y); // x和y组成的序对
car(z) === x        // true
cdr(z) === y        // true
setCar(z, a);
car(z) === a        // true
setCdr(z, b);
cdr(z) === b        // true
```
在具体层面上，可以实现为对一个包含2个元素的数组的操作：
```js
function cons(x, y) { return [x, y]; }
function car(z) { return z[0]; }
function cdr(z) { return z[1]; }
function setCar(z, x) { z[0] = x; }
function setCdr(z, y) { z[1] = y; }
```
在Scheme中，我们是这样构造Scheme程序的数据表示的：
```scheme
; 构造Scheme数据的Scheme表达式
(cons '+
      (cons (cons '* (cons 3 (cons 5 '())))
            (cons (cons '- (cons 10 (cons 6 '())))
                  '())))   ;(+ (* 3 5) (- 10 6))
```
在JS中，我们以同样的原理构造Scheme程序的数据形式：
```js
// 构造Scheme数据的JS表达式
cons("+",
     cons(cons("*", cons(3, cons(5, []))),
          cons(cons("-", cons(10 ,cons(6, []))), [])));
```
以上我们完成了程序和序对数据的大概表示，Scheme中还有符号、布尔、数字，字符、字符串和空表等类型数据。
在我们的Scheme解释器中，会有很多函数的参数是Scheme对象，例如表示Scheme过程的函数、eval函数（这是解释器的核心函数，类似于JS中的eval，接下来我们就会知道）等等。因此我们需要统一的表示它们，你也许会想到，JS语言是动态类型，一切皆Object，对于Scheme的布尔、数字、字符串、空表可以用JS中的相应的类型表示，然后typeof、instanceof和constructor能够得到它们的类型属性，而符号、字符需要一个名为“类型”的字段来标记。
这样结果就是有些需要使用typeof、instanceof和constructor，另一些用字段值判断，例如：
```js
if(obj instanceof Boolean)
  console.log(obj)
else if(obj instanceof String)
  console.log(obj)
else if(obj instanceof Array) {
  if(obj.length > 0)
    var first = car(obj);
    // ...
  else
    console.log('()')
}
else if(obj.type == scheme_char_type)
  console.log(obj)
else if(obj.type == scheme_symbol_type)
  console.log(obj)
...
```
但是在这里，我们采用统一的“类型”字段表示法，统一用类型字段判断，并且依赖于JS的动态类型。
它有一个值字段，一个类型字段，它是一种通用接口：
```js
scheme.Object = function(type, val) {
    this.type = type;
    this.val = val;
}
```

## 5.词法+语法分析

我们要写一个词法分解和语法分析器，例如输入`(+ (* 3 5) (- 10 6))`，输出的JSON化结果是：
```json
{"type":5,"val":[
    {"type":7,"val":"+"},
    {"type":5,"val":[
        {"type":5,"val":[
            {"type":7,"val":"*"},
            {"type":5,"val":[
                {"type":1,"val":3},
                {"type":5,"val":[
                    {"type":1,"val":5},
                    {"type":10,"val":null}]}]}]},
        {"type":5,"val":[
            {"type":5,"val":[
                {"type":7,"val":"-"},
                {"type":5,"val":[
                    {"type":1,"val":10},
                    {"type":5,"val":[
                        {"type":1,"val":6},
                        {"type":10,"val":null}]}]}]},
            {"type":10,"val":null}]}]}]}
```
本文重点不在语法分析和语法检查，所以不讨论如何实现语法分析器，也许你可以参考[read.js](../jsscheme/base/read.js))。

接下来我们将启程，进入最有趣最神奇的地方。

## 6.准备求值
&emsp;&emsp;上面JSON具有比较深的对象嵌套，可以看作一颗树，而一般，递归是处理层次性数据结构的最简洁有力的手段。我们接下来将要使用递归，本文虽然可以单独地仔细介绍递归，不过我们也可以一边应用一边理解递归。  
我们应该已经知道，数值是最简单的表达式，它的值就是自身。最普遍的是过程调用表达式（又叫组合式），它的求值规则，举例来说，`(+ (* 3 5) (- 10 6))`是一个过程调用表达式，先计算运算符部分`+`，返回一个`+`代表的那个过程，然后依次求值运算数得到实际参数`15`和`4`，最后将`+`的值的过程应用到实际参数`15`和`4`，结果是`19`。  
可以看到，`(* 3 5)`和`(- 10 6)`也是组合式，总共来说，我们使用了3次上述同一求值规则：我们第1次使用规则是为`(+ (* 3 5) (- 10 6))`，在遇到`(* 3 5)`时，我们将第1次规则进程“挂起”，记住我们将会返回，并第2次使用规则算出`15`，然后确实回到第1次规则的进程状态继续，遇到`(- 10 6)`，我们第3次使用规则算出`4`，之后回到第1次规则进程中。接下来我们尝试写一个计算器：
```js
var seval = (function() {
    // 根据符号查找对象
    var lookup = (function(){
        // 数值算术运算
        function plus(x, y) { return x + y; }
        function minus(x, y) { return x - y; }
        function mul(x, y) { return x * y; }
        function div(x, y) { return x / y; }
        // 符号名到运算函数的map
        var symMap = {};
        symMap['+'] = function(argv) { return argv.reduce(plus, 0); }
        symMap['-'] = function(argv) { return argv.reduce(minus); }
        symMap['*'] = function(argv) { return argv.reduce(mul, 1); }
        symMap['/'] = function(argv) { return argv.reduce(div); }
        function lookup(sym) { return symMap[sym]; }

        return lookup;
    })();

    function isNumber(obj) { return typeof obj === 'number'; }
    function isSymbol(obj) { return typeof obj === 'string'; }
    function isCall(obj) { return obj instanceof Array; }
    function operator(exp) { return exp[0]; }
    function operands(exp) { return exp.slice(1); }

    // 求值
    function seval(exp) {
        if(isNumber(exp))       // 是数字
            return exp;            // 直接返回
        else if(isSymbol(exp))  // 是符号
            return lookup(exp);    // 返回它所指的函数
        else if(isCall(exp)) {  // 是调用
            var func = seval(operator(exp));     // 求值运算符，得到函数
            var args = operands(exp).map(seval); // 求值运算数，得到实际参数
            return func(args);               // 将运算符应用到运算数
        }
        else
            throw new Error("未知类型表达式");
    }

    return seval;
})();

// test
console.log( seval('+') ) // function +
console.log( seval(57) ) // 57
console.log( seval(['+', 1, 2]) ) // 3
console.log( seval(['+', ['*', 3, 5], ['-', 10, 6]]) ) // 19
```