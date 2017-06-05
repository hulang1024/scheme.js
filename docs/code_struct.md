# 代码结构

## 模块

```javascript
var scheme = {}; // 在全局环境里的scheme模块

// 一个scheme子模块
(function(scheme){ // 不直接引用全局scheme，而通过参数，加快访问变量速度
    "use strict";
    
    var m;             // 定义该模块中的私有变量
    
    scheme.bar = baz;  // 往命名空间中增加scheme 接口/公有子模块功能
    
    function foo() {   // 定义该模块中的私有函数
      scheme.zz        // 引用scheme模块的东西
    }
})(scheme);
```