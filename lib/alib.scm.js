scheme.initALib = function(env) {
scheme.evalStringWithEnv("\
(define (square x) (* x x))\
(define (cube x) (* x x x))\
(define (inc x) (+ x 1))\
(define (dec x) (- x 1))\
(define (abs x) (if (> x 0) x (- x)))\
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