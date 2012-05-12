(function( $, undefined ) {

$.widget("ui.editable", {
	widgetEventPrefix: 'edit',
        options: {
        },

	_create: function() {
            var o = this.options;
            this.element.on({
                'dblclick': this._blockDblClick.createDelegate(this)
            });
	},

        _blockDblClick: function(){
            var el = this.element;

            this._trigger('start');
            el.find('.content').hide();

            if (el.children('textarea').size() == 0){
                this.textarea = $('<textarea />').appendTo(el).css({
                    height: '100%',
                    width: '100%',
                    padding: '0'
                });
                this.textarea.on({
                    'blur': this.hideTextarea.createDelegate(this),
                    'keypress': this._onKeyPress.createDelegate(this)
                });
            } else {
                this.textarea = el.children('textarea');
                this.textarea.show();
            }
            this.cancelOption = el.draggable('option', 'cancel');
            el.draggable('option', 'cancel', 'textarea');
            this.textarea.focus();
        },

        _onKeyPress: function(e, el){
            if (e.which == 13){ //enter
                this.hideTextarea();
            }
        },

        hideTextarea: function(e, el){
            var textarea = this.element.children('textarea');
            textarea.hide();
            this.element.draggable('option', 'cancel', this.cancelOption);
            this.element.find('.content').show();
            this._trigger('stop', e, {
                text: textarea.val()
            });
        },

	destroy: function() {
            return this;
	}
});

})(jQuery);
