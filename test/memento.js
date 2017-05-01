let assert = require('assert');
let memento = require('..');

describe('factory', function() {
    it('exists', function() {
        assert.equal(typeof memento, 'function');
    });
    it('returns a function', function() {
        assert.equal(typeof memento(), 'function');
    });
});

describe('watch method', function() {
    it('exists', function() {
        assert.equal(typeof memento().watch, 'function');
    });
});

describe('data loading', function() {
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
    it('resolves strings', function() {
        let instance = memento();
        assert.equal(instance.seconds('1:30'), 90);
        assert.equal(instance.seconds('2:35'), 155);
        assert.equal(instance.seconds('1:01:30'), 3690);
    });
});