import reducer from '../modifiers/reducer';
import bare from '../modifiers/bare';

function recordLength(array) {
  if (!array._meta.storePath) {
    console.log(Object.keys(array._meta));
  }
  array._meta.recordRead(array._meta.storePath.concat('length'));
}

export const arrayMethods = {
  concat: bare(function() {
    var plain = this.slice();
    return plain.concat.apply(plain, arguments);
  }),

  copyWithin: reducer(function(state, args) {
    let plain = state.slice();
    return plain.copyWithin.apply(plain, args);
  }),

  every: bare(function(func, thisArg) {
    if (typeof func !== 'function') throw new TypeError(`${func} is not a function`);

    for (let i = 0, l = this.length; i < l; i++) {
      if (!func.call(thisArg, this.get(i), i, this)) return false;
    }
    return true;
  }),

  fill: function(value, start, end) {
    start = start || 0;

    let length = this.length;

    if (start < 0) {
      start = Math.max(0, length + start);
    } else {
      start = Math.min(length, start);
    }

    if (end === undefined) {
      end = length;
    }
    if (end < 0) {
      end = Math.max(0, length + end);
    } else {
      end = Math.min(length, end);
    }

    for (let i = start; i < end; i++) {
      this.set(i, value);
    }
    return this;
  },

  filter: bare(function(func, thisArg) {
    if (typeof func !== 'function') throw new TypeError(`${func} is not a function`);

    let result = []
      , item;

    for (let i = 0, l = this.length; i < l; i++) {
      item = this.get(i);
      if (func.call(thisArg, item, i, this)) {
        result.push(item);
      }
    }

    return result;
  }),

  find: bare(function(func, thisArg) {
    if (typeof func !== 'function') throw new TypeError(`${func} is not a function`);

    let item;
    for (let i = 0, l = this.length; i < l; i++) {
      item = this.get(i);
      if (func.call(thisArg, item, i, this)) {
        return item;
      }
    }
  }),

  findIndex: bare(function(func, thisArg) {
    if (typeof func !== 'function') throw new TypeError(`${func} is not a function`);

    let item;
    for (let i = 0, l = this.length; i < l; i++) {
      item = this.get(i);
      if (func.call(thisArg, item, i, this)) {
        return i;
      }
    }
  }),

  forEach: bare(function(func, thisArg) {
    if (typeof func !== 'function') throw new TypeError(`${func} is not a function`);

    for (let i = 0, l = this.length; i < l; i++) {
      func.call(thisArg, this.get(i), i, this);
    }
  }),

  includes: bare(function(item, start) {
    start = start || 0;

    let length = this.length;

    if (start < 0) {
      start = Math.max(0, start + length);
    }

    if (item !== item) { //NaN check
      for (let i = start; i < length; i++) {
        item = this.get(i);
        if (item !== item) {
          return true;
        }
      }
      return false;
    }

    for (let i = start; i < length; i++) {
      if (item === this.get(i)) {
        return true;
      }
    }

    return false;
  }),

  indexOf: bare(function(item, start) {
    start = start || 0;

    let length = this.length;

    if (start < 0) {
      start = Math.max(0, length + start);
    }

    for (let i = start; i < length; i++) {
      if (item === this.get(i)) {
        return i;
      }
    }
    return -1;
  }),

  join: bare(function(separator) {
    let result = [];

    for (let i = 0, l = this.length; i < l; i++) {
      result.push(this.get(i));
    }
    return result.join(separator);
  }),

  lastIndexOf: bare(function(item, start) {
    let length = this.length;
    start = start || length - 1;

    if (start < 0) {
      start = Math.max(0, start + length);
    }

    for (let i = start; i >= 0; i--) {
      if (item === this.get(i)) {
        return i;
      }
    }
    return -1;
  }),

  map: bare(function(func, thisArg) {
    if (typeof func !== 'function') throw new TypeError(`${func} is not a function`);

    let result = [];

    for (let i = 0, l = this.length; i < l; i++) {
      result.push(func.call(thisArg, this.get(i), i, this));
    }

    return result;
  }),

  pop: reducer(function(state, args, result) {
    let newState = state.slice();

    result.result = this.get(newState.length - 1);

    let isRef = false;

    if (this._meta.type.getPropType) {
      isRef = this._meta.type.getPropType(newState.length - 1).kind === 'reference';
    }

    if (!isRef && result.result && typeof result.result.toObject === 'function') {
      result.result = result.result.toObject();
    }
    newState.pop();
    return newState;
  }),

  push: reducer(function(state, args, result) {
    let newState = state.slice()
      , type     = this._meta.type
      ;

    if (type.length > 1) throw new TypeError('Tuples cannot be extended');
    result.result = newState.push.apply(newState, args.map((item, ix) => type.packProp(ix, item)));
    return newState;
  }),

  reduce: bare(function(func, initialValue) {
    if (typeof func !== 'function') throw new TypeError(`${func} is not a function`);

    let length = this.length
      , reduced
      , start
      ;

    if (arguments.length < 2) {
      if (!length) throw new TypeError('Reduce of empty array with no initial value');
      reduced = this.get(0);
      start = 1;
    } else {
      reduced = initialValue;
      start = 0;
    }

    for (let i = start; i < length; i++) {
      reduced = func(reduced, this.get(i), i, this);
    }

    return reduced;
  }),

  reduceRight: bare(function(func, initialValue) {
    if (typeof func !== 'function') throw new TypeError(`${func} is not a function`);
    let length = this.length
      , reduced
      , start
      ;

    if (arguments.length < 2) {
      if (!length) throw new TypeError('Reduce of empty array with no initial value');
      reduced = this.get(length - 1);
      start = length - 2;
    } else {
      reduced = initialValue;
      start = length - 1;
    }

    for (let i = start; i >= 0; i--) {
      reduced = func(reduced, this.get(i), i, this);
    }

    return reduced;
  }),

  reverse: reducer(function(state) {
    if (!state.length) return state;
    return state.slice().reverse();
  }),

  shift: reducer(function(state, args, result) {
    let newState = state.slice();
    result.result = this.get(0);
    if (result.result && typeof result.result.toObject === 'function') {
      result.result = result.result.toObject();
    }
    newState.shift();
    return newState;
  }),

  slice: bare(function(start, end) {
    start = start || 0;

    let length = this.length;

    if (start < 0) start += length;
    end = end || length;
    if (end < 0) end += length;

    let result = [];

    for (let i = start; i < end; i++) {
      result.push(this.get(i));
    }
    return result;
  }),

  some: bare(function(func, thisArg) {
    if (typeof func !== 'function') throw new TypeError(`${func} is not a function`);

    for (let i = 0, l = this.length; i < l; i++) {
      if (func.call(thisArg, this.get(i), i, this)) return true;
    }
    return false;
  }),

  sort: reducer(function(state, args) {
    let order = []
      , func  = args[0]
      ;

    for (let i = 0; i < state.length; i++) order.push(i);

    if (typeof func !== 'function') {
      func = function(a, b) {
        a = String(a);
        b = String(b);
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
      };
    }

    order.sort((a, b) => {
      a = this.get(a);
      b = this.get(b);
      if (a === undefined && b === undefined) return 0;
      if (a === undefined) return 1;
      if (b === undefined) return -1;
      return func(a, b);
    });

    return order.map(i => state[i]);
  }),

  splice: reducer(function(state, args, result) {
    let start    = args[0] || 0
      , delCount = args[1] || 0
      , rest     = args.slice(2)
      ;

    if (this._meta.type.length > 1) {
      if (delCount !== rest.count || (start + delCount) > this._meta.type.length) {
        throw new TypeError('Cannot change the length of a tuple array');
      }
      rest = rest.map((item, ix) => this._meta.type.properties[ix].pack(item));
    } else {
      rest = rest.map((item, ix) => this._meta.type.packProp(ix, item));
    }

    let newState = state.slice();
    result.result = newState.splice.apply(newState, [start, delCount].concat(rest));
    return newState;
  }),

  toLocaleString: bare(function() {
    let plain = this.slice();
    return plain.toLocaleString ? plain.toLocaleString.apply(plain, arguments) : plain.toString();
  }),

  toString: bare(function() {
    return this.join();
  }),

  unshift: reducer(function(state, args, result) {
    let newState = state.slice()
      , type     = this._meta.type
      ;

    if (type.length > 1) throw new TypeError('Tuples cannot be extended');
    result.result = newState.unshift.apply(newState, args.map((item, ix) => type.packProp(ix, item)));
    return newState;
  }),

  valueOf: bare(function() {
    return this.toObject();
  })
};

export const arrayVirtuals = {
  length: {
    get: function() {
      recordLength(this);
      return this._meta.state.length;
    },
    set: function(value) {
      if (this._meta.type.length > 1) throw new TypeError('Cannot change the length of a tuple array');
      let newState        = this._meta.state.slice(0, value)
        , defaultRestProp = this._meta.type.defaultRestProp.bind(this._meta.type) || (v => undefined)
        ;

      while (newState.length < value) {
        newState.push(defaultRestProp());
      }
      this._meta.state = newState;
    }
  }
};
