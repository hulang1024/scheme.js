scheme.initALib = function(env) {
scheme.evalStringWithEnv("\
(define (zero? z) (= z 0))\
(define (positive? x) (> x 0))\
(define (negative? x) (< x 0))\
(define (odd? z) (not (= (remainder z 2) 0)))\
(define (even? z) (= (remainder z 2) 0))\
(define (square x) (* x x))\
(define (cube x) (* x x x))\
(define (inc x) (+ x 1))\
(define (dec x) (- x 1))\
(define (abs x) (if (> x 0) x (- x)))\
\
(define (atom? x) (not (pair? x)))\
(define nil '())\
\
(define (memq obj list)\
  (cond ((null? list) #f)\
        ((eq? obj (car list)) list)\
        (else (memq obj (cdr list)))))\
\
(define (println obj)\
    (display obj)\
    (newline))\
", env);
}