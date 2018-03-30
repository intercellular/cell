const assert = require('assert')
const sinon = require('sinon')
const stringify = require('json-stable-stringify')
const {God, Phenotype, Genotype, Nucleus} = require("../cell")
const spy = require("./spy.js")
const compare = function(actual, expected) {
  assert.equal(stringify(actual), stringify(expected));
}
const cleanup = function(){
  require('jsdom-global')();
}
cleanup()
God.plan(window);

describe("DOM prototype overrides", function() {
  beforeEach(cleanup);

  it("$snapshot", function() {
    window.c = {
      $cell: true,
      _model: [],
      id: "el",
      onclick: function(e) { console.log("clicked"); },
      _fun: function(message) { return "Fun " + message; }
    }
    compare(document.body.outerHTML, "<body></body>");
    God.create(window);
    var fun = document.body.querySelector("#el")._fun;
    compare(fun.snapshot.toString(), "function (message) { return \"Fun \" + message; }");

    var onclick = document.body.querySelector("#el").Genotype.onclick;
    compare(onclick.snapshot.toString(), "function (e) { console.log(\"clicked\"); }");

    var snapshot = document.body.querySelector("#el").$snapshot();
    compare(snapshot._fun.toString(), "function (message) { return \"Fun \" + message; }");
    compare(snapshot.onclick.toString(), "function (e) { console.log(\"clicked\"); }");
  })

});
describe("Nucleus", function() {
  beforeEach(cleanup);

  it("has nothing at the beginning", function() {
    God.create(window);
    compare(document.body.outerHTML, "<body></body>");
  })
  it("God.create creates correct markup", function() {
    window.c = {
      $cell: true,
      _model: [],
      id: "grandparent",
      $components: [{
        id: "parent", 
        $components: [{
          id: "child"
        }]
      }, {
        $type: "div",
        id: "aunt"
      }]
    }
    compare(document.body.outerHTML, "<body></body>");
    God.create(window);
    compare(document.body.outerHTML, "<body><div id=\"grandparent\"><div id=\"parent\"><div id=\"child\"></div></div><div id=\"aunt\"></div></div></body>")
  })
  it("God.create triggers God.detect, the detect correctly detects", function() {
    window.c = {
      $cell: true,
      _model: [],
      id: "grandparent",
      $components: [{
        id: "parent", 
        $components: [{
          id: "child"
        }]
      }, {
        $type: "div",
        id: "aunt"
      }]
    }
    spy.God.detect.reset();
    const bodySpy = sinon.spy(document.body, "$build")
    God.create(window);
    compare(bodySpy.callCount, 1);
    compare(spy.God.detect.callCount, 1);
  })
  describe("context inheritance", function() {
    beforeEach(cleanup);

    it("walks up the DOM tree to find the attribute if it doesn't exist on the current node", function() {
      window.c = {
        $cell: true,
        _model: [1,2,3],
        id: "grandparent",
        $components: [{
          id: "parent", 
          $components: [{
            id: "child"
          }]
        }, {
          $type: "div",
          id: "aunt"
        }]
      }
      God.create(window);
      var $child = document.body.querySelector("#child")
      compare($child._model, [1,2,3]);
    })
    it("finds the attribute on the current element first", function() {
      window.c = {
        $cell: true,
        _model: [1,2,3],
        id: "grandparent",
        $components: [{
          id: "parent", 
          $components: [{
            id: "child",
            _model: ["a"]
          }]
        }, {
          $type: "div",
          id: "aunt"
        }]
      }
      God.create(window);
      var $child = document.body.querySelector("#child")
      compare($child._model, ["a"]);
    })
    it("descendants can share an ancestor's variable", function() {
      window.c = {
        $cell: true,
        _model: [1,2,3],
        id: "grandparent",
        $components: [{
          id: "parent", 
          $components: [{
            id: "child"
          }]
        }, {
          $type: "div",
          id: "aunt"
        }]
      }
      God.create(window);
      var $child = document.body.querySelector("#child")
      var $aunt = document.body.querySelector("#aunt")

      // update _model from child
      $child._model.push("from child");
      compare($child._model, [1,2,3,"from child"]);

      // access _model from aunt (same as above)
      compare($aunt._model, [1,2,3,"from child"])
    })
  })
})

describe("Infects with nice viruses", function() {
  beforeEach(cleanup);

  it("can have an update_propagating_virus", function() {
    function update_propagating_virus(component){
      let recursive_update = (node) => {
        for(let n of node.children){
          n.$update && n.$update()
          recursive_update(n)
        }
      }

      let old_update = component.$update

      component.$update = function(){
        old_update && old_update.call(this)
        recursive_update(this)
      }

      return component
    }

    window.c = {
      $cell: true,
      $type: 'ul',
      _name: '',
      $virus: update_propagating_virus,
      $components: [
        { $type: 'li',
          $components: [
            { $type: 'p',
              $text: '',
              $update: function(){
                this.$text = this._name;
              }
            },
            { $type: 'p', $text: 'other' }
          ]
        }
      ]
    }

    compare(document.body.outerHTML, "<body></body>")
    God.create(window)

    var $node = document.body.querySelector("ul")
    $node._name = "infected"
    Phenotype.$update($node)
    compare(document.body.querySelector("p").$text, 'infected')
  })
  it("can have a markup helper virus", function(){
    function expand_selector(component, selector){
      let parts = selector.match(/([a-zA-Z0-9]*)([#a-zA-Z0-9-_]*)([.a-zA-Z0-9-_]*)/)
      if (parts[1]) component.$type = parts[1]
      if (parts[2]) component.id = parts[2].substring(1)
      if (parts[3]) component['class'] = parts[3].split('.').join(' ').trim()
      return component
    }

    function hamlism(component){
      if(component.$components){
        component.$components = component.$components.map(hamlism)
      }

      let tag = component.$tag
      if(!tag) return component

      selectors = tag.split(' ')
      expand_selector(component, selectors.pop())

      return selectors.reduceRight(function(child, selector){
        return expand_selector({$components: [child]}, selector)
      }, component)
    }
    
    window.c = {
      $cell: true,
      $tag: '.class-a span#id-span.class-b',
      $virus: [ hamlism ],
      $components: [{ $tag: 'li#main.list-item' }]
    }

    compare(document.body.outerHTML, "<body></body>")
    God.create(window)
    compare(document.body.outerHTML,
      '<body>'+
        '<div class="class-a">' +
          '<span id="id-span" class="class-b">'+
            '<li id="main" class="list-item"></li>'+
          '</span>'+
        '</div>'+
      '</body>'
    )
  })
})
