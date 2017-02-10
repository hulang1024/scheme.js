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

((lambda x x))
((lambda x x) 1 2 3)  

(define (for-range m n body)
  (if (<= m n)
      (begin
        (body m)
        (for-range (+ m 1) n body))))
(for-range 1 9
  (lambda (i)
    (for-range 1 i
      (lambda (j)
        (display (string-append
          (number->string i)
          "*"
          (number->string j)
          "="
          (number->string (* i j))
          " "))))
    (newline)))