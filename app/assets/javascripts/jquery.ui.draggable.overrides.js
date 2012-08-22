// snapToGrid plugin
$.ui.plugin.add("draggable", "snapToGrid", {
    drag: function(event, ui){
        var inst = this.data('draggable'),
            o = inst.options;

        if (o.grid){
            var pos = ui.position,
                distanceToCellX = pos.left % o.grid[0],
                distanceToCellY = pos.top % o.grid[1];

            if (distanceToCellX > 0){
                var distanceToOriginalX = event.pageX - inst.originalPageX;
                pos.left += distanceToOriginalX > 0 ? o.grid[0] - distanceToCellX : (distanceToOriginalX < 0 ? -distanceToCellX : 0);
            }
            if (distanceToCellY > 0){
                var distanceToOriginalY = event.pageY - inst.originalPageY;
                pos.top += distanceToCellY > 0 ? o.grid[1] - distanceToCellY : (distanceToCellY < 0 ? -distanceToCellY : 0);
            }
        }
    }
});

// snapToObjects plugin
$.ui.plugin.add("draggable", "snapToObjects", {
    start: function(event, ui) {
        var inst = this.data('draggable'),
            snappingPosition = { v: [], h: []};

        this.siblings('.ui-draggable:not(.ui-draggable-disabled)').each(function(){
            var el = $(this),
                pos = el.position();
            snappingPosition.v.push(pos.left);
            snappingPosition.v.push(pos.left + el.width());
            snappingPosition.h.push(pos.top);
            snappingPosition.h.push(pos.top + el.height());
        });
        inst.snappingPosition = snappingPosition;
        inst.guides = inst.guides || {
            v: inst.element.siblings('.guide-vertical'),
            h: inst.element.siblings('.guide-horizontal')
        }
    },

    drag: function(event, ui){
        var inst = this.data('draggable'),
            o = inst.options,
            scroll = inst.cssPosition == 'absolute' && !(inst.scrollParent[0] != document && $.ui.contains(inst.scrollParent[0], inst.offsetParent[0])) ? inst.offsetParent : inst.scrollParent,
            scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName),
            pageX = event.pageX,
            pageY = event.pageY;

        if (o.snapToObjects && inst.snappingPosition){
            if(inst.originalPosition) { //If we are not dragging yet, we won't check for options
                var containment;
                if(inst.containment) {
                    if (inst.relative_container){
                        var co = inst.relative_container.offset();
                        containment = [ inst.containment[0] + co.left, inst.containment[1] + co.top, inst.containment[2] + co.left, inst.containment[3] + co.top ];
                    }
                    else {
                        containment = inst.containment;
                    }

                    if(event.pageX - inst.offset.click.left < containment[0]) pageX = containment[0] + inst.offset.click.left;
                    if(event.pageY - inst.offset.click.top < containment[1]) pageY = containment[1] + inst.offset.click.top;
                    if(event.pageX - inst.offset.click.left > containment[2]) pageX = containment[2] + inst.offset.click.left;
                    if(event.pageY - inst.offset.click.top > containment[3]) pageY = containment[3] + inst.offset.click.top;
                }
            }

            var top = pageY - inst.offset.click.top - inst.offset.relative.top - inst.offset.parent.top + ($.browser.safari && $.browser.version < 526 && inst.cssPosition == 'fixed' ? 0 : ( inst.cssPosition == 'fixed' ? -inst.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) )),
                left = pageX - inst.offset.click.left - inst.offset.relative.left - inst.offset.parent.left  + ($.browser.safari && $.browser.version < 526 && inst.cssPosition == 'fixed' ? 0 : ( inst.cssPosition == 'fixed' ? -inst.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ));

            var closestXfront, minXfront, diffXfront;
            for (var i = 0; i < inst.snappingPosition.v.length; i++){
                diffXfront = Math.abs(inst.snappingPosition.v[i] - left);
                if (!minXfront || minXfront > diffXfront){
                    minXfront = diffXfront;
                    closestXfront = inst.snappingPosition.v[i];
                }
            }

            var closestXback, minXback, diffXback;
            for (var i = 0; i < inst.snappingPosition.v.length; i++){
                diffXback = Math.abs(inst.snappingPosition.v[i] - (left + this.width()));
                if (!minXback || minXback > diffXback){
                    minXback = diffXback;
                    closestXback = inst.snappingPosition.v[i];
                }
            }

            var closestYfront, minYfront, diffYfront;
            for (var i = 0; i < inst.snappingPosition.h.length; i++){
                diffYfront = Math.abs(inst.snappingPosition.h[i] - top);
                if (!minYfront || minYfront > diffYfront){
                    minYfront = diffYfront;
                    closestYfront = inst.snappingPosition.h[i];
                }
            }

            var closestYback, minYback, diffYback;
            for (var i = 0; i < inst.snappingPosition.h.length; i++){
                diffYback = Math.abs(inst.snappingPosition.h[i] - (top + this.height()));
                if (!minYback || minYback > diffYback){
                    minYback = diffYback;
                    closestYback = inst.snappingPosition.h[i];
                }
            }

            if (minXfront <= minXback && minXfront < o.snapToObjectsTolerance){
                inst.guides.v.css('left', closestXfront + 'px').show();
                ui.position.left = closestXfront;
            }
            if (minXback <= minXfront && minXback < o.snapToObjectsTolerance){
                inst.guides.v.css('left', closestXback + 'px').show();
                ui.position.left = closestXback - this.width();
            }

            if (minYfront <= minYback && minYfront < o.snapToObjectsTolerance){
                inst.guides.h.css('top', closestYfront + 'px').show();
                ui.position.top = closestYfront;
            }
            if (minYback <= minYfront && minYback < o.snapToObjectsTolerance){
                inst.guides.h.css('top', closestYback + 'px').show();
                ui.position.top = closestYback - this.height();
            }

//                getClosest = function(num1, num2, arr){
//                    var closest, min, diff1, diff2;
//                    for (var i = 0; i < arr.length; i++){
//                        diff1 = Math.abs(arr[i] - num1);
//                        diff2 = Math.abs(arr[i] - num2);
//                        if (!min || min > diff1 || min > diff2){
//                            closest = arr[i];
//                            min = Math.min(diff1, diff2);
//                        }
//                    }
//                    return closest;
//                },
//                closestLeft = getClosest(left, left + this.width(), inst.snappingPosition.v),
//                closestTop = getClosest(top, top + this.height(), inst.snappingPosition.h);
//
//            inst.guides.h.add(inst.guides.v).hide();
//
//            if (Math.abs(closestTop - top) < o.snapToObjectsTolerance){
//                inst.guides.h.css('top', closestTop + 'px').show();
//                ui.position.top = closestTop;
//            }
//            if (Math.abs(closestLeft - left) < o.snapToObjectsTolerance){
//                inst.guides.v.css('left', closestLeft + 'px').show();
//                ui.position.left = closestLeft;
//            }
        }
    },

    stop: function(event, ui){
        var guides = this.data('draggable').guides;
        guides.h.add(guides.v).hide();
    }
});