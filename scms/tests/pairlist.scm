'(a b c d e) ; (a b c d e)
'(a . (b . (c . (d . (e . ()))))) ; (a b c d e)

'(a b c . d) ; (a b c . d)
'(a . (b . (c . d))) ; (a b c . d)

(define x (list 'a 'b 'c))
(define y x)
y ; (a b c)
(list? y) ; #t
(set-cdr! x 4)
x ; (a . 4)
(eq? x y) ; #t
y ; (a . 4)
(list? y) ; #f
(set-cdr! x x)
(list? x) ; #f

(pair? '(a . b)) ; #t
(pair? '(a b c)) ; #t
(pair? '()) ; #f

(cons 'a '()) ; (a)
(cons '(a) '(b c d)) ; ((a) b c d)
(cons "a" '(b c)) ; ("a" b c)
(cons 'a 3) ; (a . 3)
(cons '(a b) 'c) ; ((a b) . c)

(car '(a b c)) ; a
(car '((a) b c d)) ; (a)
(car '(1 . 2)) ; 1
(car '()) ; ´íÎó

(cdr '((a) b c d)) ; (b c d)
(cdr '(1 . 2)) ; 2
(cdr '()) ; ´íÎó

(define (f) (list 'not-a-constant-list))
(define (g) '(constant-list))
(set-car! (f) 3) ; Î´¶¨Òå
(set-car! (g) 3) ; ´íÎó

(list? '(a b c)) ; #t
(list? '()) ; #t
(list? '(a . b)) ; #f
(let ((x (list 'a)))
  (set-cdr! x x)
  (list? x)) ; #f
  
(list 'a (+ 3 4) 'c) ; (a 7 c)
(list) ; ()

(length '(a b c)) ; 3
(length '(a (b) (c d e))) ; 3
(length '()) ; 0

(list-ref '(a b c d) 2) ; c