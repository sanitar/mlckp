jQuery.findInArray = function (arr, fn) {
    for (var i = 0, len = arr.length; i < len; i++){
        if (fn(arr[i], i)){
            return arr[i];
        }
    }
    return -1;
}
jQuery.fn.positionRectangle = function(){
    var el, pos, posBottom, posRight,
        res = {};
    this.each(function(){
        el = $(this);
        pos = el.position();
        pos.right = el.width() + pos.left;
        pos.bottom = el.height() + pos.top;

        res.left = (!res.left || res.left > pos.left) ? pos.left : res.left;
        res.top = (!res.top || res.top > pos.top) ? pos.top : res.top;
        res.right = (!res.right || res.right < pos.right) ? pos.right : res.right;
        res.bottom = (!res.bottom || res.bottom < pos.bottom) ? pos.bottom : res.bottom;
    });
    return res;
}