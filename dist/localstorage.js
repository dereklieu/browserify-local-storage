/*jshint eqnull:true */
var _ = require('lodash');

"use strict";

var StorageModule = function(root) {

    // Used for testing in node.js environments,
    // when we create a mock of the localstorage API.
    // Should always default to window in browser.
    var root = (root && root.localStorage) ? root : window;

    // test if browser supports localstorage using modernizr method
    // try block because some implements make it appear as if available,
    // but will throw an exception when calling .setItem
    var browserSupport = (function() {
        var test = 'test';
        try {
            root.localStorage.setItem(test, test);
            root.localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    })();
    this.supported = browserSupport;

    // save a reference to the localStorage object if it is supported
    // if it's not supported, create a simple mock of it's api in case
    // something slips by
    var store = {};
    if (browserSupport) {
        store = root.localStorage;
    } else {
        _.extend(store, {
            getItem: function() { return []; },
            setItem: function() { return false; },
            length: 0,
            key: []
        });
    }

    // there are good reasons to prefix localstorage keys
    // such as not over-writing other locally-stored items from the app
    this.__prefix = 'zxz-';
    this.setPrefix = function(pre) { this.__prefix = pre; };
    this.getPrefix = function(key) { return this.__prefix + (key || ''); };

    // Wrapping to-and-fro JSON functions
    function safeParse(str) {
        try {
            return JSON.parse(str);
        } catch (e) {
            return false;
        }
    };

    function safeStringify(object) {
        try {
            return JSON.stringify(object);
        } catch (e) {
            return null;
        }
    };

    // Test if string only contains numbers
    // e.g '1' => true, "'1'" => true
    function isStringNumber(num) {
        return  /^-?\d+\.?\d*$/.test(num.replace(/["']/g, ''));
    }

    this.set = function(key, item) {
        if (!browserSupport) { return false; }

        // using '==' to test for both null and undefined
        // normalize both to null
        if (item == undefined) {
            item = 'null';
        }

        // try/catch wrapper around JSON.stringify for vanilla objects & arrays
        else if (_.isPlainObject(item) || _.isArray(item)) {
            item = safeStringify(item);
        }

        // convert numbers to strings
        else if (!isNaN(item)) {
            item = '' + item;
        }

        try {
            store.setItem(this.getPrefix(key), item);
        } catch (e) {
            return false;
        }

        return true;
    };

    // TODO consider a cookie-based fallback
    this.get = function(key) {
        if (!browserSupport) { return false; }
        var item = store.getItem(this.getPrefix(key));

        // This library checks for both undefined and null,
        // and will save those both as "null".
        // In case null and undefined are in the local storage already,
        // check for both as well .
        // Using '==' to test for both null and undefined.
        if (item === 'null' || item == null) {
            return null;
        }

        // try/catch wrapper around JSON.parse for vanilla objects & arrays
        if (item.charAt(0) === '{' || item.charAt(0) === '[') {
            return safeParse(item);
        }

         // convert number strings back to numbers
        if (isStringNumber(item)) {
            return +item;
        }

        return item;
    };

    // removes a single item
    this.remove = function(key) {
        if (!browserSupport) { return false; }
        try {
            store.removeItem(this.getPrefix(key));
        } catch (e) { }
        return;
    };

    // return array of keys from localstorage
    // only return keys that are prefixed for this app
    this.keys = function() {
        if (!browserSupport) { return false; }

        var prefix = this.__prefix;
        var prefixLength = prefix.length;
        var keys = [];

        for (var i = 0; i < store.length; ++i) {
            var key = store.key(i);

            // only return keys prefixed for this app
            if (key.substr(0,prefixLength) === prefix) {
                keys.push(key.substr(prefixLength));
            }
        }
        return keys;
    };

    // iterates over every prefixed key in localstorage
    // takes a callback to apply to each key; returns the result
    this.map = function(callback, context) {
        if (!browserSupport) { return false; }

        var prefix = this.__prefix;
        var prefixLength = prefix.length;
        var result = [];

        context = context || root;
        callback = callback.bind(context);

        for (var i = 0; i < store.length; ++i) {
            var key = store.key(i);

            // only return keys prefixed for this app
            if (key.substr(0,prefixLength) === prefix) {
                key = key.substr(prefixLength);

                // calls callback function with
                // un-prefixed key, key value, and key index
                result.push(
                    callback(key, this.get(key), i)
                );
            }
        }
        return result;
    };

    // removes all items from localStorage prefixed to this app
    this.wipe = function() {
        if (!browserSupport) { return false; }

        var prefix = this.getPrefix();
        var prefixLength = prefix.length;

        var i = store.length;
        while(--i >= 0) {
            var key = store.key(i);

            // only remove keys prefixed for this app
            if (key.substr(0,prefixLength) === prefix) {
                try {
                    store.removeItem(key);
                } catch (e) { }
            }
        }
    };

    // remove all items from localStorage, period.
    // Be careful using this method! Should only be used during development
    this.destroy = function() {
        var i = store.length;
        while(--i >= 0) {
            var key = store.key(i);
            try {
                store.removeItem(key);
            } catch (e) { }
        }
    };


    return this;
};

module.exports = StorageModule;
