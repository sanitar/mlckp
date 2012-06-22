(function( $, undefined ) {
    $.widget("ui.uiselectable", $.ui.selectable, {
        _create: function() {
            var self = this;
            $.ui.selectable.prototype._create.call(this);

            $(self.options.filter, self.element[0]).live({
                'click': self._blockClick.createDelegate(self),
                'dragstart': self._blockDragStart.createDelegate(self)
            });
        },

        _blockClick: function(e, el){
            console.log('block clicked');
            this.selectees = $(this.options.filter, this.element[0]);
            var selected = this.selectees.filter('.ui-selected'),
            ifSelected = selected.filter(el).size() > 0,
            doSelect = !ifSelected || (selected.size() > 1 && ifSelected);

            if (!e.ctrlKey){
                selected.removeClass('ui-selected');
            }

            if (doSelect) {
                $(el).addClass('ui-selected');
            } else {
                $(el).removeClass('ui-selected');
            }

            if (this.options.autoRefresh) {
                this.refresh();
            }
        },

        _blockDragStart: function(e, h, el){
            console.log('block drag start');
            if (!$(el).hasClass('ui-selected')){
                this.selectees = $(this.options.filter, this.element[0]);
                this.selectees.filter('.ui-selected').removeClass('ui-selected');
                $(el).addClass('ui-selected');
            }
            if (this.options.autoRefresh) {
                this.refresh();
            }
        },

        _mouseStart: function(event){
            $.ui.selectable.prototype._mouseStart.call(this, event);
        },

        _mouseStop: function(event){
            $.ui.selectable.prototype._mouseStop.call(this, event);
        },

        destroy: function() {
            return this;
        }
    });

})(jQuery);
