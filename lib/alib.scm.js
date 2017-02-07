var s =
"(define (square x) (* x x))"+
"(define (cute x) (* x x x))"+
"(define (abs x) (if (> x 0) x (- x)))"

scheme.evalString(s);