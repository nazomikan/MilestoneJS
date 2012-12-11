<a name="README">[MilestoneJS](https://github.com/nazomikan/MilestoneJS)</a>
=======

**This is a library of asynchronous flow control, which is based on Promises/A.**


This library can express asynchronous processing more nearly intuitively.
And processing can be made to hook more flexibly by including EventEmitter further compared with general Promises/A library.



**Table of contents**

* [Usage](#Usage)
* [The API](#TheAPI)

## <a name="Usage">Usage</a>

**in Node.js**

install MilestoneJS with github `git clone git@github.com:nazomikan/MilestoneJS.git`, then require it as below.

    var Milestone = require('/path/to/MilestoneJS').Milestone;
      , milestone = new Milestone()
      ;

**in HTML**

load MilestoneJS as a script `<script type="text/javascript" src="/path/to/milestone-csjs.js"></script>`, then require it as below.

    var milestone = new milestoneJS.Milestone();

Then, write your module with `milestone`.

    var milestoneJS = require('MilestoneJS')
      , Milestone = milestoneJS.Milestone
      , mission
      , mission2
      ;

    function countTenSecond() {
      var milestone = new Milestone()
        ;

      (function a(idx) {
        var baseCamp;
        
        if (idx === 10) {
          milestone.complete(idx);
          return;
        } else {
          baseCamp = 'baseCamp' + idx;
          milestone.comeAt(baseCamp, idx);
        }

        setTimeout(function () {
          a(++idx);
        }, 1000);
      }(0));

      return milestone.mission;
    }

    mission = countTenSecond();
    mission.on('baseCamp1', function (idx) {
      console.log('1 second passed');
    });

    mission.on('baseCamp2', function (idx) {
      console.log('2 second passed');
    });

    mission.complete(function (time) {
      console.log('10 second passed');
    });

    mission2 = countTenSecond();

    milestoneJS.when({
      a: mission,
      b: mission2
    }).complete(function (res) {
      console.log(res.a);
      console.log(res.b);
    });

## <a name="TheAPI">The API</a>

Here is the whole API

**Milestone Object / Mission Object**

Instance of Milestone can be obtained as follows. 

    var milestoneJS = require('MilestoneJS')
      , milestone = new milestoneJS.Milestone()
      ;

By using milestoneJS, function returns `mission object`, without waiting for the delayed processing. 
Moreover, bind of the processing can be carried out by registering callback into `mission object` at the time of completion of delay processing. 

    function delay() {
      var milestone = new milestoneJS.Milestone()
        ;
      
      setTimeout(function () {
      	milestone.complete('done');
      }, 100);
       
      return milestone.mission;
    }
    
    delay().complete(function (msg) {
      console.log(msg); // output 'done'
    });

Moreover, not only the state of completion but its process can also be notified. 

    function delay() {
      var milestone = new milestoneJS.Milestone()
        ;
      
      setTimeout(function () {
      	milestone.comeAt('herf', '50msec ago');
      	setTimeout(function () {
      	  milestone.complete('done');
      	}, 50);
      }, 50);
      return milestone.mission;
    }
    
    delay().on('herf', function (msg) {
      console.log(msg); // output '50msec ago'
    }).complete(function (msg) {
      console.log(msg); // output 'done'
    });

Of course, failure in processing is also detectable. 

    function delay() {
      var milestone = new milestoneJS.Milestone()
        ;
      
      setTimeout(function () {
      	try {
      	  new Error('fuckin');
      	} catch(err) {
      	  milestone.reject(err);
      	}
      }, 50);
      return milestone.mission;
    }
    
    delay().fail(function (err) {
      console.log(err.message); // output 'fuckin'
    });

`then` is used to define the processing at the time of a success and failure simultaneously.

arg1: success callback

arg2: fail callback

    function delay() {
      var milestone = new milestoneJS.Milestone()
        ;
      
      setTimeout(function () {
      	try {
      	  if (+new Date % 2 === 0) {
      	    milestone.complete('done')
      	  } else {
      	    throw new Error('fuckin');
      	  }
      	} catch(err) {
      	  milestone.reject(err);
      	}
      }, 50);
      return milestone.mission;
    }
    
    // arg1 callback will be performed if it succeeds. 
    // However, arg2 callback will be performed if it has failed. 
    delay().then(function (msg) {
    	console.log(msg); // output 'done'
    }, function (err) {
    	console.log(err.message); // output 'fuckin'
    });


You might want to use `mission.finish()` if you want to execute when processing regardless of success or failure, `mission` is finished.

    var milestone = new milestoneJS.Milestone()
      , mission = milestone.mission
      ;

    setTimeout(function () {
        if (+new Date % 2 === 0) {
          milestone.complete('done');
        } else {
          milestone.reject('oops');
        }
    }, 1);

    mission.finish(function (msg) {
        console.log(msg); // output 'done' or 'oops'
    });


Branch of processing according to the state of `mission` is attained by using `mission.isCompleted()` and `mission.isRejected()`.

    var milestone = new milestoneJS.Milestone()
      , mission = milestone.mission
      , assert = require('assert')
      ;

    milestone.completed('done');
    assert.ok(mission.isCompleted()); // pass
    assert.fail(mission.isRejected()); // pass


**when method**

`when` will be used if processing is related with the end status of two or more `mission`. 

By using `when`, two or more `mission` can be treated just like one `mission`. 

    function delay() {
      var milestone = new milestoneJS.Milestone()
        ;
      
      setTimeout(function () {
      	mission.complete('done');
      }, 50);
    
      return milestone.mission;
    }
    
    var mission1 = delay();
    var mission2 = delay();
    
    milestoneJS.when({
      a: mission1,
      b: mission2
    }).complete(function (res) {
      console.log(res.a); // output 'done'
      console.log(res.b); // output 'done'
    }).fail(function (err) {
      console.log(err);
    });
