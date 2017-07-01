(define (zero? z)
  (= z 0))

(define (positive? x)
  (> x 0))

(define (negative? x)
  (< x 0))

(define (odd? z)
  (not (= (remainder z 2) 0)))

(define (even? z)
  (= (remainder z 2) 0))

(define (square x)
  (* x x))

(define (cube x)
  (* x x x))

(define (inc x)
  (+ x 1))

(define (dec x)
  (- x 1))

(define (abs x)
  (if (> x 0) x (- x)))

(define max
  (lambda (x y)
    (if (> x y) x y)))

(define min
  (lambda (x y)
    (if (< x y) x y)))

(define (expt b n)
  (define (expt-iter b counter product)
    (if (= counter 0)
        product
        (expt-iter b
                   (- counter 1)
                   (* b product))))
  (expt-iter b n 1))
 
 (define (gcd a b)
    (if (= b 0)
	a
	(gcd b (remainder a b))))
 
 
 
(define nil '())

(define (atom? x)
  (not (pair? x)))


(define (memq obj list)
  (cond ((null? list) #f)
        ((eq? obj (car list)) list)
        (else (memq obj (cdr list)))))

(define (memv obj list)
  (cond ((null? list) #f)
        ((eqv? obj (car list)) list)
        (else (memv obj (cdr list)))))

(define (assoc x y)
  (cond ((null? y) '())
        ((equal? x (caar y)) (car y))
        ((assoc x (cdr y)))))

(define (assv x y)
  (cond ((null? y) '())
        ((eqv? x (caar y)) (car y))
        ((assv x (cdr y)))))

(define (assq x y)
  (cond ((null? y) '())
        ((eq? x (caar y)) (car y))
        ((assq x (cdr y)))))



(define subst
    (lambda (new old slist)
      (if (null? slist)
        '()
        (cons
	       (subst-in-s-exp new old (car slist)) 
	       (subst new old (cdr slist))))))

(define subst-in-s-exp
    (lambda (new old sexp)
      (cond ((symbol? sexp)
             (if (eqv? sexp old) new sexp))
            ((pair? sexp)
             (subst new old sexp))
            (else sexp))))


(define print display)

(define (println obj)
  (display obj)
  (newline))
