let assert = require('assert');
let memento = require('..');

describe('factory', function() {
    it('exists', function() {
        assert.equal(typeof memento, 'function');
    });
    it('returns an object', function() {
        assert.equal(typeof memento(), 'object');
    });
});

describe('watch', function() {
    it('exists', function() {
        assert.equal(typeof memento().watch, 'function');
    });
});

describe('node', function() {
    it('exists', function() {
        assert.equal(typeof memento().node, 'function');
    });
    it('stores the node', function() {
        let node = [];
        let instance = memento();
        instance.node(node)
        assert.equal(instance.node(), node);
    });
});

describe('actions', function() {
    describe('all', function() {
        it('returns an array', function() {
            let instance = memento();
            assert(typeof instance.all_actions, 'function');
            assert(instance.all_actions() instanceof Array);
            assert.equal(typeof instance.all_actions().length, 'number');
        });
    });
    describe('timed', function() {
        it('returns an array', function() {
            let node = {currentTime: 1};
            let instance = memento().node(node);
            assert(typeof instance.timed_actions, 'function');
            assert(instance.timed_actions() instanceof Array);
            assert.equal(typeof instance.timed_actions().length, 'number');
        });
    });
});

describe('mutation', function() {
    it('adds item', function() {
        let instance = memento().all_data([{a: 1}]);
        instance.add_item({b: 2});
        assert.equal(instance.all_data().length, 2);
    });
    it('remove item', function() {
        let instance = memento().all_data([{a: 1}]);
        instance.remove_item(0);
        assert.equal(instance.all_data().length, 0);
    });
});

describe('timestamp', function() {
    let instance = memento().node({currentTime: 1});
    it('retrieves node timestamp', function() {
        assert.equal(instance.timestamp(), 1);
    });
    it('rounds', function() {
        assert.equal(instance.rounded_timestamp(1.1), 1);
    });
    it('always rounds with Math.floor', function() {
        assert.equal(instance.rounded_timestamp(1.9), 1);
    });
});

describe('breakpoints', function() {
    it('tests single', function() {
        let instance = memento();
        let breakpoint = {low: 1, high: 3};
        let pass = instance.test_single_breakpoint(breakpoint, 2);
        let fail = instance.test_single_breakpoint(breakpoint, 4);
        assert.equal(pass, true);
        assert.equal(fail, false);
    });
    it('tests multiple', function() {
        let instance = memento();
        let breakpoints = [{low: 1, high: 4}, {low: 2, high: 6}];
        let first_result = instance.test_multiple_breakpoints(breakpoints, 3);
        let second_result = instance.test_multiple_breakpoints(breakpoints, 5);
        assert.equal(first_result[0], true);
        assert.equal(first_result[1], true);
        assert.equal(second_result[0], false);
        assert.equal(second_result[1], true);
    });
    it('automatically switches breakpoint testing modes', function() {
        let instance = memento();
        let single = {low: 1, high: 4};
        let multiple = [{low: 1, high: 4}, {low: 2, high: 6}];
        assert.equal(typeof instance.test_breakpoints(single, 2), 'boolean');
        assert.equal(typeof instance.test_breakpoints(multiple, 2).length, 'number');
    });
    it('has a breakpoints compilation method', function() {
        assert.equal(typeof memento().breakpoints, 'function');
    });
    it('finds nearest breakpoints', function() {
        let instance = memento();
        instance.breakpoints = function() {
            let breakpoints = [1, 2, 3, 4, 5];
            return breakpoints;
        }
        let result = instance.nearest_breakpoints(3.5);
        assert.equal(result.low, 3);
        assert.equal(result.high, 4);
    });
});

describe('data', function() {
    it('exists', function() {
        assert.equal(typeof memento().all_data, 'function');
    });
    it('stores data', function() {
        let data = [{a: 1}];
        let instance = memento();
        instance.all_data(data);
        assert.equal(instance.all_data(), data);
    });
    it('overwrites data', function() {
        let first = [{a: 1}];
        let second = [{a: 2}];
        let instance = memento();
        instance.all_data(first);
        instance.all_data(second);
        assert.notEqual(instance.all_data().pop().a, first.pop().a);
    });
});

describe('seconds helper', function() {
    let instance = memento();
    it('resolves strings', function() {
        assert.equal(instance.seconds('1:30'), 90);
        assert.equal(instance.seconds('2:35'), 155);
        assert.equal(instance.seconds('1:01:30'), 3690);
    });
    it('returns numbers transparently', function() {
        let test = 5;
        assert.equal(instance.seconds(test), test);
        assert.equal(typeof instance.seconds(test), 'number');
    });
});

describe('watching', function() {
    it('updates node', function() {
        let player = {currentTime: 2};
        let instance = memento().node(player);
        instance.watch();
        assert.equal(typeof instance.node().ontimeupdate, 'function');
    });
});

describe('integrations', function() {
    let player = {currentTime: 2};
    let datum = {start: 1, end: 3, value: 1};
    let instance = memento()
        .node(player)
        .all_data([datum]);
    instance.watch();
    describe('extend', function() {
        instance.extend('test', function(data, timestamp, node) {
            assert.equal(data.pop().value, datum.value);
            assert.equal(timestamp, player.currentTime);
            assert.equal(node, player);
        });
        it('exists', function() {
            assert.equal(typeof instance.extend, 'function');
        });
        it('extends', function() {
            assert.equal(typeof instance.test, 'function');
        });
        it('passes arguments', function() {
            instance.test();
        });
    });
    describe('tick', function() {
        it('exists', function() {
            assert.equal(typeof instance.tick, 'function');
        });
    });
    describe('trigger', function() {
        it('exists', function() {
            assert.equal(typeof instance.trigger, 'function');
        });
    });
});