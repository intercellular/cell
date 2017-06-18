const assert = require('assert')
const stringify = require('json-stable-stringify')
const {Gene} = require("../cell")
const compare = function(actual, expected) {
  assert.equal(stringify(actual), stringify(expected));
}
describe("Gene", function() {
  describe("insertion only", function() {
    it("prepend", function() {
      var _old = ["b", "c", "d", "e"]
      var _new = ["a", "b", "c", "d", "e"]
      var LCS = Gene.LCS(_old, _new)
      var Diff = Gene.diff(_old, _new)
      compare(LCS, [
        { item: 'b', _old: 0, _new: 1 },
        { item: 'c', _old: 1, _new: 2 },
        { item: 'd', _old: 2, _new: 3 },
        { item: 'e', _old: 3, _new: 4 }
      ])
      compare(Diff, { '-': [], '+': [ { item: 'a', index: 0 } ] })
    })
    it("append", function() {
      var _old = ["b", "c", "d", "e"]
      var _new = ["b", "c", "d", "e", "f"]
      var LCS = Gene.LCS(_old, _new)
      var Diff = Gene.diff(_old, _new)
      compare(LCS, [
        { item: 'b', _old: 0, _new: 0 },
        { item: 'c', _old: 1, _new: 1 },
        { item: 'd', _old: 2, _new: 2 },
        { item: 'e', _old: 3, _new: 3 }
      ])
      compare(Diff, { '-': [], '+': [ { item: 'f', index: 4 } ] })
    })
    it("middle", function() {
      var _old = ["a", "b", "d", "e"]
      var _new = ["a", "b", "c", "d", "e"]
      var LCS = Gene.LCS(_old, _new)
      var Diff = Gene.diff(_old, _new)
      compare(LCS, [
        { item: 'a', _old: 0, _new: 0 },
        { item: 'b', _old: 1, _new: 1 },
        { item: 'd', _old: 2, _new: 3 },
        { item: 'e', _old: 3, _new: 4 }
      ])
      compare(Diff, { '-': [], '+': [ { item: 'c', index: 2 } ] })
    })
  })
  describe("deletion only", function() {
    it("from end", function() {
      var _old = ["a", "b", "d", "e"]
      var _new = ["a", "b", "d"]
      var LCS = Gene.LCS(_old, _new)
      var Diff = Gene.diff(_old, _new)
      compare(LCS, [
        { item: 'a', _old: 0, _new: 0 },
        { item: 'b', _old: 1, _new: 1 },
        { item: 'd', _old: 2, _new: 2 }
      ])
      compare(Diff, { '-': [ {item: 'e', index: 3} ], '+': [] })
    })
    it("from start", function() {
      var _old = ["a", "b", "d", "e"]
      var _new = ["b", "d", "e"]
      var LCS = Gene.LCS(_old, _new)
      var Diff = Gene.diff(_old, _new)
      compare(LCS, [
        { item: 'b', _old: 1, _new: 0 },
        { item: 'd', _old: 2, _new: 1 },
        { item: 'e', _old: 3, _new: 2 }
      ])
      compare(Diff, { '-': [ {item: 'a', index: 0} ], '+': [] })
    })
    it("from middle", function() {
      var _old = ["a", "b", "d", "e"]
      var _new = ["a", "e"]
      var LCS = Gene.LCS(_old, _new)
      var Diff = Gene.diff(_old, _new)
      compare(LCS, [
        { item: 'a', _old: 0, _new: 0 },
        { item: 'e', _old: 3, _new: 1 }
      ])
      compare(Diff, { '-': [ {item: 'b', index: 1}, {item: 'd', index: 2} ], '+': [] })
    })
    it("multiple from middle", function() {
      var _old = ["a", "b", "c", "d", "e", "f"]
      var _new = ["a", "c", "d", "f"]
      var LCS = Gene.LCS(_old, _new)
      var Diff = Gene.diff(_old, _new)
      compare(LCS, [
        { item: 'a', _old: 0, _new: 0 },
        { item: 'c', _old: 2, _new: 1 },
        { item: 'd', _old: 3, _new: 2 },
        { item: 'f', _old: 5, _new: 3 }
      ])
      compare(Diff, { '-': [ {item: 'b', index: 1}, {item: 'e', index: 4} ], '+': [] })
    })
  })
  describe("insertion and deletion", function() {
    it("from middle", function() {
      var _old = ["a", "b", "d", "e"]
      var _new = ["a", "c", "e"]
      var LCS = Gene.LCS(_old, _new)
      var Diff = Gene.diff(_old, _new)
      compare(LCS, [
        { item: 'a', _old: 0, _new: 0 },
        { item: 'e', _old: 3, _new: 2 }
      ])
      compare(Diff, { '-': [ {item: 'b', index: 1}, {item: 'd', index: 2} ], '+': [ {item: 'c', index: 1} ] })
    })
    it("multiple from middle", function() {
      var _old = ["a", "b", "c", "d", "e", "f", "g"]
      var _new = ["a", "c", "d", "h", "g"]
      var LCS = Gene.LCS(_old, _new)
      var Diff = Gene.diff(_old, _new)
      compare(LCS, [
        { item: 'a', _old: 0, _new: 0 },
        { item: 'c', _old: 2, _new: 1 },
        { item: 'd', _old: 3, _new: 2 },
        { item: 'g', _old: 6, _new: 4 }
      ])
      compare(Diff, { '-': [ {item: 'b', index: 1}, {item: 'e', index: 4}, {item: 'f', index: 5} ], '+': [ {item: 'h', index: 3} ] })
    })
  })
  describe("complex", function() {
    it("array", function() {
      var _old = [
        {
          "$type":"li","class":"","_model":{"todo":"a","completed":false},
          "$components":[
            {
              "class":"view",
              "$components":[
                {"$type":"input","class":"toggle","type":"checkbox"},
                {"$type":"label","$text":"a"},
                {"$type":"button","class":"destroy"},
                {"$type":"input","class":"edit","value":"a"}
              ]
            }
          ]
        }
      ];
      var _new = [
        {
          "$type":"li","class":"","_model":{"todo":"a","completed":false},
          "$components":[
            {
              "class":"view",
              "$components":[
                {"$type":"input","class":"toggle","type":"checkbox"},
                {"$type":"label","$text":"a"},
                {"$type":"button","class":"destroy"},
                {"$type":"input","class":"edit","value":"a"}
              ]
            }
          ]
         },
         {
          "$type":"li",
          "class":"",
          "_model":{"todo":"b","completed":false},
          "$components":[
            {
              "class":"view",
              "$components":[
                {"$type":"input","class":"toggle","type":"checkbox"},
                {"$type":"label","$text":"b"},
                {"$type":"button","class":"destroy"},
                {"$type":"input","class":"edit","value":"b"}
              ]
            }
          ]
        }
      ];
      var LCS = Gene.LCS(_old, _new);
      var Diff = Gene.diff(_old, _new);
      compare(LCS, [ { item: _old[0], _old: 0, _new: 0 } ])
      compare(Diff, { '-': [ ], "+": [ {item: _new[1], index: 1} ] });
    })
    it("json", function() {
      var _old = [
        {
          "$type": "li",
          "class": "",
          "_model": {
            "todo": "a",
            "completed": false
          },
          "$components": [
            {
              "class": "view",
              "$components": [
                {
                  "$type": "input",
                  "class": "toggle",
                  "type": "checkbox"
                },
                {
                  "$type": "label",
                  "$text": "a"
                },
                {
                  "$type": "button",
                  "class": "destroy"
                },
                {
                  "$type": "input",
                  "class": "edit",
                  "value": "a"
                }
              ]
            }
          ]
        }
      ];

      var _new =  [
        {
          "$type": "li",
          "class": "",
          "_model": {
            "todo": "b",
            "completed": false
          },
          "$components": [
            {
              "class": "view",
              "$components": [
                {
                  "$type": "input",
                  "class": "toggle",
                  "type": "checkbox"
                },
                {
                  "$type": "label",
                  "$text": "b"
                },
                {
                  "$type": "button",
                  "class": "destroy"
                },
                {
                  "$type": "input",
                  "class": "edit",
                  "value": "b"
                }
              ]
            }
          ]
        },
        {
          "$type": "li",
          "class": "",
          "_model": {
            "todo": "a",
            "completed": false
          },
          "$components": [
            {
              "class": "view",
              "$components": [
                {
                  "$type": "input",
                  "class": "toggle",
                  "type": "checkbox"
                },
                {
                  "$type": "label",
                  "$text": "a"
                },
                {
                  "$type": "button",
                  "class": "destroy"
                },
                {
                  "$type": "input",
                  "class": "edit",
                  "value": "a"
                }
              ]
            }
          ]
        }
      ]

      var LCS = Gene.LCS(_old, _new)
      var Diff = Gene.diff(_old, _new);
      compare(LCS, [{item: _old[0], _old: 0, _new: 1}]);
      compare(Diff, { '-': [], '+': [ { item: _new[0], index: 0 } ] });

    })
  })
})
