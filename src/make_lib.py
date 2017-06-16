#!/usr/bin/env python
# _*_coding:utf-8_*_

import os

SCM_IN_FILE  = 'lib/lib.scm'
JS_OUT_FILE  = 'lib/lib.js'

# Read the SCM file
scmFile = open(SCM_IN_FILE, 'rb')
scmSrc = scmFile.read().decode('utf-8')
scmFile.close()

jsSrc = 'var SCHEME_LIB_SRC = ' + repr(scmSrc) + ';'

# Write the JS source
jsFile = open(JS_OUT_FILE, 'w')
jsFile.write(jsSrc)
jsFile.close()

