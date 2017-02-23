(let ((x '(1 3 5 7 9)))
  (do ((x x (cdr x))
       (sum 0 (+ sum (car x))))
      ((null? x) sum)))


(let ((x '(1 3 5 7 9)))
  ((lambda ()
     (define __scheme_gensym_1
       (lambda (x sum)
         (if (null? x)
             sum
             (__scheme_gensym_1 (cdr x) (+ sum (car x))))))
     (__scheme_gensym_1 x 0))))