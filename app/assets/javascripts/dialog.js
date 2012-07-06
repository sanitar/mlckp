
Mock.namespace('Mock.dialog');

Mock.dialog.AddEditDialog = Backbone.View.extend({
    isEdit: false,
    editHeader: 'Edit',
    addHeader: 'Add',
    elId: '#add-edit-dialog',
    events: {
        'click .btn-primary': 'onSaveClick'
    },

    initialize: function(cfg){
        $.extend(this, cfg);
        this.$el = $(this.elId).modal({ show: false });
        this.el = this.$el.get()[0];
    },

    show: function(text){
        this.isEdit = text ? true : false;
        this.$el.find('input').attr('value', text || "");
        this.$el.find('.modal-header > h4').text(text ? this.editHeader : this.addHeader);
        this.$el.modal('show');
    },

    hide: function(){
        this.$el.modal('hide');
    },

    onSaveClick: function(){
        this.hide();
        var text = this.$el.find('input').attr('value');
        $(this).trigger('save', [this.isEdit, text]);
        return false;
    }
});