(symbol? 'foo) ; #t
(symbol? (car '(a b))) ; #t
(symbol? "bar") ; #f
(symbol? 'nil) ; #t
(symbol? '()) ; #f
(symbol? #f) ; #f