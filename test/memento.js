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
    it('returns an array', function() {
        let m = memento();
        m.tick(true, noop);
        assert(typeof m.actions, 'function');
        assert(m.actions() instanceof Array);
        assert.equal(typeof m.actions().length, 'number');
    });
    it('adds items', function() {
        let m = memento();
        m.tick(true, noop);
        assert.equal(m.actions().length, 1);
    });
    describe('storage', function() {
        it('uses the expected storage format', function() {
            let m = memento();
            m.tick({low: 1, high: '1:30'}, noop);
            let action = m.actions().pop();
            assert.equal(typeof action, 'object');
            assert.equal(Object.keys(action).length, 3);
            assert.equal(typeof action.start, 'number');
            assert.equal(typeof action.end, 'number');
            assert.equal(typeof action.function, 'function')
        });
        it('returns the original functions', function() {
            let m = memento();
            m.tick({low: 1, high: '1:30'}, noop);
            let action = m.actions().pop();
            assert.equal(action.function, noop);
        });
    });
});

describe('mutation', function() {
    it('adds datum', function() {
        let m = memento().data([{a: 1}]);
        m.addDatum({b: 2});
        assert.equal(m.data().length, 2);
    });
    it('remove datum', function() {
        let m = memento().data([{a: 1}]);
        m.removeDatum(0);
        assert.equal(m.data().length, 0);
    });
});

describe('now', function() {
    let m = memento().node({currentTime: 1, nodeName: 'dummy'});
    it('retrieves node timestamp', function() {
        assert.equal(m.now(), 1);
    });
});

describe('breakpoints', function() {
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
        m.data(data);
        let result = m.nearestBreakpoints(3.5);
        assert.equal(result.low, 3);
        assert.equal(result.high, 4);
    });
});

describe('data', function() {
    it('exists', function() {
        assert.equal(typeof memento().data, 'function');
    });
    it('stores data', function() {
        let data = [{a: 1}];
        let m = memento();
        m.data(data);
        assert.equal(m.data(), data);
    });
    it('overwrites data', function() {
        let first = [{a: 1}];
        let second = [{a: 2}];
        let m = memento();
        m.data(first);
        m.data(second);
        assert.notEqual(m.data().pop().a, first.pop().a);
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

describe('bang', function() {
    let data = [
        {start: 3, end: 7, value: 3},
        {start: 1, end: 3, value: 1},
        {start: 2, end: 5, value: 2},
        {start: 4, end: 9, value: 4},
        {start: 5, end: 11, value: 5},
    ]
    let m = memento().data(data);
    it('returns relevant data', function() {
        let result = m.bang(2.5);
        assert.equal(result.length, 2)
    });
    it('sorts data by start time', function() {
        let result = m.bang(2.5);
        assert(result[0].start < result[1].start);
    });
});

describe('watching', function() {
    it('updates node', function() {
        let player = {currentTime: 2, nodeName: 'dummy'};
        let m = memento().node(player);
        assert.notEqual(typeof m.node().ontimeupdate, 'function');
        m.watch();
        assert.equal(typeof m.node().ontimeupdate, 'function');
    });
});

describe('integrations', function() {
    let player = {currentTime: 2, nodeName: 'dummy'};
    let datum = {start: 1, end: 3, value: 1};
    let m = memento()
        .node(player)
        .data([datum]);
    m.watch();
    describe('extend', function() {
        m.extend('test', function(data, timestamp, node) {
            assert.equal(data.pop().value, datum.value);
            assert.equal(timestamp, player.currentTime);
            assert.equal(node, player);
        });
        it('exists', function() {
            assert.equal(typeof m.extend, 'function');
        });
        it('extends', function() {
            assert.equal(typeof m.test, 'function');
        });
        it('passes arguments', function() {
            m.test();
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

describe('api', function() {
    it('has the expected v0.1.1 API methods', function() {
        let expected = [
            'data',
            'bang',
            'node',
            'now',
            'seconds',
            'addDatum',
            'removeDatum',
            'actions',
            'breakpoints',
            'nearestBreakpoints',
            'extend',
            'tick',
            'trigger',
            'watch'
        ];
        let m = memento();
        assert(Object.keys(m).length, expected.length);
        expected.forEach(function(method) {
            assert.equal(typeof m[method], 'function');
            // prohibit snake case and private methods
            assert.equal(method.indexOf('_'), -1);
        });
    });
});