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
        (display ".")))
    (newline)))
	

(define x 5) ;定义变量x

;定义变量l,值为一个表，有3个元素:符号+,2,符号x
;'(+ 2 x)是(quote (+ 2 x))的简写
;quote的功能是返回表达式本身，即一个列表，而不进行意义的求值
(define l '(+ 2 x))

;;调用eval
;接收scheme中程序和表达式的数据表示以及一个环境，在此环境中求值
;(interaction-environment)返回全局环境
(eval l (interaction-environment))

;;调用appply
;第一个参数必须为一个过程((procedure? x)为真的参数)
;以及该过程需要的实际参数组成的列表
(apply (eval (car l) (interaction-environment))
       (list 2 5))


