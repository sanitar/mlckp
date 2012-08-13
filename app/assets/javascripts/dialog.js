Mock.namespace('Mock.dialog');

Mock.dialog.Dialog = Mock.extend(null, {
    options: {
        dialogConfig: { title: '' },
        form: {}
    },
    mode: 'add',
    types: {
        text: { tpl: '<input type="text" name="{{name}}" />' },
        number: { tpl: '<input type="text" name="{{name}}" class="input-number" />' },
        textarea: { tpl: '<textarea name="{{name}}" ></textarea>' },
        checkbox: {
            tpl: '<input type="checkbox" name={{name}} />',
            set: function(value){
                $(this).attr('checked', value);
            },
            get: function(){
                return $(this).is(':checked');
            }
        },
        select: {tpl: '<select name="{{name}}">{{#each options}}<option>{{this}}</option>{{/each}}</select>' },
        list: {
            tpl: '<div class="list" name="{{name}}"><a><i class="icon-plus"></i></a></div>',
            set: function(values){
                var a = $(this).find('a');
                for (var i = 0; i < values.length; i++){
                    a.trigger('click');
                    $(this).find('div.list-item:last input').val(values[i]);
                }
                $(this).find('div.list-item input:focus').blur();
            },
            get: function(){
                return $(this).find('input').map(function(){
                    return $(this).val() || null;
                }).toArray();
            }
        },
        colorfield: {
            tpl: '<div class="input-append colorpicker" name="{{name}}"><input type="text" /><span class="add-on"><i class="icon-colorpicker"></i></span></span></div>',
            init: function(){
                $(this).find('input').colorPicker();
            },
            set: function(value){
                $(this).find('input').colorPicker('option', 'color', value);
            },
            get: function(value){
                return $(this).find('input').val();
            }
        }
    },

    initialize: function(o){
        $.extend(this.options, o);
        this.$el = $('<div class="dialog"></div>').appendTo('body');
        this.render();
        this.$el.dialog($.extend({
            autoOpen: false,
            modal: true,
            zIndex: 1032,
            buttons: {
                'Save': this.onClickSave.createDelegate(this),
                'Cancel': this.hide.createDelegate(this)
            }
        }, this.options.dialogConfig));

        $('.ui-dialog .ui-dialog-buttonset button').addClass('btn').first().addClass('btn-primary');
    },

    render: function(){
        this.fields = [];
        var f = this.options.form;
        if ($.isEmptyObject(f)) return;
        this.$el.append( $('<table/>').append(this.renderConfig(f)) );
    },

    //private
    renderConfig: function(config){
        var els = [];
        for (var name in config){
            var param = config[name];
            if (typeof param == 'string') param = { type: 'text',  label: param  }

            param.name = name;
            var type_cfg = this.types[param.type],
                el = $(Handlebars.compile(type_cfg.tpl)(param));

            if (type_cfg.init) type_cfg.init.apply(el);

            this.fields.push({
                el: el,
                config: param
            });

            var tr = $('<tr><td class="ui-dialog-label">' + param.label + ':&ensp;</td><td></td></tr>');
            tr.find('td:last').append(el);
            els.push(tr.get(0));
        }
        return $(els);
    },

    onClickSave: function(e, el){
        var values = this.getValues();
        $(this).trigger('save', values);
        this.$el.dialog('close');
    },

    show: function(){
        this.$el.dialog('open');
    },

    hide: function(){
        this.$el.dialog('close');
    },

    add: function(){
        this.mode = 'add';
        this.$el.dialog('option', 'title', 'Add ' + this.options.titlePrefix);
        this.show();
        this.$el.find('table tr td:not(.ui-dialog-label)').children().val('');
    },

    edit: function(attrs){
        this.mode = 'edit';
        this.$el.dialog('option', 'title', 'Edit ' + this.options.titlePrefix);
        this.show();
        this.setValues(attrs);
    },

    getValues: function(){
        var self = this,
            els = this.$el.find('table tr td:not(.ui-dialog-label)').children(),
            values = {};
        els.each(function(){
            var el = $(this),
                name = el.attr('name');
            if (!name) return;

            var field = $.findInArray(self.fields, function(item, index){
                return el.get(0) == item.el.get(0);
            });
            if (!field) return;
            var fn = self.types[field.config.type].get;
            values[name] = fn ? fn.apply(el) : el.val();
        });

        return values;
    },

    setValues: function(values){
        for (var i in values){
            var el = this.$el.find('[name="'+ i +'"]');
            var field = $.findInArray(this.fields, function(item, index){
                return el.get(0) == item.el.get(0);
            });
            if (!field) continue;
            var fn = this.types[field.config.type].set;
            fn ? fn.apply(el, values[i]) : el.val(values[i]);

        }
    }
});