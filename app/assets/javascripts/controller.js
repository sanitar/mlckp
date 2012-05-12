Mock.namespace('Mock.Controller');

Mock.Controller = Mock.extend(null, {
    pageLoads: {},
    current_page_id: null,

    initialize: function(o){
        $.extend(this, o);
        this.controllers = new Mock.Collection();
        this.collection = new Mock.block.BlocksCollection();
        this.collection.on('reset', this.onCollectionFetch.createDelegate(this));

        $('#groups .groups-content > p').on('dragstop', this.onDragStopElement.createDelegate(this));
        $('.block .btn-delete').live({
            'click': this.onDeleteElement.createDelegate(this)
        });
    },

    onDeleteElement: function(e, el){
        var block = $(el).parents('.block').toArray()[0],
            model = this.controllers.findBy('el', block)[0].model;
        this.collection.remove(model);
        this.collection.save();
    },

    fetch: function(page_id){
        var self = this;

        this.controllers.each(function(index, item){
            item.remove();
        });
        this.controllers.removeAll();

        if (this.pageLoads[page_id] !== undefined){
            this.collection.reset(this.pageLoads[page_id]);
            this.collection.url = 'pages/' + page_id + '/blocks';
        } else {
            this.collection.fetch({
                silent: true,
                url: 'pages/' + page_id + '/blocks',
                data: {
                    page_id: page_id
                },
                success: function(collection, data){
                    self.pageLoads[page_id] = data;
                    self.collection.url = 'pages/' + page_id + '/blocks';
                    self.onCollectionFetch(collection, data);
                }
            });
        }
        this.current_page_id = page_id;
    },

    save: function(){
        var changes = [];
        this.controllers.each(function(index, item){
            item.updatePosition();
        });
        this.collection.save();
    },

    onCollectionFetch: function(){
        var self = this;
        this.collection.each(function(item , index){
            var controller = new Mock.block.BlockController({
                model: item
            });
            self.controllers.add(controller);
        });
    },

    onDragStopElement: function(e, ui){
        var size = Mock.C.ws.offset();
        if ((e.pageX-10) > size.left && (e.pageY-10) > size.top){
            this.createModel(e, ui);
        }
        this.collection.save();
    },

    createModel: function(e, ui){
        var ws = Mock.C.ws,
            left = e.pageX - ws.offset().left - 10,
            top = e.pageY - ws.offset().top - 10,
            attrs = allElements.get(parseInt(e.target.id.replace('el',''))).attributes;

        var item = this.collection.add([{
            element_id: attrs.id,
            positionx: left,
            positiony: top
        }]).last();

        var controller = new Mock.block.BlockController({
            model: item
        });

        this.controllers.add(controller);
    }
});