const assert = require('assert')
const sinon = require('sinon')
const spy = require("./spy.js")
const stringify = require('json-stable-stringify')
const {God, Phenotype, Nucleus} = require("../cell")
const compare = function(actual, expected) {
  assert.equal(stringify(actual), stringify(expected));
}
describe("Phenotype", function() {
  require('jsdom-global')()
  God.plan(window);
  describe("attrs", function() {
    describe("$type", function() {
      describe("text", function() {
        it("empty text node", function() {
          const node = Phenotype.$type({$type: "text"})
          compare(node.nodeType, 3) // Node.TEXT_NODE 3
        })
        it("text node with content", function() {
          const node = Phenotype.$type({$type: "text", $text: "Hello World"})
          compare(node.nodeType, 3)
          compare(node.textContent, "Hello World")
          compare(typeof node.innerHTML, "undefined")
        })
      })
      describe("svg", function() {
        it("svg", function() {
          const node = Phenotype.$type({$type: "svg"})
          compare(node.tagName.toLowerCase(), "svg")
          compare(node.namespaceURI, "http://www.w3.org/2000/svg")
          compare(node.Meta, {namespace: "http://www.w3.org/2000/svg"})
        })
        it("svg children", function() {
          const node = Phenotype.$type({$type: "p"}, "dummy namespace")
          compare(node.namespaceURI, "dummy namespace")
          compare(node.Meta, {namespace: "dummy namespace"})
        })
        it("text node as svg descendent", function() {
          const node = Phenotype.$type({$type: "text"}, "http://www.w3.org/2000/svg")
          // Should not be a text node. Should be a svg text node
          compare(node.nodeType === Node.TEXT_NODE, false)
          compare(node.namespaceURI, "http://www.w3.org/2000/svg");
          compare(node.Meta, {namespace: "http://www.w3.org/2000/svg"})
        })
      })
      it("fragment", function() {
        const node = Phenotype.$type({$type: "fragment"})
        compare(node.nodeType, 11)  // Node.DOCUMENT_FRAGMENT_NODE  11
        compare(node.Meta, {})
      })
      it("without type => default div", function() {
        const node = Phenotype.$type({})
        compare(node.nodeType, 1)  // Node.ELEMENT_NODE  1
        compare(node.tagName.toLowerCase(), "div")
        compare(node.Meta, {})
      })
      describe("with type", function() {
        it("basic", function() {
          const node = Phenotype.$type({$type: "p"})
          compare(node.nodeType, 1)  // Node.ELEMENT_NODE  1
          compare(node.tagName.toLowerCase(), "p")
          compare(node.Meta, {})
        })
        it("doesn't fill in the text yet", function() {
          const node = Phenotype.$type({$type: "p", $text: "hi"})
          compare(node.nodeType, 1)  // Node.ELEMENT_NODE  1
          compare(node.tagName.toLowerCase(), "p")
          compare(node.Meta, {})
          compare(node.innerHTML, "");
          compare(node.outerHTML, "<p></p>")
        })
        it("doesn't set the attribute yet", function() {
          const node = Phenotype.$type({$type: "p", class: "red"})
          compare(node.nodeType, 1)  // Node.ELEMENT_NODE  1
          compare(node.tagName.toLowerCase(), "p")
          compare(node.Meta, {})
          compare(node.getAttribute('class'), null)
          compare(node.class, undefined)
        })
      })
    })
    describe("html", function() {
      it("html node with content", function() {
        const node = Phenotype.$type({ $html: '<p></p>' })
        compare(node.nodeType, 1);
      })
    })
    describe("$components", function() {
      it("basic", function() {
        var $node = root.document.body.$build({$type: "ul"}, [])
        spy.Phenotype.$init.reset();
        Phenotype.$components($node, [{
          $type: "li",
          class: "red"
        }, {
          $type: "li",
          class: "green"
        }, {
          $type: "li",
          class: "blue"
        }])
        compare($node.outerHTML, "<ul><li class=\"red\"></li><li class=\"green\"></li><li class=\"blue\"></li></ul>")
        compare(spy.Phenotype.$init.callCount, 3)
      })
      it("$fragment.$build gets called components number of times", function() {
        var $parent = root.document.body.$build({$type: "ul"}, [])
        const components = [{
          $type: "li",
          class: "red"
        }, {
          $type: "li",
          class: "green"
        }, {
          $type: "li",
          class: "blue"
        }]

        // spy
        const fragmentSpy = sinon.spy(DocumentFragment.prototype, "$build")

        // Before
        compare($parent.innerHTML, "")
        compare($parent.outerHTML, "<ul></ul>")

        Phenotype.$components($parent, components)

        // After
        compare(fragmentSpy.callCount, 3)  // loop three times
        compare($parent.outerHTML, "<ul><li class=\"red\"></li><li class=\"green\"></li><li class=\"blue\"></li></ul>")
      })
      it("ties each child component's Genotypes onto the current element's $components array", function() {
        var $parent = root.document.body.$build({$type: "ul"}, [])
        const components = [{
          $type: "li", class: "red"
        }, {
          $type: "li", class: "green"
        }, {
          $type: "li", class: "blue"
        }]
        Phenotype.$components($parent, components)
        compare($parent.$components, components)
      })
      it("attaches attributes to the inheritance array", function() {
        // inheritance is an array of keys inherited down the DOM tree.
        // This necessary because we need to monitor all the inherited keys from the descendants
        var $parent = root.document.body.$build({
          $type: "ul",
          _index: 1,
          $components: [{
            $type: "li", class: "red"
          }, {
            $type: "li", class: "green"
          }, {
            $type: "li", class: "blue"
          }]
        }, [])
        compare($parent.Inheritance, [])
        compare($parent.childNodes[0].Inheritance, ["_index"])
        compare($parent.childNodes[1].Inheritance, ["_index"])
        compare($parent.childNodes[2].Inheritance, ["_index"])
      })
      describe("injecting into existing nodes should remove all childNodes first", function(){
        it("injecting into body", function(){
          document.body.innerHTML = "   ";
          compare(document.body.childNodes.length, 1);
          var gene = {
            $type: "body",
            $cell: true,
            $components: [{ class: "container" }]
          }
          var $node = root.document.body.$build(gene, []);
          // building should end up with 1 node (not 2) because the empty text node has been deleted
          compare($node.childNodes.length, 1);
        })
        it("injecting into element with id", function(){
          document.body.innerHTML = "<div id='widget'>Old</div>";
          compare(document.body.childNodes.length, 1);
          var gene = {
            $cell: true, $type: "div", id: "widget",
            $components:[{
              $type: "span",
              $text: "New"
            }]
          };
          var $node = root.document.body.$build(gene, []);
          // should replace the old content
          compare($node.innerHTML, "<span>New</span>");
          // building should end up with 1 node (not 2) because the contents are removed before cell is injected
          compare($node.childNodes.length, 1);
        })
      })
    })
    describe("$init", function() {
      beforeEach(function() {
        Nucleus._queue = []
      })
      it("$init should not trigger $update automatically", function() {
        const $parent = document.createElement("div");
        const $node = document.createElement("div")
        $node.Genotype = {
          $type: "div",
          $init: function() {
            // something
          }
        }
        $node.Meta = {}
        $parent.appendChild($node)

        // Bypass setTimeout
        const clock = sinon.useFakeTimers();

        // spy reset
        spy.Nucleus.bind.reset()
        Phenotype.$init($node)
        clock.tick(1);
        compare(spy.Phenotype.$update.callCount, 0)  // should be called

        // Restore timer
        clock.restore();
      })
    })
    describe("$update", function() {
      describe("should call Nucleus.$update correctly in normal cases", function() {
        it("first time ever", function() {
          const $parent = document.createElement("div");
          const $node = document.createElement("div");
          $node.Genotype = {
            _counter: 0,
            $update: function() {
              // something
              this._counter = this._counter+1;
            }
          }
          $node.Meta = {}
          Nucleus.build($node);
          $parent.appendChild($node)

          compare($node._counter, 0)

          const NodeUpdateSpy = sinon.spy($node.Genotype, "$update")
          NodeUpdateSpy.reset()

          Phenotype.$update($node)
          compare(NodeUpdateSpy.callCount, 1)
          compare($node._counter, 1)
        })
      })
      it("detached node shouldn't update (!$node.parentNode)", function() {
        const $node = document.createElement("div");
        $node.Genotype = {
          $update: function() {
            // something
          }
        }
        $node.Meta = {}
        $node.Nucleus = {$update: function() { }}

        const NucleusUpdateSpy = sinon.spy($node.Nucleus, "$update")
        NucleusUpdateSpy.reset()

        Phenotype.$update($node)
        compare(NucleusUpdateSpy.callCount, 0)
      })
      it("shouldn't call Nucleus.$update if already updated ($node.Meta.$updated)", function() {
        const $node = document.createElement("div");
        $node.Genotype = {
          $update: function() {
            // something
          }
        }
        $node.Meta = {$updated: true}
        $node.Nucleus = {$update: function() { }}

        const NucleusUpdateSpy = sinon.spy($node.Nucleus, "$update")
        NucleusUpdateSpy.reset()

        Phenotype.$update($node)
        compare(NucleusUpdateSpy.callCount, 0)
      })
    })
  })
  describe("build", function() {
    it("iterates through all keys in the Genotype", function() {
      spy.Phenotype.$init.reset();
      spy.Phenotype.set.reset();
      const $node = document.createElement("div")
      $node.Meta = {};
      const replaceChildSpy = sinon.spy($node, "replaceChild")
      Phenotype.build($node, {$type: "div", $text: "hi", class: "red"});
      compare(spy.Phenotype.set.callCount, 3)  // iterates through all 3 keys
      compare(replaceChildSpy.callCount, 0) // should not get inside the replace block
      compare(spy.Phenotype.$init.callCount, 1)
    })
  })
  describe("update", function() {
    describe("[$] Reserved variables", function() {
      describe("$type", function() {
        it("Phenotype.$init called via fragment.$build", function() {
          // parent
          const $parent = document.createElement("div");
          $parent.setAttribute("class", "wrapper")

          // node
          const $node = document.createElement("div")
          $node.Genotype = {}
          $node.Meta = {}
          $parent.appendChild($node)

          // spy
          const replaceChildSpy = sinon.spy($parent, "replaceChild")
          spy.Phenotype.$init.reset();

          // run
          Phenotype.set($node, "$type", "div")

          // fragment.$build would trigger an $init,
          // but in this case we're not supposed to enter that block so the callcount is 0
          compare(spy.Phenotype.$init.callCount, 0)
          compare(replaceChildSpy.callCount, 0)
          compare($parent.outerHTML, "<div class=\"wrapper\"><div></div></div>")
          compare($parent.innerHTML, "<div></div>")
        })
        it("Replace if the type is different", function() {
          // parent
          const $parent = document.createElement("div");
          $parent.setAttribute("class", "wrapper")

          // node
          const $node = document.createElement("div")
          $node.Genotype = {"$type": "p"}
          $node.Meta = {}
          $parent.appendChild($node)

          // spy
          const replaceChildSpy = sinon.spy($parent, "replaceChild")
          spy.Phenotype.$init.reset();

          // run
          Phenotype.set($node, "$type", "p")

          // $init is called via fragment.$build even if it's not explicitly called
          compare(spy.Phenotype.$init.callCount, 1)
          compare(replaceChildSpy.callCount, 1)
          compare($parent.outerHTML, "<div class=\"wrapper\"><p></p></div>")
          compare($parent.innerHTML, "<p></p>")
        })
      })
      it("$text", function() {
        // updates innerHTML
        const $parent = document.createElement("div");
        const $node = document.createElement("div")
        $node.Genotype = {}
        $node.Meta = {}
        $parent.appendChild($node)
        compare($node.innerHTML, "")
        Phenotype.set($node, "$text", "Hello")
        compare($node.innerHTML, "Hello")
      })
      describe("$components", function() {
        it("empty components should also trigger `$components` call", function() {
          const $parent = document.createElement("div");
          const $node = document.createElement("div")
          $node.Genotype = {}
          $node.Meta = {}
          $parent.appendChild($node)

          // spy
          spy.Phenotype.$components.reset();

          // Before
          compare($node.innerHTML, "")

          Phenotype.set($node, "$components", [])

          // After
          compare(spy.Phenotype.$components.callCount, 1)
        })
        it("components with more 0 items should trigger `$components` call", function() {
          const $parent = document.createElement("div");
          const $node = document.createElement("div")
          $node.Genotype = {}
          $node.Meta = {}
          $parent.appendChild($node)

          // spy
          spy.Phenotype.$components.reset();

          // Before
          compare($node.innerHTML, "")

          Phenotype.set($node, "$components", [{$type: "div"}])

          // After
          compare(spy.Phenotype.$components.callCount, 1)
        })
      })
    })
    describe("[_] User defined variables", function() {
    })
    describe("[ ] dom attributes", function() {
      describe("object", function() {
        it("style", function() {
          const $parent = document.createElement("div");
          const $node = document.createElement("div")
          $node.Genotype = {}
          $node.Meta = {}
          $parent.appendChild($node)

          // normally it's set directly on the DOM as an attribute
          var styleAttr = $node.getAttribute("style");
          compare(styleAttr, null);

          var styleProp = $node.style;
          compare(Object.getPrototypeOf(styleProp).constructor.name, "CSSStyleDeclaration");

          Phenotype.set($node, "style", {
            backgroundColor: "red",
            fontFamily: "Courier"
          })

          styleAttr = $node.getAttribute("style");
          styleProp = $node.style;

          compare(styleAttr, "background-color: red; font-family: Courier;")
          compare(styleProp.backgroundColor, "red");
          compare(styleProp.fontFamily, "Courier");

          compare(Object.getPrototypeOf(styleProp).constructor.name, "CSSStyleDeclaration");

        });
      });
      describe("string", function() {
        it("style", function() {
          const $parent = document.createElement("div");
          const $node = document.createElement("div")
          $node.Genotype = {}
          $node.Meta = {}
          $parent.appendChild($node)

          // normally it's set directly on the DOM as an attribute
          var styleAttr = $node.getAttribute("style");
          compare(styleAttr, null);

          var styleProp = $node.style;
          compare(Object.getPrototypeOf(styleProp).constructor.name, "CSSStyleDeclaration");

          Phenotype.set($node, "style", "background-color: red;")

          styleAttr = $node.getAttribute("style");
          styleProp = $node.style;

          compare(styleAttr, "background-color: red;")
          // even if we initially set the style as string,
          // we should be able to access it as an object property
          compare(styleProp.backgroundColor, "red");
          compare(Object.getPrototypeOf(styleProp).constructor.name, "CSSStyleDeclaration");

        });
        it("class", function() {
          const $parent = document.createElement("div");
          const $node = document.createElement("div")
          $node.Genotype = {}
          $node.Meta = {}
          $parent.appendChild($node)

          // normally it's set directly on the DOM as an attribute
          compare($node.getAttribute("class"), null)
          compare($node.class, undefined)

          Phenotype.set($node, "class", "red")

          compare($node.getAttribute("class"), "red")
          compare($node.class, undefined)
        })
        it("value for pre-populated input", function() {
          //Phenotype.set($node, "value", "bye")
          const $parent = document.createElement("div");
          const $node = document.createElement("input")
          $node.value = "preset";
          $node.Genotype = {}
          $node.Meta = {}
          $parent.appendChild($node)

          // normally it's set directly on the DOM as an attribute
          compare($node.value, "preset")

          Phenotype.set($node, "value", "reset")

          compare($node.value, "reset")

        })
        it("value for empty input", function() {
          //Phenotype.set($node, "value", "bye")
          const $parent = document.createElement("div");
          const $node = document.createElement("input")
          $node.Genotype = {}
          $node.Meta = {}
          $parent.appendChild($node)

          // normally it's set directly on the DOM as an attribute
          compare($node.getAttribute("value"), null)
          compare($node.value, "")

          Phenotype.set($node, "value", "newval")

          compare($node.value, "newval")
        })
      })
      it("number", function() {
        const $parent = document.createElement("div");
        const $node = document.createElement("div")
        $node.Genotype = {}
        $node.Meta = {}
        $parent.appendChild($node)

        // Before
        compare($node.getAttribute("data-id"), null)
        compare($node["data-id"], undefined)

        Phenotype.set($node, "data-id", 1)

        // After
        compare($node.getAttribute("data-id"), "1") // only set to the DOM attribute (as string)
        compare($node["data-id"], undefined)  // the property should be undefined
      })
      it("boolean", function() {
        const $parent = document.createElement("div");
        const $node = document.createElement("div")
        $node.Genotype = {}
        $node.Meta = {}
        $parent.appendChild($node)

        // Before
        compare($node.getAttribute("data-done"), null)
        compare($node["data-done"], undefined)

        Phenotype.set($node, "data-done", true)

        // After
        compare($node.getAttribute("data-done"), "true") // only set to the DOM attribute (as string)
        compare($node["data-done"], undefined)  // the property should be undefined
      })
      it("function (only native HTMLElement methods are supported)", function() {
        const $parent = document.createElement("div");
        const $node = document.createElement("div")
        $node.Genotype = {}
        $node.Meta = {}
        $parent.appendChild($node)

        // Before
        compare($node.getAttribute("onclick"), null)

        spy.O.getOwnPropertyDescriptor.reset();

        Phenotype.set($node, "onclick", function(arg) {
          return "fun " + arg;
        })

        // After
        compare($node.getAttribute("onclick"), null) // Doesn't exist as a DOM attribute
        compare(spy.O.getOwnPropertyDescriptor.callCount, 1); // tries once for HTMLElement and finds onclick so only one time trial.


        // NON HTMLElement method set
        spy.O.getOwnPropertyDescriptor.reset();
        Phenotype.set($node, "fun", function(arg) {
          return "fun " + arg;
        })
        compare($node.getAttribute("fun"), null) // Doesn't exist as a DOM attribute
        compare(spy.O.getOwnPropertyDescriptor.callCount, 2); // tries both for HTMLElement and Element, because `fun` doesn't exist.

      })
    })
  })
})
