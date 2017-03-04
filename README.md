
这是编程语言[Scheme](https://en.wikipedia.org/wiki/Scheme_(programming_language))的解释器实现的JavaScript版本的实现[在线IDE地址](https://hlpp.github.io/JSScheme/)。目标为完全实现(接近)Scheme语言标准R5RS。目的是为了理解并掌握一些编程技巧。


## 特性
我们有控制复杂度的工程方法:
* 黑盒抽象
* 约定接口
* 元语言抽象

为了上面这些，一种强大的编程语言作为框架应具有的三大机制和其中数据和过程的维度，表格如下(举例):
- :

    |/|过程|数据|
    | :---: | :---: | :---: |
    |基本元素|`+` `<`|`3` `5.6`| 
    |组合的手段|`()` `if`|`pair`|
    |抽象的手段|`define`|`...`|

目前的支持:
* 变量引用  
 `<variable>`
* 局部变量  
 `let`
* 常量引用  
  `quote`,`'`  
* 过程调用  
  `(operator operand ...)`
* 过程  
  `lambda`  
  + 支持固定数量参数, 任意数量参数和n个或更多不定数量参数  
  + 抄录了JavaScript语言中的隐含参数`arguments`和`callee`
* 静态(词法)作用域
* 闭包
* 定义  
  `define`
* 赋值  
  `set!`
* 顺序结构  
  `begin`
* 条件表达式  
  `if`,`cond`,`case`,`when`,`unless`,`and`,`or`
* 递归
* 迭代结构  
  命名`let`,`do`,`while`,`for`
* 标准过程
    + 相等谓词  
        `eqv?`,`eq?`,`equal?`
    + 数值运算和数值输入/输出  
        `number?`,  
        `=`,`<`,`<`,`>`,`<=`,`>=`,  
        `+`,`*`,`-`,`/`,
        `zero?`,`positive?`,`negative?`,`odd?`,`even?`,`abs`,`remainder`,  
        `number->string`,`string->number`
       1. 整数  
        `integer?`
       2. 实数  
        `real?`
    + 其它数据类型  
       1. 布尔  
        `boolean?`,`not`
       2. 序对和表  
        `pair?`,`cons`,`car`,`cdr`,`set-car!`,`set-cdr!`,  
        `caar`,`cadr` `...` `cdddar`,`cddddr` (`car`和`cdr`的组合,定义到第四层),  
        `null?`,`list?`,`list`,`length`,`append`,`reverse`,`list-tail`,`list-ref`,`memq`,`memv`
       3. 符号  
        `symbol?`,`symbol->string`,`string->symbol`
       4. 字符  
        `char?`
       5. 字符串  
        `string?`,`make-string`,`string`,`string-length`,`string-ref`,`string-set!`,  
        `string=?`,`string-ci=?`,`substring`,`string-append`,`string->list`,`list->string`,  
        `string-copy`,`string-fill!`
    + 控制特征  
        `procedure?`,`apply`,`map`,`for-each`,  
        `void`,`void?`
    + 求值  
        `eval`,`interaction-environment`
    + 输入/输出  
        `read`,`write`,`newline`,`display`,  
        `error`
 
* 注释  
`;line comment`

## 扩展与库
* 基础语言JavaScript的能力
* 部分BOM对象，例如`window`对象方法
* 部分HTML DOM对象

## 示例  
 参见`/scms/`
