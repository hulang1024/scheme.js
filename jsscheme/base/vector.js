(function(scheme){
"use strict";

scheme.initVector = function(env) {
}

scheme.makeVector = function(val) {
    return new scheme.Object(scheme_vector_type, val);
}

})(scheme);
