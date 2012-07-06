Mock.namespace('Mock.page');

Mock.page.Collection = Backbone.Collection.extend({
    url: 'pages',
    initialize: function(o){
        $.extend(this, o);
    }
});

Mock.page.View = Backbone.View.extend({
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
        var template = _.template($('#page-item-template').html());
        this.$el = $(template(this.model.toJSON()));
        this.el = this.$el.get(0);
        $('#page ul').append(this.el);

        this.$el.hover(function(e, el){
            $(this).find('span').toggle();
        });
    },

    clickEdit: function(){
        $(this).trigger('editpage', [this, this.model]);
        return false;
    },

    clickDelete: function(){
        $(this).trigger('deletepage', [this, this.model]);
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
    }
});

Mock.page.Dialog = Mock.extend(Mock.dialog.Dialog, {
    options: {
        titlePrefix: 'page',
        dialogConfig: { minWidth: 350 },
        form: {
            'name': 'Name',
            'description': {
                type: 'textarea',
                label: 'Description'
            }
        }
    }
});

Mock.page.Controller = Backbone.Router.extend({
    routes: {
        ':element': 'load',
        '': 'load'
    },

    initialize: function(o){
        $.extend(this, o);
        this.current_page = -1;

        this.initComponents();
        this.initEvents();

        this.render();
    },

    initComponents: function(){
        this.collection = new Mock.page.Collection(Mock.data.pages);
        this.views = new Mock.Collection();
        this.dialog = new Mock.page.Dialog()
    },

    initEvents: function(){
        $(this.dialog).on('save', this.save.createDelegate(this));
        $('#page .icon-plus').click(this.onAddClick.createDelegate(this));
    },

    render: function(){
        var self = this;
        this.collection.each(function(item, index){
            self.createView(item);
        });
    },

    createView: function(model){
        var view = new Mock.page.View({
            model: model
        });
        this.views.add(view);
        $(view).bind('editpage', this.onEditClick.createDelegate(this));
        $(view).bind('deletepage', this.onRemoveClick.createDelegate(this));
    },

    onAddClick: function(){
        this.dialog.add();
    },

    onEditClick: function(e, view, model){
        this.editModel = model;
        this.dialog.edit(model.attributes);
    },

    onRemoveClick: function(e, view, model){
        if (confirm('Do you really want to delete page "'+ model.attributes['name'] + '"?')){
            if (model.attributes.id == this.current_page){
                this.navigate('#', { trigger: true }) ;
            }
            model.destroy();
        }
    },

    save: function (e, conf, dialog){
        var self = this;
        if (dialog.mode == 'add'){
            var model = this.collection.add(conf).last();
            model.save({}, {
                success: function(){
                    self.createView(model);
                }
            });
        } else {
            this.editModel.set(conf);
            this.editModel.save();
        }
    },

    load: function(el_id){
        this.current_page = el_id;
        $('#page ul li').removeClass('active');
        if (el_id){
            $('#el' + el_id).addClass('active');
        }
    }
});