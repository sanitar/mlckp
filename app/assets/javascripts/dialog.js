Mock.namespace('Mock.dialog');

Mock.dialog.Dialog = Mock.extend(null, {
    options: {
        dialogConfig: { title: '' },
        form: {}
    },
    mode: 'add',
    types: {
        'text': '<input type="text" name="{{name}}" />',
        'textarea': '<textarea name="{{name}}" ></textarea>',
        'select': '<select name="{{name}}">{{#each options}}<option>{{this}}</option>{{/each}}</select>'
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
        var f = this.options.form;
        if ($.isEmptyObject(f)) return;

        var html = '<table><tbody>';
        for (var i in f){
            if (typeof f[i] == 'string') {
                f[i] = {
                    type: 'text',
                    label: f[i]
                }
            }
            html += '<tr><td class="ui-dialog-label">' + f[i].label + ':&ensp;</td><td>';
            f[i].name = i;
            html += Handlebars.compile(this.types[f[i].type])(f[i]);
            html += '</td></tr>';
        }
        html += '</tbody></table>';
        this.$el.append($(html));
    },

    onClickSave: function(e, el){
        var trs = $(el).find('table tr td:not(.ui-dialog-label)').children(),
            obj = {};
        trs.each(function(){
            obj[$(this).attr('name')] = $(this).val();
        });
        $(this).trigger('save', obj);
        this.$el.dialog('close');
    },

    show: function(){
        this.$el.dialog('open');
    },

    hide: function(){
        this.$el.dialog('close');
    },

    add: function(){
        this.$el.find('table tr td:not(.ui-dialog-label)').children().val('');
        this.mode = 'add';
        this.$el.dialog('option', 'title', 'Add ' + this.options.titlePrefix);
        this.show();
    },

    edit: function(attrs){
        for (var i in attrs){
            this.$el.find('[name="' + i + '"]').val(attrs[i]);
        }
        this.mode = 'edit';
        this.$el.dialog('option', 'title', 'Edit ' + this.options.titlePrefix);
        this.show();
    }
});