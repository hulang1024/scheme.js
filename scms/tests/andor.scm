(and) ;#t
(and (display 1) #f (display 2)) ;1#f
(let ((x (display 1)))
  (if (not x)
      x
      (let ((x #f))
        (if (not x)
            x
            (let ((x (display 2)))
              (if (not x)
                  x
                  x))))))
;1#f

(or) ;#f
(or (display 1) #f (display 2)) ;1
(let ((x (display 1)))
  (if x
      x
      (let ((x #f))
        (if x
            x
            (let ((x (display 2)))
              (if x
                  x
                  #f))))))
;1