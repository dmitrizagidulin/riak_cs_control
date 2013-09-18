minispade.register('controllers', function() {

  RiakCsControl.DiskUsageController = Ember.ObjectController.extend({
  });

  /**
   * @class
   *
   * Pie chart mixin.
   */
  RiakCsControl.PieChart = Ember.Mixin.create(
    /** @scope RiakCsControl.PieChart.prototype */ {

    /**
     * Pie chart dimensions.
     */
    width: 250,
    height: 250,

    /**
     * Radius of the pie chart.
     *
     * @returns {number}
     */
    radius: function() {
      var width = this.get('width');
      var height = this.get('height');

      return Math.min(width, height) / 2;
    }.property('width', 'height'),

    /**
     * Arc rendering function, computed from outer and inner radius.
     *
     * @returns {function}
     */
    arc: function() {
      var radius = this.get('radius');

      return d3.svg.arc().outerRadius(radius - 9);  // innerRadius(radius - 20).
    }.property('radius'),

    /**
     * Generate an svg, and insert into the DOM.
     *
     * @returns {function}
     */
    svg: function() {
      var id = this.get('id');
      var width = this.get('width');
      var height = this.get('height');

      return d3.select(id).
        append("svg").
          attr("width", width).
          attr("height", height).
        append("g").
          attr("transform",
               "translate(" + width / 2 + "," + height / 2 + ")");
    }.property('width', 'height', 'id'),

    /**
     * Observer which redraws the path components into the svg element 
     * as the data changes, while also triggering the motion tween.
     *
     * @returns {true}
     */
    path: function() {
      var svg =      this.get('svg');
      var arc =      this.get('arc');
      var pie =      this.get('pie');
      var data =     this.get('data');
      var arcTween = this.get('arcTween');

      var normalColor =   this.get('normalColor');
      var abnormalColor = this.get('abnormalColor');

      var path = svg.selectAll("path").data(pie(data));

      // Data looks like: [normalizedOtherDiskUsed, normalizedUserObjects, normalizedDiskFree]
      // 0089B2 - blue, 42AB5B - green, A16A9A - purple

      path.enter().append("path");

      var colors = ["#A16A9A", "#42AB5B", "#0089B2"];

      path.attr("fill", function(d, i) {
                  return colors[i]; }).
          attr("d", arc).
          style("stroke", "rgba(0, 0, 0, .7)").
          style("stroke-width", "1px").
          each(function(d) { this._current = d; });

      path.transition().duration(750).attrTween("d", arcTween);

      return true;
    }.observes('data'),

    /**
     * Tween interpolation function for arcs.
     *
     * @returns {function}
     */
    arcTween: function() {
      var arc = this.get('arc');

      return function(a) {
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function(t) {
          return arc(i(t));
        };
      };
    }.property('arc'),

    /**
     * Generate a pie chart layout.
     *
     * @returns {function}
     */
    pie: function() {
      return d3.layout.pie().sort(null);
    }.property(),

    /**
     * Whenever the view is reinserted into the DOM, re-render
     * the path components into the view.
     *
     * @returns {void}
     */
    didInsertElement: function() {
      // Force rendering when the view is reinserted into the DOM.
      this.path();
    },

    /**
     * Return normalized abnormal amount.
     *
     * @returns {number}
     *
     */
    normalizedAbnormal: function() {
      return this.get('data')[0];
    }.property('data')
  });

  RiakCsControl.UsersIndexController = Ember.ArrayController.extend({
    sortProperties: ['isNormal', 'email'],

    filteredContent: function() {
      var filterValue = this.get('filterValue');
      var arrangedContent = this.get('arrangedContent');

      if(arrangedContent && filterValue) {
        return arrangedContent.filter(function(item) {
          return item.get('name').match(new RegExp(filterValue)) ||
                 item.get('email').match(new RegExp(filterValue));
        });
      } else {
        return arrangedContent;
      }
    }.property('arrangedContent', 'filterValue'),

    filteredContentEmpty: function() {
      return this.get('filteredContent.length') <= 0;
    }.property('filteredContent', 'filteredContent.@each'),

    enableUser: function(user) {
      this.performUserUpdate(user, function() { user.enable(); });
    },

    disableUser: function(user) {
      this.performUserUpdate(user, function() { user.disable(); });
    },

    revokeCredentials: function(user) {
      this.performUserUpdate(user, function() { user.revoke(); });
    },

    performUserUpdate: function(user, update) {
      var transaction = RiakCsControl.get('store').transaction();

      transaction.add(user);
      update.call(user);
      transaction.commit();
    }
  });

  RiakCsControl.UsersNewController = Ember.ObjectController.extend({
    createUser: function() {
      var transaction = this.get('content.transaction');
      var content = this.get('content');

      // Handle the success case, once the record is confirmed,
      // materialize the record by forcing a load again (unfortunate)
      // and redirect back to the main page.
      content.addObserver('id', this, 'viewUsers');

      // Handle error states.
      //
      content.one('becameError', function() {
        this.set('errorState', true);
      });

      content.one('becameInvalid', function() {
        this.set('errorState', true);
      });

      content.one('becameClean', function() {
        this.set('errorState', false);
      });

      transaction.commit();
    },

    viewUsers: function(user) {
      RiakCsControl.User.find(user.get('id'));
      this.transitionToRoute('users.index');
    }
  });

});
