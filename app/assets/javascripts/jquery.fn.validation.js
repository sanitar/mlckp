jQuery.fn.validate = function (validation) {
    validation = typeof validation == 'function' ? validation : function(){ return true; };
    this.keypress(function(e, el){
        var val = $(this).val(),
            key = e.which,
            validate = validation.call(this, val, e);
        if (!validate) return false;
    });
}
