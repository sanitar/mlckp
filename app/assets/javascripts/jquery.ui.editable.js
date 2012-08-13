(function( $, undefined ) {

$.widget("ui.editable", {
    widgetEventPrefix: 'edit',
    options: {
    },

    _create: function() {
        var o = this.options;
        this.element.on({
            'dblclick': this.show.createDelegate(this)
        });
    },

    show: function(){
        this._trigger('start');
        var self = this,
            el = this.element,
            pos = el.position();

        this.dragEl = this.element.parents('.ui-draggable');
        this.dragOption = this.dragEl.draggable('option', 'cancel');
        this.dragEl.draggable('option', 'cancel', 'textarea');

        this.textarea = $('<textarea/>').css({
            width: el.outerWidth(),
            height: el.outerHeight(),
            position: 'absolute',
            left: pos.left,
            top: pos.top
        });
        this.editText = el.text().trim();

        el.hide().parent().append(this.textarea);
        this.textarea.focus().val(this.editText).keyup(this._onKeyPress.createDelegate(this));
        $('body').on('mouseup', function(e){
            if (self.textarea[0] != e.target) self.hide();
        });
    },

    _onKeyPress: function(e, el){
        if (e.which == 27){ //esc
            this.hide(true);
        }
    },

    hide: function(silent){
        var text = this.textarea.val();
        if (silent !== true && this.editText !== text){
            this._trigger('stop', null, text);
            this.element.text(text);
        }
        this.textarea.remove();
        this.element.show();
        $('body').unbind('mouseup');
        this.dragEl.draggable('option', 'cancel', this.dragOption);
    },

    destroy: function() {
        return this;
    }
});

})(jQuery);
