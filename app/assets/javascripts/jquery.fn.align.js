jQuery.fn.align = function (alignment) {
    if (this.size() < 2) return;

    var maxx, maxy, minx, miny;

    this.each(function(){
        var el = $(this),
            pos = el.position(),
            mx = el.width() + pos.left,
            my = el.height() + pos.top;

        minx = (!minx || minx > pos.left) ? pos.left : minx;
        miny = (!miny || miny > pos.top) ? pos.top : miny;
        maxx = (!maxx || maxx < mx) ? mx : maxx;
        maxy = (!maxy || maxy < my) ? my : maxy;

        console.log(this, pos, mx, my);
    });

    switch (alignment){
        case 'menu_align_right':
            this.each(function(){
                $(this).css({
                    left: maxx - $(this).width()
                })
            });
            break;
        case 'menu_align_center':
            var center = minx + Math.round((maxx - minx)/2);
            this.each(function(){
                $(this).css({
                    left: center - Math.round($(this).width()/2)
                })
            });
            break;
        case 'menu_align_left':
            this.css({
                left: minx
            })
            break;
        case 'menu_align_bottom':
            this.each(function(){
                $(this).css({
                    top: maxy - $(this).height()
                })
            });
            break;
        case 'menu_align_middle':
            var middle = miny + Math.round((maxy - miny)/2);
            this.each(function(){
                $(this).css({
                    top: middle - Math.round($(this).height()/2)
                })
            });
            break;
        case 'menu_align_top':
            this.css({
                top: miny
            })
            break;
    }
}