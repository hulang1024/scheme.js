scheme.evalString(
"(define (square x) (* x x))"+
"(define (cube x) (* x x x))"+
"(define (inc x) (+ x 1))"+
"(define (dec x) (- x 1))"+
"(define (abs x) (if (> x 0) x (- x)))"+
"(define (atom? x) (not (pair? x)))"
);