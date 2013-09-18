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
      return RiakCsControl.DiskUsage.load();
    },

    setupController: function(controller, model) {
      var totalUserObjectKB = Math.round(model.get('total_user_object_bytes') / 1024);
      model.set('total_user_object_bytes', totalUserObjectKB);
      controller.set('content', model);
    }
  });

});
