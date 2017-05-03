let assert = require('assert');
let memento = require('..');

let noop = function() {
    return;
};

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
        let node = {nodeName: 'dummy'};
        let m = memento();
        m.node(node)
        assert.equal(m.node(), node);
    });
});

describe('actions', function() {
    describe('all', function() {
        it('returns an array', function() {
            let m = memento();
            assert(typeof m.allActions, 'function');
            assert(m.allActions() instanceof Array);
            assert.equal(typeof m.allActions().length, 'number');
        });
    });
    describe('timed', function() {
        it('returns an array', function() {
            let node = {currentTime: 1, nodeName: 'dummy'};
            let m = memento().node(node);
            assert(typeof m.timedActions, 'function');
            assert(m.timedActions() instanceof Array);
            assert.equal(typeof m.timedActions().length, 'number');
        });
    });
    describe('mutation', function() {
        it('adds', function() {
            let m = memento();
            m.tick({low: 3, high: 5}, noop);
            assert.equal(m.allActions().length, 1);
        });
    });
    describe('storage', function() {
        it('uses the expected storage format', function() {
            let m = memento();
            m.tick({low: 1, high: '1:30'}, noop);
            let action = m.allActions().pop();
            assert.equal(typeof action, 'object');
            assert.equal(Object.keys(action).length, 3);
            assert.equal(typeof action.start, 'number');
            assert.equal(typeof action.end, 'number');
            assert.equal(typeof action.function, 'function')
        });
        it('returns the original functions', function() {
            let m = memento();
            m.tick({low: 1, high: '1:30'}, noop);
            let action = m.allActions().pop();
            assert.equal(action.function, noop);
        });
    });
});

describe('mutation', function() {
    it('adds item', function() {
        let m = memento().payload([{a: 1}]);
        m.addItem({b: 2});
        assert.equal(m.payload().length, 2);
    });
    it('remove item', function() {
        let m = memento().payload([{a: 1}]);
        m.removeItem(0);
        assert.equal(m.payload().length, 0);
    });
});

describe('timestamp', function() {
    let m = memento().node({currentTime: 1, nodeName: 'dummy'});
    it('retrieves node timestamp', function() {
        assert.equal(m.timestamp(), 1);
    });
});

describe('breakpoints', function() {
    describe('tests breakpoints', function() {
        let m = memento();
        let single = {low: 1, high: 4};
        let multiple = [{low: 1, high: 4}, {low: 2, high: 6}];
        it('single', function() {
            assert.equal(m.testBreakpoints(single, 2), true);
            assert.equal(m.testBreakpoints(single, 5), false);
        });
        it('multiple', function() {
            assert.equal(m.testBreakpoints(multiple, 3)[0], true);
            assert.equal(m.testBreakpoints(multiple, 3)[1], true);
            assert.equal(m.testBreakpoints(multiple, 5)[0], false);
            assert.equal(m.testBreakpoints(multiple, 5)[1], true);
        });
        it('switches', function() {
            assert.equal(typeof m.testBreakpoints(single, 2), 'boolean');
            assert.equal(typeof m.testBreakpoints(multiple, 2).length, 'number');
        });
    });
    it('has a breakpoints compilation method', function() {
        assert.equal(typeof memento().breakpoints, 'function');
    });
    it('finds nearest breakpoints', function() {
        let m = memento();
        let data = [
            {function: noop, start: 1, end: 2},
            {function: noop, start: 3, end: 4},
            {function: noop, start: 3, end: 5},
            {function: noop, start: 2, end: 5},
            {function: noop, start: 2, end: 6},
        ];
        m.payload(data);
        let result = m.nearestBreakpoints(3.5);
        assert.equal(result.low, 3);
        assert.equal(result.high, 4);
    });
});

describe('data', function() {
    it('exists', function() {
        assert.equal(typeof memento().payload, 'function');
    });
    it('stores data', function() {
        let data = [{a: 1}];
        let m = memento();
        m.payload(data);
        assert.equal(m.payload(), data);
    });
    it('overwrites data', function() {
        let first = [{a: 1}];
        let second = [{a: 2}];
        let m = memento();
        m.payload(first);
        m.payload(second);
        assert.notEqual(m.payload().pop().a, first.pop().a);
    });
});

describe('seconds helper', function() {
    let m = memento();
    it('resolves strings', function() {
        assert.equal(m.seconds('1:30'), 90);
        assert.equal(m.seconds('2:35'), 155);
        assert.equal(m.seconds('1:01:30'), 3690);
    });
    it('returns numbers transparently', function() {
        let int = 5;
        assert.equal(m.seconds(int), int);
        assert.equal(typeof m.seconds(int), 'number');
    });
});

describe('watching', function() {
    it('updates node', function() {
        let player = {currentTime: 2, nodeName: 'dummy'};
        let m = memento().node(player);
        m.watch();
        assert.equal(typeof m.node().ontimeupdate, 'function');
    });
});

describe('integrations', function() {
    let player = {currentTime: 2, nodeName: 'dummy'};
    let datum = {start: 1, end: 3, value: 1};
    let m = memento()
        .node(player)
        .payload([datum]);
    m.watch();
    describe('extend', function() {
        m.extend('m', function(data, timestamp, node) {
            assert.equal(data.pop().value, datum.value);
            assert.equal(timestamp, player.currentTime);
            assert.equal(node, player);
        });
        it('exists', function() {
            assert.equal(typeof m.extend, 'function');
        });
        it('extends', function() {
            assert.equal(typeof m.m, 'function');
        });
        it('passes arguments', function() {
            m.m();
        });
    });
    describe('tick', function() {
        it('exists', function() {
            assert.equal(typeof m.tick, 'function');
        });
    });
    describe('trigger', function() {
        it('exists', function() {
            assert.equal(typeof m.trigger, 'function');
        });
    });
});