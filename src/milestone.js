(function () {

  var milestone = {}
    , root = this
    , EventEmitter = require('events').EventEmitter
    , toArray = Array.prototype.slice
    ;

  function notifyAll(value, heart) {
    var finished = heart.finished
      , waiting = heart.waiting
      , i, l
      ;

    if (heart.finished) {
      throw new Error('This Missions has already been completed');
    }
    heart.result = value;
    heart.finished = true;
    for (i = 0, l = waiting.length; i < l; i++) {
      notify(waiting[i], heart);
    }
  }

  function notify(listener, heart) {
    var handler = (heart.isError ? listener.error : listener.resolved);
      ;
    if (handler) {
      (function () {
        var result = handler(heart.result);
      }());
    }
  }

  function Milestone() {
    var emitter = new EventEmitter()
      , heart
      ;

    heart = {
      waiting: [],
      result: null,
      finished: false,
      isError: false
    };

    emitter.setMaxListeners(0);
    this.mission = new Mission(emitter, heart);
    this.__emitter = emitter;
    this.__heart = heart;
  };

  Milestone.prototype.comeAt = function () {
    var args = toArray.call(arguments)
      ;

    this.__emitter.emit.apply(this.__emitter, args);
  };

  Milestone.prototype.complete = function (value) {
    notifyAll(value, this.__heart);
  };

  Milestone.prototype.reject = function (err) {
    var heart = this.__heart;
    heart.isError = true;
    notifyAll(err, this.__heart);
  };

  function Mission(emitter, heart) {
    this.__emitter = emitter;
    this.__heart = heart;
  }

  Mission.prototype.on = function (basecamp, callback) {
    this.__emitter.on(basecamp, callback);
    return this;
  };

  Mission.prototype.then = function (resolveCb, errorCb) {
    var heart = this.__heart
      , listener = {resolved: resolveCb, error: errorCb}
      ;

    if (heart.finished) {
      notify(listener, heart);
    } else {
      heart.waiting.push(listener);
    }
    return this;

  };

  Mission.prototype.complete = function (callback) {
    var heart = this.__heart
      , listener = {resolved: callback, error: null}
      ;

    if (heart.finished) {
      notify(listener, heart);
    } else {
      heart.waiting.push(listener);
    }
    return this;
  };

  Mission.prototype.fail = function (callback) {
    var heart = this.__heart
      , listener = {resolved: null, error: callback}
      ;

    if (heart.finished) {
      notify(listener, heart);
    } else {
      heart.waiting.push(listener);
    }
    return this;
  };

  Mission.prototype.finish = function (callback) {
    var heart = this.__heart
      , listener = {resolved: callback, error: callback}
      ;

    if (heart.finished) {
      notify(listener, heart);
    } else {
      heart.waiting.push(listener);
    }
    return this;
  };

  Mission.prototype.isCompleted = function () {
    var heart = this.__heart
      ;

    if (heart.finished && !heart.isError) {
      return true;
    }
    return false;
  };

  Mission.prototype.isRejected = function () {
    var heart = this.__heart
      ;

    if (heart.finished && heart.isError) {
      return true;
    }
    return false;
  };

  milestone.Milestone = Milestone;
  milestone.when = function (missions) {
    var milestone = new Milestone()
      , missionNames = Object.keys(missions)
      , len = missionNames.length
      , result = {}
      , fulfilled = 0
      ;

    missionNames.forEach(function (missionName, idx) {
      var mission = missions[missionName]
        ;

      mission.then(function (name) {
        return function (data) {
          fulfilled++;
          result[name] = data;
          if (fulfilled === len) {
            milestone.complete(result);
          }
        };
      }(missionName), function (name) {
        return function (err) {
          milestone.reject(err);
        }
      }(missionName));
    });

    return milestone.mission;
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = milestone;
  } else {
    root.milestoneJS = milestone;
  }
}());
