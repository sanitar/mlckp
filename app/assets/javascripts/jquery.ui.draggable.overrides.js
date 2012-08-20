$.ui.draggable.prototype._generatePosition = function(event){
    var o = this.options, scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.ui.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);
    var pageX = event.pageX;
    var pageY = event.pageY;

    if(this.originalPosition) { //If we are not dragging yet, we won't check for options
        var containment;
        if(this.containment) {
            if (this.relative_container){
                var co = this.relative_container.offset();
                containment = [ this.containment[0] + co.left,
                    this.containment[1] + co.top,
                    this.containment[2] + co.left,
                    this.containment[3] + co.top ];
            }
            else {
                containment = this.containment;
            }

            if(event.pageX - this.offset.click.left < containment[0]) pageX = containment[0] + this.offset.click.left;
            if(event.pageY - this.offset.click.top < containment[1]) pageY = containment[1] + this.offset.click.top;
            if(event.pageX - this.offset.click.left > containment[2]) pageX = containment[2] + this.offset.click.left;
            if(event.pageY - this.offset.click.top > containment[3]) pageY = containment[3] + this.offset.click.top;
        }

        if (o.snapToObjects && this.friendsPosition){
//            this.element.parents('#workspace').children('.guide').css({
//                display: 'none'
//            });
//
//            var top = pageY - this.offset.click.top - this.offset.relative.top - this.offset.parent.top,
//                left = pageX - this.offset.click.left - this.offset.relative.left - this.offset.parent.left,
//                minLeft, minTop,
//                closestLeft, closestTop;
//
//            for (var i = 0; i < this.friendsPosition.v.length; i++){
//                var x = this.friendsPosition.v[i],
//                    diff = Math.abs(x - left);
//                if (!minLeft || minLeft > diff){
//                    minLeft = diff;
//                    closestLeft = x;
//                }
//            }
//
//            for (var i = 0; i < this.friendsPosition.h.length; i++){
//                var y = this.friendsPosition.h[i],
//                    diff = Math.abs(y - top);
//                if (!minTop || minTop > diff){
//                    minTop = diff;
//                    closestTop = y;
//                }
//            }
//
//            if (minTop < o.snapToObjectsTolerance){
//                this.element.parents('#workspace').children('.guide-horizontal').css({
//                    top: closestTop + 'px',
//                    display: 'block'
//                });
//                top = closestTop;
//            }
//            if (minLeft < o.snapToObjectsTolerance){
//                this.element.parents('#workspace').children('.guide-vertical').css({
//                    left: closestLeft + 'px',
//                    display: 'block'
//                });
//                left = closestLeft;
//            }
//            if (minTop < o.snapToObjectsTolerance || minLeft < o.snapToObjectsTolerance){
//                return {
//                    top: top,
//                    left: left
//                }
//
//            }
//
//            console.log('---min: ', minLeft, minTop);
//            console.log('position before grid: ', top, left);
        }

        if(o.grid) {
            //Check for grid elements set to 0 to prevent divide by 0 error causing invalid argument errors in IE (see ticket #6950)
            var top = o.grid[1] ? this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1] : this.originalPageY;
            pageY = containment ? (!(top - this.offset.click.top < containment[1] || top - this.offset.click.top > containment[3]) ? top : (!(top - this.offset.click.top < containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;

            var left = o.grid[0] ? this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0] : this.originalPageX;
            pageX = containment ? (!(left - this.offset.click.left < containment[0] || left - this.offset.click.left > containment[2]) ? left : (!(left - this.offset.click.left < containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
        }
    }

    return {
        top: ( pageY																// The absolute mouse position
            - this.offset.click.top													// Click offset (relative to the element)
            - this.offset.relative.top												// Only for relative positioned nodes: Relative offset from element to offset parent
            - this.offset.parent.top												// The offsetParent's offset without borders (offset + border)
            + ($.browser.safari && $.browser.version < 526 && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ))
        ),
        left: (pageX																// The absolute mouse position
            - this.offset.click.left												// Click offset (relative to the element)
            - this.offset.relative.left												// Only for relative positioned nodes: Relative offset from element to offset parent
            - this.offset.parent.left												// The offsetParent's offset without borders (offset + border)
            + ($.browser.safari && $.browser.version < 526 && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ))
        )
    };

}

$.ui.plugin.add("draggable", "snapToGrid", {
    drag: function(event, ui){
        var inst = this.data('draggable'),
            o = inst.options;

        if (o.snapToGrid && o.grid){
            var pos = ui.position,
                distanceToCellX = pos.left % o.grid[0],
                distanceToCellY = pos.top % o.grid[1];

            if (distanceToCellX > 0){
                var diffX = event.pageX - inst.originalPageX;
                pos.left += diffX > 0 ? o.grid[0] - distanceToCellX : (diffX < 0 ? -distanceToCellX : 0);
            }
            if (distanceToCellY > 0){
                var diffY = event.pageY - inst.originalPageY;
                pos.top += diffY > 0 ? o.grid[1] - distanceToCellY : (diffY < 0 ? -distanceToCellY : 0);
            }
        }
    }
});

$.ui.plugin.add("draggable", "snapToObjects", {
    start: function(event, ui) {
        var inst = this.data('draggable'),
            friends = this.parent().children('.ui-draggable:not(.ui-draggable-disabled)').not(this),
            friendsPosition = { v: [], h: []};

        friends.each(function(){
            var el = $(this),
                position = el.position();
            friendsPosition.v.push(position.left);
            friendsPosition.v.push(position.left + el.width());
            friendsPosition.h.push(position.top);
            friendsPosition.h.push(position.top + el.height());
        });

        inst.friendsPosition = friendsPosition;
        console.log(friends, friendsPosition);
    },
    stop: function(event, ui){
        this.parents('#workspace').children('.guide').css({
            display: 'none'
        });
    }

});