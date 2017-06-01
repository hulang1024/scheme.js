;;; 猜数字
;;; author: problue
(define (promptnum msg)
  (string->number (prompt msg)))
(define times 0)
(define (guess-loop)
  (define g (promptnum "数"))
  (set! times (+ times 1))
  (let ((result #t))
    (cond ((< g answer) (set! result "小了~"))
          ((> g answer) (set! result "大了~"))
          (else (alert (string-append "恭喜,你猜对了!尝试次数:"
                                       (number->string times)))
                (set! result #f)))
    (if result
      (if (confirm (string-append result "是否继续?"))
          (guess-loop)))))
(alert "欢迎进入猜数字游戏~")
(define max (promptnum "请输入游戏的最大数:"))
(if (> max 1)
  (begin
    (define answer (random-int 1 max))
    (alert "ok，我已生成一个数。现在开始，请猜猜看")
    (guess-loop)))