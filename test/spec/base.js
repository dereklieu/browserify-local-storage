var _ = require('lodash');
var Storage = require('../../dist/localstorage.js');

chai.config.includeStack = true;
var expect = chai.expect;

// Tests support, prefix, set, get,
// and remove functions using a mock API

describe('Base localstorage functionality', function() {

    // Mocking a global context that contains localStorage,
    // basically mocking window.localStorage API in browser
    var mock = {
        localStorage: (function() {
            var store = {};
            return {
                // Raw is is useful to verify tests
                raw: function() {
                    return _.clone(store);
                },
                getItem: function(key) {
                    return store[key];
                },
                setItem: function(key, value) {
                    store[key] = value;
                },
                removeItem: function(key) {
                    delete store[key];
                },
                clear: function() {
                    store = {};
                },
            };
        })()
    };

    var storage = new Storage(mock);

    function contents() {
        return mock.localStorage.raw();
    }

    afterEach(function() {
        mock.localStorage.clear();
    });

    describe('#supported', function() {
        it('should detect browser localstorage', function() {
            expect(storage.supported).to.equal(true);
        });
    });

    describe('#prefix', function() {

        it('should return a prefixed key with getPrefix(key)', function() {
            var key = 'name';
            var value = 'test'
            storage.set(key, value);
            expect(contents()[storage.getPrefix(key)]).to.equal(value);
        });

        it('should save keys with a default prefix of "zxz-"', function() {
            storage.set('name', 'test');
            expect(contents()).to.deep.equal({'zxz-name': 'test'});
        });

        it('should should let you write keys with custom prefixes', function() {
            storage.set('name', 'test');
            storage.setPrefix('xyz-');
            storage.set('name', 'test');
            expect(contents()).to.deep.equal({'zxz-name': 'test', 'xyz-name': 'test'});
        });

        it('should return the prefix using getPrefix()', function() {
            storage.setPrefix('hello');
            expect(storage.getPrefix()).to.equal('hello');
        });

        it('should let you use blank "" prefixes', function() {
            storage.setPrefix('');
            storage.set('name', 'test');
            expect(contents()).to.deep.equal({'name': 'test'});
        });

    });

    describe('#set', function() {

        it('should save number types as strings', function() {
            storage.set('shouldBeString', 0);
            expect(contents()[storage.getPrefix('shouldBeString')]).to.equal('0');
        });

        it('should save undefined and null as "null"', function() {
            var undef;
            storage.setPrefix('');
            storage.set('undef', undef);
            storage.set('null', null);
            expect(contents()).to.deep.equal({
                'undef': 'null',
                'null': 'null'
            });
        });

        it('should call JSON.stringify on vanilla objects', function() {
            var obj = {
                'vehicle': 'bicycle',
                'wheels': 2,
                'uses': ['riding', 'stunting']
            };
            storage.setPrefix('');
            storage.set('transportation', obj);
            expect(contents()['transportation']).to.equal(JSON.stringify(obj));
        });

        it('should call JSON.stringify on arrays', function() {
            var arr = ['hello', 'world', 123];
            storage.setPrefix('');
            storage.set('random', arr);
            expect(contents()['random']).to.equal(JSON.stringify(arr));
        });

    });

    describe('#get', function() {

        it('should return saved key/value pairs with get()', function() {
            storage.set('something', 'other');
            expect(storage.get('something')).to.equal('other');
        });

        it('should return numerical strings as numbers using get()', function() {
            storage.set('number', 15);
            expect(storage.get('number')).to.equal(15);
        });

        it('should return null when it retrieves "null"', function() {
            // localStorage.js saves null as "null"
            storage.set('shouldBeNull', null);
            expect(storage.get('stringNull')).to.equal(null);
        });

        it('should return null when it retrieves null', function() {
            // localStorage.js saves null as "null"
            // get around this by accessing the fake function and
            // planting an actual null in it
            mock.localStorage.setItem('shouldBeNull', null);
            expect(storage.get('shouldBeNull')).to.equal(null);
        });

        it('should return null when it tries to retrieve an unset key', function() {
            expect(storage.get('nothinghere')).to.equal(null);
        });

        it('should return native objects', function() {
            var obj = {
                name: 'test',
                type: null,
                values: ['1', 2, 3]
            };
            storage.set('objTest', obj);
            expect(storage.get('objTest')).to.deep.equal(obj);
        });
    });

    describe('#remove', function() {
        it('should remove key/value pairs with remove(key)', function() {
            storage.set('removeMe', 123);
            storage.set('leaveMeBe', 456);
            storage.remove('removeMe');
            expect(storage.get('removeMe')).to.equal(null);
        });
    });

});
