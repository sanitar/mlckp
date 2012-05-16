Mock.namespace('Mock.navigation');

Mock.navigation.Model = Backbone.Model.extend({
});

Mock.navigation.Collection = Backbone.Collection.extend({
    model: Mock.navigation.Model,
    initialize: function(o){
        $.extend(this, o);
    }

});

Mock.navigation.View = Backbone.View.extend({
    events: {
        'click .icon-pencil': 'clickEdit',
        'click .icon-trash': 'clickDelete'
    },

    initialize: function(o){
        $.extend(this, o);
        this.tpl_id = '#' + this.prefix + '-item-template';

        this.root = $(this.selector);
        this.model.on('change:' + this.nameAttr, this.onChangeName.createDelegate(this));
        this.model.on('destroy', this.onModelRemove.createDelegate(this));
        this.render();
    },

    render: function(){
        var template = _.template($(this.tpl_id).html());
        this.$el = $(template(this.model.toJSON()));
        this.el = this.$el.get()[0];
        this.root.append(this.el);

        this.$el.hover(function(e, el){
            $(this).find('span').toggle();
        });
    },

    clickEdit: function(){
        $(this).trigger('edit' + this.prefix, [this, this.model]);
        return false;
    },

    clickDelete: function(){
        $(this).trigger('delete' + this.prefix, [this, this.model]);
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

Mock.navigation.Controller = Backbone.Router.extend({
    prefix: 'nav',
    nameAttr: 'name',
    routes: {
        ':element': 'load'
    },

    initialize: function(o){
        $.extend(this, o);
        this.current_page = -1;
        this.views = new Mock.Collection({
            url: '/' + this.prefix
        });
        if (!this.selector) this.selector = '#' + this.prefix + ' ul';

        this.prefixCapital = this.prefix.charAt(0).toUpperCase() + this.prefix.slice(1);
        this.prefixPlural = this.prefix + 's';
        this.dialog = new Mock.dialog.AddEditDialog({
           addHeader: 'Add ' + this.prefixCapital,
           editHeader: 'Edit ' + this.prefixCapital
        });

        $(this.dialog).on('save', this.save.createDelegate(this));
        $('#' + this.prefix + ' .icon-plus').click(this.onAddClick.createDelegate(this));
        this.render();
    },

    render: function(){
        var self = this;

        this.collection.each(function(item, index){
            self.createView(item);
        });
    },

    createView: function(model){
        var view = new Mock.navigation.View({
            model: model,
            prefix: this.prefix,
            selector: this.selector,
            nameAttr: this.nameAttr
        });
        this.views.add(view);
        $(view).bind('edit' + this.prefix, this.onEditClick.createDelegate(this));
        $(view).bind('delete' + this.prefix, this.onRemoveClick.createDelegate(this));
    },

    onAddClick: function(){
        this.dialog.show();
    },

    onEditClick: function(e, view, model){
        this.editModel = model;
        this.dialog.show(model.attributes[this.nameAttr]);
    },

    onRemoveClick: function(e, view, model){
        if (confirm('Do you really want to delete ' + this.prefix + ' "'+ model.attributes[this.nameAttr] + '"?')){
            var id = model.attributes.id;
            if (id == this.current_page){
                this.navigate('#');
            }
            model.destroy();
            this.trigger('delete' + this.prefixPlural, [this, id]);
        }
    },

    save: function (e, isEdit, text){
        var self = this;
        if (isEdit){
            this.editModel.set(this.nameAttr, text);
            this.editModel.save({},{
                success: function(){
                    self.trigger('edit' + self.prefixPlural, [self, self.editModel]);
                }
            });
        } else {
            var cfg = {};
            cfg[this.nameAttr] = text;
            var model = this.collection.add(cfg).last();
            model.save({}, {
                success: function(){
                    self.createView(model);
                    self.trigger('add' + self.prefixPlural, [self, model]);
                }
            });
        }
    },

    load: function(el){
        this.current_page = el;
        $('#' + this.prefix + ' ul li').removeClass('active')
        $('#el' + el).addClass('active');
    }
});