var assert = require('assert')
  , milestoneJS = require('../src/milestone.js')
  ;

describe('Milestone Test', function () {
  describe('complete Test', function () {
    describe('When complete is called doubly', function () {
      it('should generate an exception', function () {
        var milestone = new milestoneJS.Milestone()
          ;

        try {
          milestone.complete('done');
          milestone.complete('donedone');
        } catch(err) {
          assert.equal('This Missions has already been completed', err.message);
        }
      });
    });

    describe('When reject is called doubly', function () {
      it('should generate an exception', function () {
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
  });
});

describe('Mission Test', function () {
  describe('When you arrive at a base camp', function () {
    it('should notify', function (done) {
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
  });

  describe('When fail callback is called', function () {
    it('should perform reject api', function (done) {
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
  });

  describe('When complete handler is registered into already completed mission', function () {
    it('should performs real time', function (done) {
      var milestone = new milestoneJS.Milestone()
        , mission = milestone.mission
        ;

      milestone.complete('done');
      mission.complete(function (msg) {
        assert.equal('done', msg);
        done();
      });
    });
  });

  describe('When fail handler is registered into already reject mission', function () {
    it('should performs real time', function (done) {
      var milestone = new milestoneJS.Milestone()
        , mission = milestone.mission
        ;

      milestone.reject('err');
      mission.fail(function (msg) {
        assert.equal('err', msg);
        done();
      });
    });
  });

  describe('When then handlers is registered into already complete mission', function () {
    it('should performs real time', function (done) {
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
  });

  describe('When then handlers is registered into already reject mission', function () {
    it('should performs real time', function (done) {
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

  describe('finish Test', function () {
    describe('If it ends in a complete', function () {
      it('should be called', function (done) {
        var milestone = new milestoneJS.Milestone()
          , mission = milestone.mission
          ;

        setTimeout(function () {
          milestone.complete('done');
        }, 1);

        mission.finish(function (msg) {
          assert.equal('done', msg);
          done();
        });
      });
    });

    describe('If it ends in a reject', function () {
      it('should be called', function (done) {
        var milestone = new milestoneJS.Milestone()
          , mission = milestone.mission
          ;

        setTimeout(function () {
          milestone.reject('oops');
        }, 1);

        mission.finish(function (msg) {
          assert.equal('oops', msg);
          done();
        });
      });
    });

    it('can be chain should be possible', function (done) {
      var milestone = new milestoneJS.Milestone()
        , mission = milestone.mission
        ;

      setTimeout(function () {
        milestone.complete('done');
      }, 1);

      mission.finish(function (msg) {
        assert.equal('done', msg);
      }).finish(function (msg) {
        assert.equal('done', msg);
        done();
      });
    });
  });

  describe('isCompleted Test', function () {
    it('should show false, in the case of an uncompleted state', function () {
      var milestone = new milestoneJS.Milestone()
        , mission = milestone.mission
        ;

      assert.equal(false, mission.isCompleted());
    });

    describe('When having ended by complete', function () {
      it('should show true', function () {
        var milestone = new milestoneJS.Milestone()
          , mission = milestone.mission
          ;

        milestone.complete('done');
        assert.equal(true, mission.isCompleted());
      });
    });

    describe('When having ended by reject', function () {
      it('should show true', function () {
        var milestone = new milestoneJS.Milestone()
          , mission = milestone.mission
          ;

        milestone.reject('oops');
        assert.equal(false, mission.isCompleted());
      });
    });
  });

  describe('isRejected Test', function () {
    it('should show false, in the case of an uncompleted state', function () {
      var milestone = new milestoneJS.Milestone()
        , mission = milestone.mission
        ;

      assert.equal(false, mission.isRejected());
    });

    describe('When having ended by complete', function () {
      it('should show false', function () {
        var milestone = new milestoneJS.Milestone()
          , mission = milestone.mission
          ;

        milestone.complete('done');
        assert.equal(false, mission.isRejected());
      });
    });

    describe('When having ended by reject', function () {
      it('should show true', function () {
        var milestone = new milestoneJS.Milestone()
          , mission = milestone.mission
          ;

        milestone.reject('oops');
        assert.equal(true, mission.isRejected());
      });
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

  describe('When fail callback is called', function () {
    it('should perform some of reject api', function (done) {
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

  describe('When then handlers is registered into already complete mission', function () {
    it('should performs real time', function (done) {
      var milestone1 = new milestoneJS.Milestone
        , milestone2 = new milestoneJS.Milestone
        , mission1 = milestone1.mission
        , mission2 = milestone2.mission
        ;

      milestone1.complete('done');
      milestone2.complete('donedone');

      milestoneJS.when({
        a: mission1,
        b: mission2,
      }).complete(function (res) {
        assert.equal(res.a, 'done');
        assert.equal(res.b, 'donedone');
        done();
      });
    });
  });

  describe('When then handlers is registered into already reject mission', function () {
    it('should performs real time', function (done) {
      var milestone1 = new milestoneJS.Milestone
        , milestone2 = new milestoneJS.Milestone
        , mission1 = milestone1.mission
        , mission2 = milestone2.mission
        ;

      milestone1.complete('done');
      milestone2.reject('err');

      milestoneJS.when({
        a: mission1,
        b: mission2,
      }).fail(function (err) {
        assert.equal(err, 'err');
        done();
      });
    });
  });

  describe('When more than one of them to reject of Missions', function () {
    it('should be call fail handler', function (done) {
      var mission1 = failMission()
        , mission2 = failMission()
        ;

      milestoneJS.when({
        a: mission1,
        b: mission2
      }).fail(function (err) {
        assert.equal('oh my god...', err);
        done();
      });
    });
  });

  describe('When more than one of them to complete of Missions', function () {
    it('should be call complete handler', function (done) {
      var mission1 = countTwentyMsec()
        , mission2 = countTwentyMsec()
        ;

      milestoneJS.when({
        a: mission1,
        b: mission2
      }).complete(function (res) {
        assert.equal(2, res.a);
        assert.equal(2, res.a);
        done();
      });
    });
  });

  describe('When more than one of them to basecamp of Missions', function () {
    it('should call complete handler', function (done) {
      var mission1 = countTwentyMsec()
        , mission2 = countTwentyMsec()
        ;

      milestoneJS.when({
        a: mission1.createBaseCamp('comeAt1'),
        b: mission2
      }).complete(function (res) {
        assert.equal(1, res.a);
        assert.equal(2, res.b);
        done();
      });
    });
  });

  describe('When come at more than one basecamp', function () {
    it('should call complete handler', function (done) {
      var mission1 = countTwentyMsec()
        , mission2 = countThirtyMsec()
        ;

      milestoneJS.when({
        a: mission1.createBaseCamp('comeAt1'),
        b: mission2.createBaseCamp('comeAt2')
      }).complete(function (res) {
        assert.equal(1, res.a);
        assert.equal(2, res.b);
        done();
      });
    });
  });

  describe('Including a plurality of Mission in BaseCamp when there is even one reject', function () {
    it('should call fail handler', function (done) {
      var mission1 = countTwentyMsec()
        , mission2 = failMission()
        ;

      milestoneJS.when({
        a: mission1.createBaseCamp('comeAt1'),
        b: mission2
      }).fail(function (err) {
        assert.equal('oh my god...', err);
        done();
      });
    });
  });

  describe('among a plurality of BaseCamp or Mission, if there is a reject', function () {
    it('should call fail handler', function (done) {
      var mission1 = countTwentyMsec()
        , mission2 = failMission()
        ;

      milestoneJS.when({
        a: mission1,
        b: mission2.createBaseCamp('comeAt4')
      }).fail(function (err) {
        assert.equal('oh my god...', err);
        done();
      });
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
