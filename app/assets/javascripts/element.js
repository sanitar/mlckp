Mock.namespace('Mock.element.nav');
Mock.namespace('Mock.element.params');

Mock.element.Collection = Mock.ModelCollection.extend({
    url: 'elements'
});

/* ---------------------------------------------- */
/* ---------------- navigation ------------------ */

Mock.element.nav.View = Backbone.View.extend({
    events: {
        'click .icon-pencil': 'clickEdit',
        'click .icon-trash': 'clickDelete'
    },

    initialize: function(o){
        $.extend(this, o);
        this.model.on('change:name', this.onChangeName.createDelegate(this));
        this.model.on('remove', this.onModelRemove.createDelegate(this));
        this.render();
    },

    render: function(){
        var template = _.template($('#element-item-template').html());

        this.$el = $(template(this.model.toJSON()));
        this.el = this.$el.get()[0];
        this.root.append(this.el);

        this.$el.hover(function(){
            $(this).find('span').toggle();
        });
    },

    clickEdit: function(){
        $(this).trigger('editelement', [this, this.model]);
        return false;
    },

    clickDelete: function(){
        $(this).trigger('deleteelement', [this, this.model]);
        return false;
    },

    onChangeName: function(model, text, changes){
        var el = this.$el.find('a'),
            html = el.html();
        html = html.substring(html.indexOf('<span'), html.length - 1);
        el.html(text + html);
    },

    onModelRemove: function(){
        this.remove();
        this.$el.unbind();
    }
});

Mock.element.nav.Controller = Mock.extend(null, {
    initialize: function(o){
        $.extend(this, o);
        this.$el = $('#element ul');
        this.initComponents();
        this.initEvents();
        this.render();
    },

    initComponents: function(){
        this.views = new Mock.Collection();
        this.dialog = new Mock.dialog.AddEditDialog({
           addHeader: 'Add Element',
           editHeader: 'Edit Element'
        });
    },

    initEvents: function(){
        $(this.dialog).on('save', this.save.createDelegate(this));
        $('#element .icon-plus').click(this.onAddClick.createDelegate(this));
    },

    render: function(){
        var self = this;
        this.collection.each(function(item, index){
            self.createView(item);
        });
    },

    createView: function(model){
        var view = new Mock.element.nav.View({
            model: model,
            root: this.$el
        });
        this.views.add(view);
        $(view).bind('editelement', this.onEditClick.createDelegate(this));
        $(view).bind('deleteelement', this.onRemoveClick.createDelegate(this));
    },

    onAddClick: function(){
        this.dialog.show();
    },

    onEditClick: function(e, view, model){
        this.editModel = model;
        this.dialog.show(model.attributes.name);
    },

    onRemoveClick: function(e, view, model){
        if (confirm('Do you really want to delete element "'+ model.attributes[this.nameAttr] + '"?')){
            this.collection.remove(model);
            this.collection.save();
            $(this).trigger('remove', model);
        }
    },

    save: function (e, isEdit, text){
        var self = this;
        if (isEdit){
            this.editModel.set('name', text);
            this.collection.save();
        } else {
             var model = this.collection.add({
                 'name': text,
                 'element_group_id': 1
             }).last();
            this.collection.save({
                'success': function(model, data){
                    self.createView(model[0]);
                }
            });
        }
    },

    select: function(element_id){
        $('#element ul li').removeClass('active');
        $('#el' + element_id).addClass('active');
    }
});

/* ---------------------------------------------- */
/* ---------------- code Editors ------------------ */

Mock.element.CodeEditor = Mock.extend(null, {
    initialize: function(o){
        $.extend(this, o);
        this.initComponents();
        this.initEvents();
        this.values = {
            html: '',
            css: '',
            js: ''
        }
    },

    initComponents: function(){
        var conf = {
             tabMode: "indent",
             lineNumbers: true,
             value: '',
             onBlur: this.updateCode.createDelegate(this)
         }
         this.html = CodeMirror.fromTextArea($('#html')[0], $.extend({ mode: "htmlmixed" }, conf));
         this.css = CodeMirror.fromTextArea($('#css')[0], $.extend({ mode: "css" }, conf));
         this.js = CodeMirror.fromTextArea($('#js')[0], $.extend({ mode: "javascript" }, conf));
    },

    initEvents: function(){
    },

    toggle: function(enable){
        this.makeAction('setOption', 'readOnly', !enable);
        $('#workspace').toggleClass('disabled', !enable);
    },

    //private
    makeAction: function(action){
        var args = Array.prototype.slice.call(arguments, 1);
        this.html[action].apply(this, args);
        this.css[action].apply(this, args);
        this.js[action].apply(this, args);
    },

    updateCode: function(funcs, conf){
        var self = this,
            changeset = {};

        var func = function(mode){
            var val = self[mode].getValue();
            if (val !== self.values[mode]){
                changeset[mode] = val;
                self.values[mode] = val;
            }
        }
        func(conf.mode == 'htmlmixed' ? 'html' : conf.mode);
        if (!$.isEmptyObject(changeset)){
            $(this).trigger('update', changeset);
        }
    },

    load: function(model){
        var attrs = model ? model.attributes : {};
        this.html.setValue(attrs.html || '');
        this.css.setValue(attrs.css || '');
        this.js.setValue(attrs.js || '');
        this.values = {
            html: attrs.html || '',
            css: attrs.css || '',
            js: attrs.js || ''
        }
    }
});

