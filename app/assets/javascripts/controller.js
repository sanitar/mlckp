Mock.namespace('Mock.Controller');

Mock.MocksController = Mock.extend(null, {
    pageLoads: {},
    current_page_id: null,

    initialize: function(o){
        $.extend(this, o);
        this.controllers = new Mock.Collection();
        this.collection = new Mock.block.BlocksCollection();
        this.collection.on('reset', this.onCollectionFetch.createDelegate(this));

        $('#groups .groups-content > p').on('dragstop', this.createMock.createDelegate(this));
        $('.block').live({
            'resizestop': this.updateMock.createDelegate(this),
            'editstop': this.onEditStopMock.createDelegate(this)
        });
        $('.block .btn-delete').live({
            'click': this.deleteMock.createDelegate(this)
        });
    },
    onEditStopMock: function(e, el, s1){
        console.log('edit stopped!!!', e, el, s1);
    },

    deleteMock: function(e, el){
        var block = $(el).parents('.block').toArray()[0],
            model = this.controllers.findBy('el', block)[0].model;
        this.collection.remove(model);
        this.collection.save();
    },

    createMock: function(e){
        var size = Mock.C.ws.offset();
        if ((e.pageX-10) > size.left && (e.pageY-10) > size.top){
            this.createModel(e);
        }
        this.collection.save();
    },

    updateMock: function(e, ui, el){
        var control = this.controllers.findBy('el', el)[0];
        control.updatePosition();
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

    createModel: function(e){
        var ws = Mock.C.ws,
            left = e.pageX - ws.offset().left - 10,
            top = e.pageY - ws.offset().top - 10,
            attrs = allElements.get(parseInt(e.target.id.replace('el',''))).attributes;

        console.log('before create: ', left, top);
        var item = this.collection.add([{
            element_id: attrs.id,
            params: JSON.stringify({
                x: left,
                y: top
            })
        }]).last();

        var controller = new Mock.block.BlockController({
            model: item
        });

        this.controllers.add(controller);
    }
});