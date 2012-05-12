(function( $, undefined ) {

$.widget("ui.multidraggable", $.ui.mouse, {
	options: {
            filter: '*',
            dragOptions: {}
        },
        _create: function() {
            var self = this;
            $(self.options.filter, self.element[0]).live({
                'dragstart': self._blockDragStart.createDelegate(self),
                'drag': self._blockDrag.createDelegate(self),
                'dragstop': self._blockDragStop.createDelegate(self),
                'create': self._blockCreate.createDelegate(self),
                'remove': self._blockRemove.createDelegate(self)
            });
	},

        _blockCreate: function (e, el){
            $(el).draggable(this.options.dragOptions);
        },

        _blockRemove: function(e, el){
            $(el).unbind();
        },

        _blockDragStart: function(e, ui, el){
            this.selectees = $(this.options.filter, this.element[0]);
            var selected = this.selectees.filter('.ui-selected');
            this.multidrag = selected.size() > 1;
            this.multidragCfg = {
                objs: selected.not(el),
                offset: $(el).offset()
            };
            this.multidragCfg.objs.each(function(item){
                var el = $(this);
                el.data("offset", el.offset());
            });
        },

        _blockDrag: function(e, ui, el){
            if (!this.multidrag) return;
            var cfg = this.multidragCfg,
                dt = ui.position.top - cfg.offset.top,
                dl = ui.position.left - cfg.offset.left,
                parent = $(this.element),
                w = parent.width(), h = parent.height();

            $(cfg.objs).each(function(){
               var el = $(this),
                   off = el.data('offset'),
                   left = off.left + dl,
                   top = off.top + dt,
                   x_max = w - el.width(),
                   y_max = h - el.height();

               el.css({
                  top: top < 0 ? 0 : (top > y_max ? y_max : top),
                  left: left < 0 ? 0 : (left > x_max ? x_max : left)
               });
            });
        },

        _blockDragStop: function(e, ui, el){
             this._trigger("stop", e, {
                 dragged: this.multidragCfg.objs.add(el)
             });
        },

	destroy: function() {
            return this;
	}
});

})(jQuery);
