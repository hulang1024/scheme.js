;;使方向键控制按钮


(define (addpx d a n)
  (define (getpx str)
    (string->number str))
  (dom-set d a (string-append
              (number->string (+ (getpx (dom-get d a)) n))
              "px")))

(define d (dom-get (getElementById document "run") 'style))
(dom-set d 'position "absolute")
(dom-set d 'left "100px")
(dom-set d 'top 0)
(dom-set-event document 'onkeydown
  (lambda (event)
    (define KEY_L 37)
    (define KEY_U 38)
    (define KEY_R 39)
    (define KEY_D 40)
    (define key (dom-get event 'keyCode))
    (cond ((= key KEY_U) (addpx d 'top -10))
          ((= key KEY_D) (addpx d 'top +10))
          ((= key KEY_L) (addpx d 'left -10))
          ((= key KEY_R) (addpx d 'left +10)))))



;;让按钮跟随鼠标，按esc键切换暂停/开始
(define (topxstr num)
  (string-append (number->string num) "px"))

(define e (getElementById document "run"))
(define d (dom-get e 'style))
(dom-set d 'position "absolute")
(dom-set d 'left "100px")
(dom-set d 'top "200px")

(define pause #f)

(dom-set-event document 'onmousemove
  (lambda (event)
    (if (not pause)
      (begin
        (dom-set d 'left (topxstr (dom-get event 'clientX)))
        (dom-set d 'top (topxstr (dom-get event 'clientY)))))))

(dom-set-event document 'onkeydown
  (lambda (event)
    (if (= (dom-get event 'keyCode) 27)
        (set! pause (not pause)))))