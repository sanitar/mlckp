jQuery.fn.zindexchange = function (action) {
    if (this.size() < 1) return;
    var ws = this.eq(0).parent();

    if (action == 'menu_move_forwards'){
        this.each(function(){
            var next = $(this).next();
            if (next.size() > 0){
                next.after($(this).detach());
            }
        });
    }
    if (action == 'menu_move_backwards'){
        this.each(function(){
            var prev = $(this).prev();
            if (prev.size() > 0){
                prev.before($(this).detach());
            }
        });
    }
    if (action == 'menu_move_front'){
        this.detach().appendTo(ws);
    }
    if (action == 'menu_move_back'){
        var s = this.detach();
        for (var i = s.length -1; i >= 0; i--){
            ws.prepend(s[i]);
        }
    }
}