minispade.register('views', function() {

  RiakCsControl.DiskUsageView = Ember.View.extend({
    templateName: 'disk_usage'
  });

  RiakCsControl.UsersNewView = Ember.View.extend({
    submit: function(ev) {
      this.get('controller').createUser();
    }
  });

  RiakCsControl.UsersIndexView = Ember.View.extend({
    isLoaded: function() {
      return this.get('controller.@each.isLoaded');
    }.property('controller.content.@each')
  });

  RiakCsControl.UsersItemView = Ember.View.extend({
    templateName: 'users/item',

    classNameBindings: ['isDisabled:disabled', 'isAdmin:admin'],

    nameBinding: 'content.name',
    emailBinding: 'content.email',
    keyIdBinding: 'content.key_id',

    isAdminBinding: 'content.isAdmin',
    isDisabledBinding: 'content.isDisabled',

    keySecret: function() {
      var key_secret = this.get('content.key_secret');
      var new_key_secret = this.get('content.new_key_secret');

      return new_key_secret ? "Revoking, please wait..." : key_secret;
    }.property('content.key_secret', 'content.new_key_secret')
  });

  RiakCsControl.UsersCollectionView = Ember.CollectionView.extend({
    tagName: 'tbody',
    itemViewClass: RiakCsControl.UsersItemView
  });

  RiakCsControl.ButtonView = Ember.View.extend({
    tagName: 'div',
    classNames: 'button-cell',

    templateName: 'users/button',

    click: function(ev) {
      ev.preventDefault();

      var content = this.get('content');
      var target = this.get('target');
      var controller = this.get('controller');
      var action = this.get('controller.' + target);

      action.call(controller, content);
    }
  });

  RiakCsControl.LoadingView = Ember.View.extend({
    tagName: 'div',

    didInsertElement: function () {
      var spinnerOpts = {
            lines:     13,        // The number of lines to draw
            length:    9,         // The length of each line
            width:     4,         // The line thickness
            radius:    10,        // The radius of the inner circle
            corners:   1,         // Corner roundness (0..1)
            rotate:    0,         // The rotation offset
            color:     '#000',    // #rgb or #rrggbb
            speed:     1,         // Rounds per second
            trail:     60,        // Afterglow percentage
            shadow:    false,     // Whether to render a shadow
            hwaccel:   false,     // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex:    2e9,       // The z-index (defaults to 2000000000)
            top:       '45px',    // Top position relative to parent in px
            left:      '70x'      // Left position relative to parent in px
          };
      this.set('spinner', new Spinner(spinnerOpts));
      this.spinner.spin(this.$()[0]);
    },

    willDestroyElement: function () {
      this.spinner.stop();
    }
  });

  RiakCsControl.UserFilterView = Ember.TextField.extend({
    valueBinding: 'controller.filterValue'
  });

  /**
   * @class
   *
   * Container view for the disk usage chart.
   */
  RiakCsControl.DiskUsageChart = Ember.View.extend(
    RiakCsControl.PieChart,
    /** @scope RiakCsControl.DiskUsageChart.prototype */ {
    templateName: 'disk_usage_chart',

    classNames: ['chart'],

    clusterDiskUsageKbBinding: 'controller.cluster_disk_usage_kb',
    clusterDiskFreeKbBinding: 'controller.cluster_disk_free_kb',
    clusterCapacityBinding: 'controller.cluster_capacity',
    totalUserObjectBytesBinding: 'controller.total_user_object_bytes',

    data: function() {
      var clusterDiskUsageKb = this.get('clusterDiskUsageKb');
      var clusterDiskFreeKb = this.get('clusterDiskFreeKb');
      var clusterCapacity = this.get('clusterCapacity');
      var totalUserObjectBytes = this.get('totalUserObjectBytes') * 3;

      var normalizedDiskFree;
      var normalizedUserObjects;
      var normalizedOtherDiskUsed;

      if(clusterDiskUsageKb > 0) {

        normalizedUserObjects = (totalUserObjectBytes / clusterCapacity) * 100;
        if(normalizedUserObjects > 1) {
          normalizedUserObjects = Math.round(normalizedUserObjects);
        } else {
          normalizedUserObjects = normalizedUserObjects.toFixed(2);
        }
        normalizedOtherDiskUsed = ((clusterDiskUsageKb - totalUserObjectBytes) / clusterCapacity) * 100;
        if(normalizedOtherDiskUsed > 1) {
          normalizedOtherDiskUsed = Math.round(normalizedOtherDiskUsed);
        } else {
          normalizedOtherDiskUsed = normalizedOtherDiskUsed.toFixed(2);
        }

        normalizedDiskFree = 100 - normalizedOtherDiskUsed - normalizedUserObjects;
      } else {
        // Default
        normalizedOtherDiskUsed = 0;
        normalizedUserObjects = 0;
        normalizedDiskFree = 100;
      }
      return [normalizedOtherDiskUsed, normalizedUserObjects, normalizedDiskFree];
    }.property('clusterDiskUsageKb', 'clusterDiskFreeKb', 'clusterCapacity'),

    id: '#disk-usage-chart',
    normalColor: "#0089B2",
    abnormalColor: "#42AB5B",
  });

});
