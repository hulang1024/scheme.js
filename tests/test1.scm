(define x 65)
(define (inc x) (+ x 1))
(define (dec x) (- x 1))
(define (add x y)
  (if (= y 0)
       x
      (add (inc x) (dec y))))
(add 2 3)
((lambda (x) (* x x)) (add 7 3))
x
(add 1 4)
(define x 5)
(let ((x 1) (y 2))
  (display (+ x y))
  (set! x 5)
  (display x))
(newline)
((lambda (x y) (display x) (display y)) 1 2)
(define f (lambda (x) (display x)))
(f 1)
(define f ((lambda (x) (display x)) 1))
f
x


(define (% x y)
  (define r (- x y))
  (cond ((< x y) x)
        ((= r 0) r)
        (else (% r y))))
		
(define (filter predicate seq)
  (cond ((null? seq) seq)
        ((predicate (car seq))
         (cons (car seq)
               (filter predicate (cdr seq))))
        (else (filter predicate (cdr seq)))))
(filter (lambda (x) (= (% x 7) 0)) (list 3 34 43 2 7 14 19 30 55 20) )


(define (for-range m n body)
  (if (<= m n)
      (begin
        (body m)
        (for-range (+ m 1) n body))))
(for-range 1 9
  (lambda (i)
    (for-range 1 i
      (lambda (j)
        (display i)
        (display "*")
        (display j)
        (display "=")
        (display (* i j))
        (display "\40")))
    (newline)))
	
	
(define 加 +)
(define 减 -)
(define 乘 *)
(define 除 /)
(define 等 =)
(define 小于 <)
(define 大于 >)
(define 小于或等于 <=)
(define 大于或等于 >=)
(define 绝对值 abs)
(define 非 not)
(define 与 and)
(define 或 or)
(define 是过程吗 procedure?)
(define 是符号吗 symbol?)
(define 是列表吗 list?)
(define 是空表吗 null?)
(define 是序对吗 pair?)
(define 是整数吗 integer?)
(define 是实数吗 real?)
(define 是数字吗 number?)
(define 是字符串吗 string?)
(define 是布尔吗 boolean?)
(define 引用相等吗 eq?)
(define 做序对 cons)
(define 序对左 car)
(define 序对右 cdr)
(define 设序对左 set-car!)
(define 设序对右 set-cdr!)
(define 做列表 list)
(define 列表元素索引 list-ref)
(define 字符串转换为数字 string->number)
(define 显示 display)
(define 新行 newline)
(define 消息对话框 alert)
(define 提示对话框 prompt)
(define 确认对话框 confirm)
(define 随机整数 random-int)
(define 真 #t)
(define 假 #f)
(define 空表 '())

(define 轻轻地我走了 "小偷")
(define 正如我轻轻地来 "来偷东西")
(define 我挥一挥衣袖 "给同伙发暗号")
(define 不带走一片云彩 "值钱的都偷走")
(define 作者名字 "徐志摩")
(define 翻译者 "problue")
'轻轻地我走了
轻轻地我走了
'正如我轻轻地来
正如我轻轻地来
'我挥一挥衣袖
我挥一挥衣袖
'不带走一片云彩
不带走一片云彩
(quote 作者名字)
作者名字
'翻译者
翻译者