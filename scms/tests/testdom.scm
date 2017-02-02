(define exp (getElementById document "exp"))
(define c (dom-get exp 'rows))
(dom-set-event document 'onkeypress
  (lambda (event)
    (dom-set exp 'rows c) 
    (set! c (- c 1))) 