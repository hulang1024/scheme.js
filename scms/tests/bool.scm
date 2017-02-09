(boolean? #t);#t
(boolean? #f);#t
(boolean? (> 1 2));#t
(boolean? 6);#f
(boolean? '());#f
(boolean? (boolean? *));#t
(not #t);#f
(not #f);#t
(not '());#f
(not 1);#f
(not 0);#f
(not 1.2);#f
(not "");#f
(not "s");#f
(not +);#f