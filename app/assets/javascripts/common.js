$(document).ready(function(){
    $('input.input-number').live({
        'keydown': function(e){
            var key = e.keyCode,
                val;
            if (key != 46 && key != 8 && key != 9 && key != 37 && key != 39 && (key < 48 || key > 57 )) {
                e.preventDefault();
            }
            if (key == 38){ // up key
                val = parseInt($(this).val(), 10);
                $(this).val(val + 1);
            }
            if (key == 40){ //down key
                val = parseInt($(this).val(), 10);
                val = val == 0 ? val : (val - 1);
                $(this).val(val);
            }
        }
    })
});