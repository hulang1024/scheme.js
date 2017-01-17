(define (promptnum msg)
  (string->number (prompt msg)))

(define (guess-loop)
  (define g (promptnum "数"))
  (let ((right #f))
    (cond ((< g answer) (alert "小了~"))
          ((> g answer) (alert "大了~"))
          (else (alert "恭喜,你猜对了!")
                (set! right #t)))
    (if (not right)
      (if (confirm "是否继续?")
          (guess-loop)))))


(alert "欢迎进入猜数字游戏~")
(define max (promptnum "请输入游戏的最大数:"))
(if (> max 1)
  (begin
    (define answer (random-int 1 max))
    (alert "ok，我已生成一个数。现在开始，请猜猜看")
    (guess-loop)))