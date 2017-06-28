const assert = require('assert')
const sinon = require('sinon')
const spy = require("./spy.js")
const stringify = require('json-stable-stringify')
const {God} = require("../cell")
const compare = function(actual, expected) {
  assert.equal(stringify(actual), stringify(expected));
}
// Everything that interfaces with the outside world
describe("God", function() {
  require('jsdom-global')()
  God.plan(window);
  describe("God.detect(): finding $cell", function() {
    describe("looks for a variable with the key '$cell'", function() {
      it("only cells", function() {
        var mock = {
          gene1: {
            $type: "div",
            $text: "node1",
            $cell: true
          },
          gene2: {
            $type: "span",
            $text: "node2",
            $cell: true
          }
        };
        var genes = God.detect(mock);
        compare(genes.length, 2)
        compare(genes, [mock.gene1, mock.gene2]);
      })
      it("mix of cells and non-cells", function() {
        var mock = {
          gene: {
            $type: "div",
            $text: "node1",
            $cell: true
          },
          obj: {
            blah: "blah"
          },
          str: "str",
          num: 1
        };
        var genes = God.detect(mock);
        compare(genes.length, 1)
        compare(genes[0], mock.gene);
      })
    })
  })
  describe("God.create()", function() {
    it("inserts into existing body correctly", function() {
      document.body.innerHTML = "";
      window.gene = {
        $type: "body",
        $cell: true,
        $components: [{
          $text: "Hello",
          class: "container"
        }]
      };
      var $result = God.create(window);
      compare($result.map(function($node) { return $node.outerHTML }), [ '<body><div class="container">Hello</div></body>' ]);
      compare(document.querySelector("html").outerHTML, '<html><head><meta charset=\"utf-8\"></head><body><div class="container">Hello</div></body></html>');
    })
    it("attaches new node into body", function() {
      document.body.innerHTML = "";
      window.gene = {
        $cell: true,
        $text: "Hello",
        class: "container"
      };
      var $result = God.create(window);
      compare($result.map(function($node) { return $node.outerHTML }), [ '<div class="container">Hello</div>' ]);
      compare(document.querySelector("html").outerHTML, '<html><head><meta charset=\"utf-8\"></head><body><div class="container">Hello</div></body></html>');
    })
    describe("injects node into the id slot", function() {
      it("single id", function() {
        document.body.innerHTML = "<div class='container'><div class='row'>This is a row</div><div class='sidebar' id='widget'></div>";
        window.gene = {
          id: "widget",
          $cell: true,
          $components: [{
            $text: "Hello",
            class: "ticker"
          }]
        };
        var $result = God.create(window);
        compare(document.body.innerHTML, "<div class=\"container\"><div class=\"row\">This is a row</div><div class=\"sidebar\" id=\"widget\"><div class=\"ticker\">Hello</div></div></div>");
      })
      it("multiple ids", function() {
        document.body.innerHTML = "<div class='container'><div class='row' id='search'></div><div class='row'>This is a row</div><div class='sidebar' id='widget'></div>";
        window.gene = {
          class: "sidebar",
          id: "widget",
          $cell: true,
          $components: [{
            $text: "Hello",
            class: "ticker"
          }]
        };
        window.gene2 = {
          id: "search",
          $cell: true,
          $type: "input",
          type: "search"
        };
        var $result = God.create(window);
        compare(document.body.innerHTML, "<div class=\"container\"><input id=\"search\" type=\"search\"><div class=\"row\">This is a row</div><div class=\"sidebar\" id=\"widget\"><div class=\"ticker\">Hello</div></div></div>");
      })
    })
  })
})
