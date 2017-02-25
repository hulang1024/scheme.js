(if (> 3 2) 'yes 'no) ; yes
(if (> 2 3) 'yes 'no) ; no
(if (> 3 2)
    (- 3 2)
    (+ 3 2)) ; 1


;;;派生表达式
(cond ((> 3 2) 'greater)
      ((< 3 2) 'less)) ; greater
(cond ((> 3 3) 'greater)
      ((< 3 3) 'less)
      (else 'equal)) ; equal

(and (= 2 2) (> 2 1)) ; #t
(and (= 2 2) (< 2 1)) ; #f
(and 1 2 'c '(f g)) ; (f g)
(and) ; #t

(or (= 2 2) (> 2 1)) ; #t
(or (= 2 2) (< 2 1)) ; #t
(or #f #f #f) ; #f
(or (memq 'b '(a b c))
    (/ 3 0)) ; (b c)

(unless (> 1 3)
        (display 4) 5)  ; 45
(when (< 1 3)
        (display 4) 6)  ; 46