(function($) {

    $.widget("ui.colorPicker", {
        widgetEventPrefix: 'color',
        options: {
            color: '#fff'
        },
        _tplPicker: '<div class="ui-color-picker">' +
            '<div class="ui-color-panel">' +
              '<div class="ui-colors"><div class="ui-color-current"></div><div class="ui-color-choosen"></div></div>' +
              '<div>R:&emsp; <input type="text" maxlength="3" class="input-number"/></div>' +
              '<div>G:&emsp; <input type="text" maxlength="3" class="input-number"/></div>' +
              '<div>B:&emsp; <input type="text" maxlength="3" class="input-number"/></div>' +
              '<div class="ui-color-hash"> #&emsp;<input type="text" maxlength="6" value="f4f4f4" /> </div>' +
              '<button>Ok <i class="icon-ok icon-white"></i></button>' +
            '</div>' +
            '<div class="ui-picker"></div>' +
          '</div>',

        _create: function() {
            this.pickerEl = $('.ui-color-picker');
            if (!this.pickerEl.size()) {
                this .pickerEl = $(this._tplPicker).appendTo('body').hide();
                this.pickerEl.draggable();
            }
            this.picker = $.farbtastic(this.pickerEl.find('.ui-picker'));
            this.rgbEl = {
                r: this.pickerEl.find(".ui-color-panel div:contains('R') input"),
                g: this.pickerEl.find('.ui-color-panel div:contains(G) input'),
                b: this.pickerEl.find('.ui-color-panel div:contains(B) input')
            }
            this.hashEl = this.pickerEl.find(".ui-color-hash input");
            this.colorEl = {
                current: this.pickerEl.find('.ui-color-current'),
                choosen: this.pickerEl.find('.ui-color-choosen')
            }
            this._initEvents();
        },

        bindEvents: function(){
            $('body').click(this._onBodyClick.createDelegate(this));
        },
        unbindEvents: function(){
            $('body').unbind('click');
        },

        _initEvents: function(){
            this.element.on('focus', this.show.createDelegate(this));

            this.picker.linkTo(this._updateColor.createDelegate(this));
            this.colorEl.current.click(this._onClickColor.createDelegate(this));

            this.pickerEl.find('.ui-color-panel input.input-number').on({
                keyup: this._onKeyUpRGB.createDelegate(this),
                change: this._onChange.createDelegate(this)
            });
            this.hashEl.on('keyup', this._onKeyUpHash.createDelegate(this));
            this.hashEl.on('change', this._onChange.createDelegate(this));
            this.pickerEl.find('button').click(this._onSubmit.createDelegate(this));
        },

        _setOption: function(key, value){
            if (key == 'color') this._setFieldColor(value);
        },

        show: function(){
            this.pickerEl.show();
            this.bindEvents();

            var el = this.element,
                off = el.offset(),
                val = el.val(),
                diff = off.left + this.pickerEl.width() - $(window).width();

            this.pickerEl.css({
                left: diff > 0 ? off.left - diff : off.left,
                top: off.top + el.outerHeight()
            });

            var iscolor = /^#[0-9abcdefABSDEF]{0,6}$/.test(val) && (val.length == 4 || val.length == 7);
            this.options.color = iscolor ? val : this.options.color;
            this.setColor(iscolor ? val : this.options.color);
        },

        hide: function(){
            this.pickerEl.hide();
            this.unbindEvents();
        },

        _setFieldColor: function(color){
            if (!color) return;
            var rgb = this.picker.unpack(color),
                rgb_sum = 0;

            for (var i = 0; i < 3; i++)
                rgb_sum += rgb[i];

            this.element.val(color).css({
                backgroundColor: color,
                color: rgb_sum > 1.5 ? '#555' : '#ddd'
            });
        },

        setColor: function(color, changed){
            this.picker.setColor(color);
            this.hashEl.val(color.slice(1));
            var rgb = this.rgbEl;
            rgb.r.val(Math.floor(this.picker.rgb[0]*255));
            rgb.g.val(Math.floor(this.picker.rgb[1]*255));
            rgb.b.val(Math.floor(this.picker.rgb[2]*255));
            this.colorEl.choosen.css({ backgroundColor: color });
            if (changed !== true) this.colorEl.current.css({ backgroundColor: color });
            this.options.color = color;
        },

        _updateColor: function(color){
            this.setColor(color, true);
            this.element.trigger('colorupdate', { color: color });
        },

        _onClickColor: function(e, el){
            var color = $(el).css('backgroundColor');
            this.setColor(this._RGBtoHEX(color));
        },

        _RGBtoHEX: function(rgb) {   // rgb in format: "rgb(255, 234, 149);"
            return "#" + $.map(rgb.match(/\b(\d+)\b/g), function(digit){
                return ('0' + parseInt(digit).toString(16)).slice(-2)
            }).join('');
        },

        _onKeyUpHash: function(e, el){
            var val = $(el).val();
            if (/^[0-9abcdefABSDEF]{1,6}$/.test(val)){
                this._updateColor('#' + val);
            }
        },

        _onChange: function(e, el){
            this._updateColor(this.picker.color);
        },

        _onKeyUpRGB: function(e, el){
            var val = $(el).val();
            if ($.isNumeric(val) && parseInt(val, 10) < 256){
                var rgb = [
                    this.rgbEl.r.val(),
                    this.rgbEl.g.val(),
                    this.rgbEl.b.val()
                ];
                this._updateColor(this._RGBtoHEX('rgb(' + rgb.join(' ,') + ');'));
            }
        },

        _onSubmit: function(e, el){
            this._setFieldColor(this.picker.color);
            this.element.trigger('colorchange', this.picker.color);
            this.hide();
        },

        _onBodyClick: function(e, el){
            if ($(e.target).parents('.ui-color-picker').size() == 0 && e.target != this.element[0]){
                this.hide();
            }
        }
    });
})(jQuery);
