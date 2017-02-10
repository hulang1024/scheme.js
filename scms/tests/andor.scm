(and) ;#t
(and (display 1) #f (display 2)) ;1#f

(or) ;#f
(or (display 1) #f (display 2)) ;1

(define (my->= x y)
  (or (> x y) (= x y)))
(my->= 1 2);#f