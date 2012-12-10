var assert = require('assert')
  , milestoneJS = require('../src/milestone.js')
  ;

describe('Milestone Test', function () {
  it('should generate an exception, when complete is called doubly', function () {
    var milestone = new milestoneJS.Milestone()
      ;

    try {
      milestone.complete('done');
      milestone.complete('donedone');
    } catch(err) {
      assert.equal('This Missions has already been completed', err.message);
    }
  });

  it('should generate an exception, when reject is called doubly', function () {
    var milestone = new milestoneJS.Milestone()
      ;

    try {
      milestone.reject('oops');
      milestone.reject('oopsoops');
    } catch(err) {
      assert.equal('This Missions has already been completed', err.message);
    }
  });
});

describe('Mission Test', function () {
  it('can publish that came at basecamp', function (done) {
    var mission = countThirtyMsec(), baseCamp = [];
    mission.on('comeAt1', function (idx) {
      assert.equal(1, idx);
      baseCamp.push(idx);
    });

    mission.on('comeAt2', function (idx) {
      assert.equal(2, idx);
      baseCamp.push(idx);
    });

    mission.complete(function (idx) {
      baseCamp.push(idx);
    }).complete(function (idx) {
      assert.equal(3, idx);
      assert.deepEqual([1, 2, 3], baseCamp);
      done();
    });
  });

  it('should perform reject api, when fail callback is called', function (done) {
    var mission = failMission(), baseCamp = [];
    mission.on('comeAt1', function (idx) {
      assert.equal(1, idx);
      baseCamp.push(idx);
    });

    mission.on('comeAt2', function (idx) {
      assert.equal(2, idx);
      baseCamp.push(idx);
    });

    mission.fail(function (err) {
      assert.equal('oh my god...', err);
      done();
    });
  });

  it('performs real time, When complete handler is registered into already completed mission', function (done) {
    var milestone = new milestoneJS.Milestone()
      , mission = milestone.mission
      ;

    milestone.complete('done');
    mission.complete(function (msg) {
      assert.equal('done', msg);
      done();
    });
  });

  it('performs real time, When fail handler is registered into already reject mission', function (done) {
    var milestone = new milestoneJS.Milestone()
      , mission = milestone.mission
      ;

    milestone.reject('err');
    mission.fail(function (msg) {
      assert.equal('err', msg);
      done();
    });
  });

  it('performs real time, When then handlers is registered into already complete mission', function (done) {
    var milestone = new milestoneJS.Milestone()
      , mission = milestone.mission
      ;

    milestone.complete('done');
    mission.then(function (msg) {
      assert.equal('done', msg);
      done();
    }, function () {
      // nothing to do
    });
  });

  it('performs real time, When then handlers is registered into already reject mission', function (done) {
    var milestone = new milestoneJS.Milestone()
      , mission = milestone.mission
      ;

    milestone.reject('err');
    mission.then(function () {
      // nothing to do
    }, function (err) {
      assert.equal('err', err);
      done();
    });
  });
});

describe('Grouping Test', function () {
  it('can wait that all missions complete', function (done) {
    var mission1 = countTwentyMsec()
      , mission2 = countThirtyMsec()
      ;

    milestoneJS.when({
      a: mission1,
      b: mission2
    }).complete(function (res) {
      assert.equal(2, res.a);
      assert.equal(3, res.b);
      done();
    });
  });

  it('should perform some of reject api, when fail callback is called', function (done) {
    var mission1 = countTwentyMsec()
      , mission2 = countThirtyMsec()
      , mission3 = failMission()
      ;

    milestoneJS.when({
      a: mission1,
      b: mission2,
      c: mission3
    }).fail(function (err) {
      assert.equal('oh my god...', err);
      done();
    });
  });
});

function countTwentyMsec() {
  var milestone = new milestoneJS.Milestone()
    ;

  (function a(idx) {
    var baseCamp;

    if (idx === 2) {
      milestone.complete(idx);
      return;
    } else {
      baseCamp = 'comeAt' + idx;
      milestone.comeAt(baseCamp, idx);
    }

    setTimeout(function () {
      a(++idx);
    }, 10);
  }(0));

  return milestone.mission;
}

function countThirtyMsec() {
  var milestone = new milestoneJS.Milestone()
    ;

  (function a(idx) {
    var baseCamp;

    if (idx === 3) {
      milestone.complete(idx);
      return;
    } else {
      baseCamp = 'comeAt' + idx;
      milestone.comeAt(baseCamp, idx);
    }

    setTimeout(function () {
      a(++idx);
    }, 10);
  }(0));

  return milestone.mission;
}

function failMission() {
  var milestone = new milestoneJS.Milestone()
    ;

  (function a(idx) {
    var baseCamp;

    if (idx === 3) {
      milestone.reject('oh my god...');
      return;
    } else {
      baseCamp = 'comeAt' + idx;
      milestone.comeAt(baseCamp, idx);
    }

    setTimeout(function () {
      a(++idx);
    }, 10);
  }(0));

  return milestone.mission;
}
