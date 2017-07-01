(eval '(* 7 3) (interaction-environment))  ; 21
(let ((f (eval '(lambda (f x) (f x x))
               (interaction-environment))))
  (f + 10)) ; 20

;一些简单过程的定义
(define (square x) (* x x))
(define (sum-of-squares x y)
  (+ (square x) (square y)))
(define (f a)
  (sum-of-squares (+ a 1) (* a 2)))
;;;下面测试过程expand，它是SICP SECTION 1.1.5介绍的正则序求值方式（完全展开而后归约）的实现
;;;实际解释器采用应用序求值方式（先求值参数而后应用）
(for-each
 (lambda (exp)
   (let ((expaned (expand exp)))
	 (println expaned)
	 (if (not (eqv? (eval expaned (interaction-environment))
                    (eval exp (interaction-environment))))
	 	(error 'bad-expand))))
 '((square 21)
   (square (+ 2 5))
   (square (square 3))
   (sum-of-squares 3 4)
   (f 5)))
;(* 21 21)
;(* (+ 2 5) (+ 2 5))
;(* (* 3 3) (* 3 3))
;(+ (* 3 3) (* 4 4))
;(+ (* (+ 5 1) (+ 5 1)) (* (* 5 2) (* 5 2)))
