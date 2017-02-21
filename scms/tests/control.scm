(procedure? car) ; #t
(procedure? 'car) ; #f
(procedure? (lambda (x) (* x x))) ; #t
(procedure? '(lambda (x) (* x x))) ; #f

(apply + (list 3 4)) ; 7
(define compose
(lambda (f g)
(lambda args
(f (apply g args)))))
((compose square  *) 12 75) ; 810000