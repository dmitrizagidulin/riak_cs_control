minispade.register('router', function() {

  RiakCsControl.Router.map(function() {
    this.resource('disk_usage');
    this.resource('users', function() {
      this.route('new');
    });
  });

  RiakCsControl.IndexRoute = Ember.Route.extend({
    redirect: function() {
      this.transitionTo('users.index');
    }
  });

  RiakCsControl.UsersIndexRoute = Ember.Route.extend({
    model: function() {
      return RiakCsControl.User.find();
    },

    setupController: function(controller, model) {
      controller.set('content', model);
    }
  });

  RiakCsControl.UsersNewRoute = Ember.Route.extend({
    model: function() {
      var transaction = this.get('store').transaction();
      return transaction.createRecord(RiakCsControl.User, {});
    },

    setupController: function(controller, model) {
      controller.set('content', model);
    },

    exit: function() {
      this._super();
      this.get('store').transaction().rollback();
    }
  });

  RiakCsControl.DiskUsageRoute = Ember.Route.extend({
    model: function() {
      var data = {"cluster_capacity":244277768,"cluster_disk_usage_kb":229621102,"cluster_disk_free_kb":14656666,"cluster_node_count":1,
                    "n_val":3,"object_storage_capacity_remaining_kb":4885555, "total_user_object_bytes":559020295,
                    "users":[{"user_key":"ZKTNR9-_DSYEXIHH6ZMJ","user_object_bytes":357713877},
                              {"user_key":"SSXCRXTTSRROQDC9WPX6","user_object_bytes":201306418}]};

      return RiakCsControl.DiskUsage.createRecord(data);
    },

    setupController: function(controller, model) {
      var totalUserObjectKB = Math.round(model.get('total_user_object_bytes') / 1024);
      model.set('total_user_object_bytes', totalUserObjectKB);
      controller.set('content', model);
    }
  });

});
