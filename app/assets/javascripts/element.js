Mock.namespace('Mock.element');
Mock.namespace('Mock.element.nav');

Mock.element.Collection = Mock.ModelCollection.extend({
    url: 'elements/'
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
        this.model.on('destroy', this.onModelRemove.createDelegate(this));
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
            /*var id = model.attributes.id;
            if (id == this.current_page){
                this.navigate('#', { trigger: true });
            }
            model.destroy();*/
        }
    },

    save: function (e, isEdit, text){
        /*var self = this;
        if (isEdit){
            this.editModel.set('name', text);
            this.editModel.save();
        } else {
            var model = this.collection.add({
                'name': text,
                'element_group_id': 1
            }).last();
            model.save({}, {
                success: function(){
                    self.createView(model);
                }
            });
        }*/
    },

    select: function(element_id){
        $('#element ul li').removeClass('active');
        $('#el' + element_id).addClass('active');
    }
});

/* ---------------------------------------------- */
/* ---------------- controller ------------------ */

Mock.element.Controller = Backbone.Router.extend({
    current_id: null,
    routes: {
        ':element': 'load',
        '': 'load'
    },

    initialize: function(o){
        $.extend(this, o);
        this.initComponents();
        this.render();
        this.initEvents();
        Backbone.history.start();
    },

    initComponents: function(){
        this.collection = new Mock.element.Collection(Mock.data.elements);
        this.navigation = new Mock.element.nav.Controller({
            collection: this.collection
        });
    },

    render: function(){
        var self = this;
        this.collection.each(function(){

        });
    },

    initEvents: function(){

    },

    load: function(element_id){
        if (this.current_id !== element_id){
            this.current_id = element_id;
            this.navigation.select(element_id);
        }
    }
});

/*
Mock.element.View = Backbone.View.extend({
    events: {
        'click .icon-pencil': 'clickEdit',
        'click .icon-trash': 'clickDelete'
    },

    initialize: function(o){
        $.extend(this, o);
        this.tpl_id = '#element-item-template';

        this.model.on('change:name', this.onChangeName.createDelegate(this));
        this.model.on('destroy', this.onModelRemove.createDelegate(this));
        this.render();
    },

    render: function(){
        var template = _.template($(this.tpl_id).html());

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

Mock.element.Controller = Backbone.Router.extend({
    routes: {
        ':element': 'load',
        '': 'load'
    },

    initialize: function(o){
        $.extend(this, o);
        this.current_page = -1;
        this.$el = $('#element ul');

        this.initComponents();
        this.initEvents();
        this.render();
    },

    initComponents: function(){
        var self = this;
        this.views = new Mock.Collection();
        this.dialog = new Mock.dialog.AddEditDialog({
           addHeader: 'Add Element',
           editHeader: 'Edit Element'
        });
        // params list:
        $('#params li i').click(function(){
           $(this).parents('li').find('table').toggle($(this).hasClass('icon-chevron-right'));
           $(this).toggleClass('icon-chevron-down icon-chevron-right');
        });
        $('#initial table .initial-resizable input').click(function(){
            var checked = $(this).is(':checked');
            $(this).parents('tr').nextAll().not(':last')
                .toggle(checked).find('input').attr('checked', checked);
        });
        $('#initial table input.input-number').blur(function(){
           self.updateInitial();
        });
        $('#initial table input:checkbox').click(function(){
           self.updateInitial();
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
        var view = new Mock.element.View({
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
            var id = model.attributes.id;
            if (id == this.current_page){
                this.navigate('#', { trigger: true });
            }
            model.destroy();
        }
    },

    save: function (e, isEdit, text){
        var self = this;
        if (isEdit){
            this.editModel.set('name', text);
            this.editModel.save();
        } else {
            var model = this.collection.add({
                'name': text,
                'element_group_id': 1
            }).last();
            model.save({}, {
                success: function(){
                    self.createView(model);
                }
            });
        }
    },

    load: function(el_id){
        this.current_page = el_id;
        $('#element ul li').removeClass('active');
        $('#el' + el_id).addClass('active');
        $('#params > ul').toggle(el_id ? true : false);
        var model = elementCollection.get(el_id),
            initial = $.parseJSON(model.attributes.initial),
            trs = $('#initial table tr input');
        trs.eq(0).val(initial.w);
        trs.eq(1).val(initial.h);
        console.log(initial.r.x || initial.r.y);
        trs.eq(2).attr('checked', (initial.r.x || initial.r.y));
        trs.eq(3).attr('checked', initial.r.x);
        trs.eq(3).parents('tr').toggle(initial.r.x || initial.r.y);
        trs.eq(4).attr('checked', initial.r.y);
        trs.eq(4).parents('tr').toggle(initial.r.x || initial.r.y);
        trs.eq(5).attr('checked', initial.e);
    },

    updateInitial: function(){
        var inputs = $('#initial table tr input');
        var data = {
            'w': inputs.eq(0).val(),
            'h': inputs.eq(1).val(),
            'r': {
                x: inputs.eq(3).attr('checked') ? true : false,
                y: inputs.eq(4).attr('checked') ? true : false
            },
            'e': inputs.eq(5).attr('checked') ? true : false
        }
        var model = elementCollection.get(this.current_page);
        data = JSON.stringify(data);
        if (model.attributes.initial !== data){
            model.set('initial', data);
            model.save();
        }
    },
    updateCode: function(e, info){
        console.log('updateCode', e, info);
        var mode = info.mode == 'htmlmixed' ? 'html' : info.mode;
        console.log(mode);
    }
});*/