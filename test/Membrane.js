const assert = require('assert')
const sinon = require('sinon')
const spy = require("./spy.js")
const stringify = require('json-stable-stringify')
const {God, Membrane} = require("../cell")
const compare = function(actual, expected) {
  assert.equal(stringify(actual), stringify(expected));
}
describe("Membrane", function() {
  require('jsdom-global')()
  God.plan(window);
  describe("build", function() {
    describe("Membrane.inject", function() {
      it("get existing head", function() {
        spy.Membrane.inject.reset();
        spy.Membrane.add.reset();
        var gene = {
          $type: "head",
          $cell: true,
          $components: [{
            $type: "link",
            href: "http://localhost",
            rel: "stylesheet"
          }]
        }
        var $node = Membrane.build(window, gene, null, null)
        assert.equal($node, document.head)
        compare(spy.Membrane.inject.callCount, 1)
        compare(spy.Membrane.add.callCount, 0)
      })
      it("get existing body", function() {
        spy.Membrane.inject.reset();
        spy.Membrane.add.reset();
        var gene = {
          $type: "body",
          $cell: true,
          $components: [{ class: "container" }]
        }
        var $node = Membrane.build(window, gene, null, null)
        compare(Object.getPrototypeOf($node).toString(), "[object HTMLBodyElement]")
        compare($node.Meta, {})
        compare($node, document.body);
        compare(spy.Membrane.inject.callCount, 1)
        compare(spy.Membrane.add.callCount, 0)
      })
      it("get existing id", function() {
        spy.Membrane.inject.reset();
        spy.Membrane.add.reset();
        document.body.innerHTML = "";
        var $widget = document.createElement("div");
        $widget.setAttribute("id", "widget");
        document.body.appendChild($widget);

        var gene = {
          id: "widget",
          $cell: true,
          $components: [{ class: "container" }]
        }
        var $node = Membrane.build(window, gene, null, null)

        compare(document.body.outerHTML, "<body><div id=\"widget\"></div></body>")
        compare($node, $widget);  // same instance
        compare(spy.Membrane.inject.callCount, 1)
        compare(spy.Membrane.add.callCount, 0)
      })
    })
    describe("Membrane.add", function() {
      it("returns a newly created node", function() {
        spy.Membrane.inject.reset();
        spy.Membrane.add.reset();
        const $parent = document.createElement("div");
        const $child = Membrane.build($parent, {})
        compare($child.nodeType, 1)
        compare(spy.Membrane.inject.callCount, 1)
        compare(spy.Membrane.add.callCount, 1)
      })
      it("the passed in node should be the parent of the returned node", function() {
        const $parent = document.createElement("div");
        const $child = Membrane.build($parent, {})
        assert.equal($child.parentNode, $parent)
      })
      it("appends child", function() {
        spy.Phenotype.$type.reset();
        const $node = document.createElement("div")
        Membrane.build($node, {$type: "span"})
        compare(spy.Phenotype.$type.callCount, 1)
        compare($node.innerHTML, "<span></span>")
        compare($node.outerHTML, "<div><span></span></div>")
      })
    })
  })
})
