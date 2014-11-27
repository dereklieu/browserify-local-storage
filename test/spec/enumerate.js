var Storage = require('../../dist/localstorage.js');

chai.config.includeStack = true;
var expect = chai.expect;

// Tests support, prefix, set, get,
// and remove functions using a mock API

describe('Localstorage iterators', function() {

    var storage = new Storage();

    beforeEach(function() {
        storage.destroy();
        storage.setPrefix('test-');
    });

    describe('#keys', function() {
        it('should return keys as an array', function() {
            storage.set('one', 1);
            storage.set('two', 2);
            storage.set('three', 3);
            expect(storage.keys()).to.contain('one', 'two', 'three');
        });

        it('should return int keys as strings', function() {
            storage.set(1, 'one');
            expect(storage.keys()).to.contain('1');
        });

        it('should only return keys with the current prefix', function() {
            storage.set('x', 1);
            storage.setPrefix('another-prefix');
            storage.set('y', 1);
            expect(storage.keys()).to.not.contain('x');
        });

        it('should not return keys that have been deleted', function() {
            storage.set('x', 1);
            storage.set('y', 2);
            storage.remove('x');
            expect(storage.keys()).to.deep.equal(['y']);
        });
    });

    describe('#map', function() {
        beforeEach(function() {
            storage.set('one', 1);
            storage.set('two', 2);
        });

        it('should return a list of keys', function() {
            var callback = function(key, value, index) {
                return key;
            };
            expect(storage.map(callback)).to.contain('one', 'two');
        });

        it('should return a list of values', function() {
            var callback = function(key, value, index) {
                return value;
            };
            expect(storage.map(callback)).to.contain(1, 2);
        });

        it('should return a list of indices', function() {
            var callback = function(key, value, index) {
                return index;
            };
            expect(storage.map(callback)).to.contain(0, 1);
        });

        it('should bind to a specified context', function() {
            var Context = function() {};
            Context.prototype.addOneHundred = function(n) {
                return n + 100;
            };
            var context = new Context();
            var callback = function(key, value, index) {
                return this.addOneHundred(value);
            };
            expect(storage.map(callback, context)).to.contain(101, 102);
        });
    });

    describe('#wipe', function() {

        beforeEach(function() {
            storage.set('x', 'something');
            storage.set('y', 'is better than');
            storage.set('z', 'nothing');
        });

        it('should completely wipe prefixed keys/value pairs', function() {
            storage.wipe();
            expect(storage.keys()).to.deep.equal([]);
        });

        it('should only wipe prefixed key/value pairs', function() {
            var originalPrefix = storage.getPrefix();
            storage.setPrefix('another-prefix');
            storage.set('foo', 'bar');
            storage.setPrefix(originalPrefix);
            storage.wipe();
            storage.setPrefix('another-prefix');
            expect(storage.keys()).to.deep.equal(['foo'])
        });
    });

    describe('#destroy', function() {
        it('should completely wipe key/value pairs, regardless of prefix', function() {
            storage.setPrefix('foo');
            storage.set('hey', 'friend');
            storage.setPrefix('bar');
            storage.set('whoa', 'there');
            storage.destroy();
            storage.setPrefix('');
            expect(storage.keys()).to.deep.equal([]);
        });
    });
});