/* ---------------------------------------------- */
/* ------------------ params -------------------- */

Mock.element.params.Initial = Mock.extend(null, {
    values: null,
    initialize: function(o){
        $.extend(this, o);
        this.initComponents();
        this.initEvents();
    },

    initComponents: function(){
        this.$el = $('#initial');
    },

    initEvents: function(){
        this.$el.find('input[name="r"], input[name="x"], input[name="y"]').on('click', this.onClickResizable.createDelegate(this));
        this.$el.find('input:checkbox').on('click', this.update.createDelegate(this));
        this.$el.find('input:not(:checkbox)').on('blur', this.update.createDelegate(this));
    },

    load: function(initial){
        this.values = initial;
        for (var name in initial){
            if (name == 'r'){
                this.$el.find('input[name="x"]').attr('checked', initial[name].x);
                this.$el.find('input[name="y"]').attr('checked', initial[name].y);
            } else {
                var el = this.$el.find('input[name="' + name + '"]');
                el.is(':checkbox') ? el.attr('checked', initial[name]) : el.val(initial[name])
            }
        }
        this.updateResizable();
    },

    update: function(e, el){
        var el = $(el),
            name = el.prop('name'),
            has_changes = false,
            values = this.values;

        if (name == 'r' || name == 'x' || name == 'y'){
            var x_val = this.$el.find('input[name="x"]').is(':checked'),
                y_val = this.$el.find('input[name="y"]').is(':checked');
            if (values.r.x !== x_val || values.r.y !== y_val) {
                values.r.x = x_val;
                values.r.y = y_val;
                has_changes = true;
            }
        } else {
            var val = el.is(':checkbox') ? el.is(':checked') : el.val();
            if (values[name] !== val){
                values[name] = val;
                has_changes = true;
            }
        }
        if (has_changes){
            $(this).trigger('update', { initial: JSON.stringify(this.values) });
        }
    },

    updateResizable: function(){
        var r_el = this.$el.find('input[name="r"]'),
            x_el = this.$el.find('input[name="x"]'),
            y_el = this.$el.find('input[name="y"]'),
            resizable = x_el.is(':checked') || y_el.is(':checked');
        r_el.attr('checked', resizable);
        x_el.parents('tr').toggle(resizable);
        y_el.parents('tr').toggle(resizable);
    },

    onClickResizable: function(e, el){
        if ($(el).prop('name') == 'r'){
            var tr = $(el).parents('tr').next();
            tr.find('input').attr('checked', $(el).is(':checked'));
            tr.next().find('input').attr('checked', $(el).is(':checked'));
        }
        this.updateResizable();
    }
});

Mock.element.params.Controller = Mock.extend(null, {
    initialize: function(o){
        $.extend(this, o);
        this.initComponents();
        this.initEvents();
    },
    initComponents: function(){
        this.$el = $('#params');
        this.initial = new Mock.element.params.Initial();
    },
    initEvents: function(){
        $(this.initial).on('update', this.updateValues.createDelegate(this));
        this.$el.find('i.icon-chevron-down, i.icon-chevron-right').click(function(){
            $(this).parents('li').find('table').toggle($(this).hasClass('icon-chevron-right'));
            $(this).toggleClass('icon-chevron-down icon-chevron-right');
        });
    },

    load: function(model){
        if (model){
            this.initial.load($.parseJSON(model.attributes.initial));
        }
    },

    updateValues: function(e, changeset){
        $(this).trigger('update', changeset);
    },

    toggle: function(enable){
        this.$el.toggle(enable);
    }
  });

/* ---------------------------------------------- */
/* ---------------- controller ------------------ */

Mock.element.Controller = Backbone.Router.extend({
    current_model: null,
    routes: {
        ':element': 'load',
        '': 'load'
    },

    initialize: function(o){
        $.extend(this, o);
        this.initComponents();
        this.initEvents();
        Backbone.history.start();
    },

    initComponents: function(){
        this.collection = new Mock.element.Collection(Mock.data.elements);
        this.navigation = new Mock.element.nav.Controller({ collection: this.collection });
        this.codeEditors = new Mock.element.CodeEditor();
        this.params = new Mock.element.params.Controller();
    },

    initEvents: function(){
        $(this.navigation).on('remove', this.onRemoveModel.createDelegate(this));
        $(this.codeEditors).on('update', this.onUpdateCode.createDelegate(this));
        $(this.params).on('update', this.onUpdateCode.createDelegate(this));
    },

    load: function(element_id){
        var curr_model = this.current_model;
        if ((curr_model && (curr_model.attributes.id != element_id)) || !curr_model){
            var model = this.current_model = this.collection.get(element_id);
            this.navigation.select(element_id);

            this.codeEditors.toggle(element_id ? true : false);
            this.codeEditors.load(model);

            this.params.toggle(element_id ? true : false);
            this.params.load(model);
        }
    },

    onRemoveModel: function(e, model){
        if (this.current_model == model){
            this.navigate('#', {trigger: true});
        }
    },

    onUpdateCode: function(e, changeset){
        for (var i in changeset){
            this.current_model.set(i, changeset[i]);
        }
        this.collection.save();
    }
});
