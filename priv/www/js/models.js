minispade.register('models', function() {

  DS.RESTAdapter.configure("plurals", {
    disk_usage: "disk_usage"
  });

  DS.Model.reopen({
    reload: function() {
      var store = this.get('store');
      var adapter = store.get('adapter');
      adapter.find(store, this.constructor, this.get('id'));
    }
  });

  DS.RecordArray.reopen({
    reload: function() {
      Ember.assert("Can only reload base RecordArrays",
        this.constructor === DS.RecordArray);
      var store = this.get('store');
      var adapter = store.get('adapter');
      adapter.findAll(store, this.get('type'));
      }
  });

  RiakCsControl.serializer = DS.JSONSerializer.create();

  RiakCsControl.serializer.configure('RiakCsControl.User', {
    primaryKey: 'key_id'
  });

  RiakCsControl.adapter = DS.RESTAdapter.create({
    serializer: RiakCsControl.serializer
  });

  RiakCsControl.Store = DS.Store.extend({
    revision: 11,
    adapter: RiakCsControl.adapter
  });

  RiakCsControl.store = RiakCsControl.Store.create();

  RiakCsControl.User = DS.Model.extend({
    name: DS.attr("string"),
    email: DS.attr("string"),
    key_id: DS.attr("string"),
    key_secret: DS.attr("string"),
    display_name: DS.attr("string"),
    new_key_secret: DS.attr("boolean"),

    admin: DS.attr("boolean"),

    status: DS.attr("string"),

    isDisabled: function() {
      return this.get('status') === 'disabled';
    }.property('status'),

    isNormal: function() {
        return this.get('admin') === false;
    }.property('admin'),

    isAdmin: function() {
      return this.get('admin');
    }.property('admin'),

    disable: function() {
      this.set('status', 'disabled');
    },

    enable: function() {
      this.set('status', 'enabled');
    },

    revoke: function() {
      this.set('new_key_secret', true);
    },

    didUpdate: function() {
      this.reload();
    }
  });

  RiakCsControl.DiskUsage = DS.Model.extend({
    cluster_capacity: DS.attr("number"),
    cluster_disk_usage_kb: DS.attr("number"),
    cluster_disk_free_kb: DS.attr("number"),
    object_storage_capacity_remaining_kb: DS.attr("number"),
    total_user_object_bytes: DS.attr("number"),
    cluster_node_count: DS.attr("number"),
    n_val: DS.attr("number")
  });

  RiakCsControl.DiskUsage.reopenClass({
    load: function() {
      // /disk_usage ajax response is in the form of:
      //              {"cluster_capacity":244277768,"cluster_disk_usage_kb":229621102,"cluster_disk_free_kb":14656666,"cluster_node_count":1,
      //               "n_val":3,"object_storage_capacity_remaining_kb":4885555, 
      //               "total_user_object_bytes":559020295,
      //               "users":[{"user_key":"ZKTNR9-_DSYEXIHH6ZMJ","user_object_bytes":357713877},
      //                         {"user_key":"SSXCRXTTSRROQDC9WPX6","user_object_bytes":201306418}]};

      var model = RiakCsControl.DiskUsage.createRecord({});

      $.getJSON("/disk_usage").then(function(response) {
        model.setProperties(response.disk_usage);
      });
      return model;
    }
  });

});
