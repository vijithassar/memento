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

describe('methods', function() {
  it('watch', function() {
    assert.equal(typeof memento().watch, 'function');
  });
});