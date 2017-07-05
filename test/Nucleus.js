const assert = require('assert')
const sinon = require('sinon')
const stringify = require('json-stable-stringify')
const {God, Phenotype, Genotype, Nucleus} = require("../cell")
const spy = require("./spy.js")
const compare = function(actual, expected) {
  assert.equal(stringify(actual), stringify(expected));
}
describe("Nucleus", function() {
  require('jsdom-global')()
  God.plan(window);
  describe("build", function() {
    // Builds a proxy
    describe("initial build", function() {
      it("creates a nucleus object", function() {
        const $node = document.createElement("div")
        spy.O.defineProperty.reset()
        $node.Meta = {}
        $node.Genotype = {
          $type: "div",
          $text: "Hi",
          $components: []
        }
        Nucleus.build($node)
        compare(spy.O.defineProperty.callCount, 4)
      })
      it("$text and $components are tracked by default", function() {
        const $node = document.createElement("div")
        spy.O.defineProperty.reset()
        $node.Meta = {}
        $node.Genotype = {
          $type: "div"
        }
        Nucleus.build($node)
        // $text and $components are tracked by default
        compare(spy.O.defineProperty.callCount, 4)
      })
    })
    describe("behaviors after the build", function() {
      describe("get", function() {
        let $div;
        beforeEach(function() {
          $div = document.createElement("div")
          $div.Meta = {}
          $div.Genotype = {}
          Nucleus.build($div)
        })
        describe("$/_ variables", function() {
          it("properties that were manually assigned", function() {
            $div.Genotype = {
              $init: function() {
                //This function gets run automatically at init!
              },
              $update: function() {
                this.$text = (this.done ? "done" : "todo")
              },
              _done: false
            }
            Nucleus.build($div)
            Phenotype.build($div, $div.Genotype)
            spy.Nucleus.bind.reset();
            spy.Phenotype.$init.reset();
            spy.Phenotype.$update.reset();
            $div.$init();

            // $init doesn't call update
            compare(spy.Nucleus.bind.callCount, 0)
            compare(spy.Phenotype.$update.callCount, 0)

          })
        })
        describe("DOM attributes", function() {
          it("properties that were explicitly set by the user", function() {
            // test 1
            spy.Nucleus.bind.reset();
            spy.Genotype.update.reset();
            var c = $div.class;

            compare(spy.Genotype.update.callCount, 0);
            compare(c, undefined)

            $div.Genotype = {
              class: "red" 
            }
            Nucleus.build($div)

            // test 2
            spy.Genotype.update.reset();
            $div.class = "red";

            spy.O.getOwnPropertyDescriptor.reset();
            var d = $div.class;
            compare(spy.O.getOwnPropertyDescriptor.callCount, 0);
          })
          it("properties that already exist on the DOM", function() {
            // For example, "tagName", "nodeType", etc. already exist on the element natively, and users nomrally don't set these manually. But sometimes we need to access these
            spy.Nucleus.bind.reset();
            var name = $div.tagName;
            compare(spy.Nucleus.bind.callCount, 0);
            compare(name.toLowerCase(), "div")
          })
          describe("special properties", function() {
            it("style", function() {
              spy.Nucleus.bind.reset();
              spy.Genotype.update.reset();
              var style = $div.style;

              compare(spy.Genotype.update.callCount, 0);

              // the getter returns a CSSStyleDeclaration object
              compare(Object.getPrototypeOf(style).constructor.name, "CSSStyleDeclaration");

              // node setup
              $div.Genotype = {
                style: "background-color: red;" 
              }
              Nucleus.build($div)

              spy.O.getOwnPropertyDescriptor.reset();

              // getter is called, and the key is 'style' 
              // so Object.getOwnPropertyDescriptor is called
              style = $div.style;
              compare(spy.O.getOwnPropertyDescriptor.callCount, 1);
              // the getter returns a CSSStyleDeclaration object
              compare(Object.getPrototypeOf(style).constructor.name, "CSSStyleDeclaration");

              // string type style setter
              spy.Genotype.update.reset();
              spy.O.getOwnPropertyDescriptor.reset();
              $div.style = "background-color: blue;";
              // since the setter is called and it's not an object type style,
              // it will trigger setAttribute and not Object.getOwnPropertyDescriptor
              compare(spy.O.getOwnPropertyDescriptor.callCount, 0);

              // object type style setter
              spy.O.getOwnPropertyDescriptor.reset();
              $div.style = {
                backgroundColor: "blue"
              }
              // triggers setter, which triggers getter, both of which calls Object.getOwnPropertyDescriptor => 2
              compare(spy.O.getOwnPropertyDescriptor.callCount, 2);
              
            });
          });
        })
      })
      describe("set", function() {
        it("when a nucleus attribute is set, its Genotype.update gets triggered automatically", function() {
          let $div = document.createElement("div")
          $div.Meta = {}
          $div.Genotype = {
            class: null
          }
          Nucleus.build($div)
          
          spy.Genotype.update.reset()
          $div.class = "red";
          compare(spy.Genotype.update.callCount, 1);
        })
        it("if the attribute is not declared, its Genotype.update DOES NOT get triggered automatically", function() {
          let $div = document.createElement("div")
          $div.Meta = {}
          $div.Genotype = { }
          Nucleus.build($div)
          
          spy.Genotype.update.reset()
          $div.class = "red";
          compare(spy.Genotype.update.callCount, 0);
        })
      })
    })
    describe("default tracked attributes", function() {
      it("tracks $text, $html, $type, $components", function() {
        // $type, $text, $components get tracked for change by default
        // so that their change auto-triggers $update()
        let $div = document.createElement("div")
        $div.Meta = {}
        $div.Genotype = { }
        Nucleus.build($div)
        var ret = Nucleus.bind($div, "non-function")
        Nucleus.build($div);
        compare($div.hasOwnProperty("$type"), true)
        compare($div.hasOwnProperty("$text"), true)
        compare($div.hasOwnProperty("$html"), true)
        compare($div.hasOwnProperty("$components"), true)
      })
    })
  })
  describe("bind", function() {
    describe("when a non-function is passed", function() {
      it("returns a non-function", function() {
        let $div = document.createElement("div")
        $div.Meta = {}
        $div.Genotype = {}
        Nucleus.build($div)
        var ret = Nucleus.bind($div, "non-function")
        compare(typeof ret, "string")
      })
    })
    describe("when function is passed", function() {
      it("returns a function", function() {
        let $div = document.createElement("div")
        $div.Meta = {}
        $div.Genotype = {}
        Nucleus.build($div)
        var ret = Nucleus.bind($div, function() { /* something */ })
        compare(typeof ret, "function")
      })
      describe("post binding behavior", function() {
        let $div;
        let oldFun;
        beforeEach(function() {
          $div = document.createElement("div")
          $div.Meta = {}
          $div.Genotype = {
            $type: "div",
            _todo: true,
            _done: true,
            $update: function() { }
          }
          oldFun = function(name) {
            return "hello, " + name;
          };
          oldMutationFun = function(name) {
            this._done = false;
            return "hello, " + name;
          };
          Nucleus.build($div)
        })
        it("executes the original function", function() {
          let oldFunSpy = sinon.spy(oldFun, "apply");
          var newFun = Nucleus.bind($div, oldFun);
          newFun("world")
          compare(oldFunSpy.callCount, 1)
        })
        it("executes the original function and returns the correct value", function() {
          var newFun = Nucleus.bind($div, oldFun);
          compare(newFun("world"), "hello, world")
        })
        it("empties the queue", function(done) {
          var newFun = Nucleus.bind($div, oldFun);
          Nucleus._queue = [];
          Nucleus._queue.push($div)
          newFun("world")
          setTimeout(function() {
            compare(Nucleus._queue, [])
            done()
          }, 100)
        })
        describe("phenotype.update (not to be confused with $update)", function() {
          it("Nucleus.queue doesn't keep duplicates", function() {
            Nucleus._queue = []
            for(let i = 0; i<10; i++) {
              Nucleus.queue($div)
            }
            compare(Nucleus._queue.length, 1)
          })
          it("calls Phenotype.set if something has changed (not to be confused with $update)", function(done) {
            Nucleus._queue = []
            for(let i = 0; i<10; i++) {
              Nucleus.queue($div)
            }

            spy.Phenotype.set.reset()

            var newMutationFun = Nucleus.bind($div, oldMutationFun);
            newMutationFun("world")

            // 10 tasks * 3 keys
            setTimeout(function() {
              compare(spy.Phenotype.set.callCount, 1)
              done()
            }, 100)

          })
          it("does not calls Phenotype.set if nothing has changed (not to be confused with $update)", function(done) {
            Nucleus._queue = []
            for(let i = 0; i<10; i++) {
              Nucleus._queue.push($div)
            }

            spy.Phenotype.set.reset()

            var newFun = Nucleus.bind($div, oldFun);
            newFun("world")

            // 10 tasks * 3 keys
            setTimeout(function() {
              compare(spy.Phenotype.set.callCount, 0)
              done()
            }, 100)

          })
        })
        describe("auto-calling $update", function() {
          it("doesn't call $update if there's no $update", function(done) {
            Nucleus._queue = []
            delete $div.Genotype.$update
            for(let i = 0; i<10; i++) {
              Nucleus.queue($div, "_done")
            }

            $div.Genotype._done = false;

            spy.Phenotype.set.reset()
            spy.Phenotype.$update.reset()

            var newFun = Nucleus.bind($div, oldFun);
            newFun("world")

            setTimeout(function() {
              compare(spy.Phenotype.$update.callCount, 0)
              done()
            }, 100)
          })
          it("calls Phenotype.$update if a '_' variable is in the queue", function(done) {
            spy.Gene.freeze.reset()
            Nucleus._queue = []
            for(let i = 0; i<10; i++) {
              Nucleus.queue($div, "_done")
              Nucleus.queue($div, "_todo")
            }

            compare(Nucleus._queue.length, 1) // only one element in the queue
            compare(spy.Gene.freeze.callCount, 2)

            $div.Genotype._todo = false;
            $div.Genotype._done = false;

            spy.Phenotype.set.reset()
            spy.Phenotype.$update.reset()

            var newFun = Nucleus.bind($div, oldFun);
            newFun("world")

            setTimeout(function() {
              // 1 task * 2 keys
              compare(spy.Phenotype.set.callCount, 2)

              // call $update once
              compare(spy.Phenotype.$update.callCount, 1)
              done()
            }, 100)

          })
          describe("sets the queue correctly if $type, $text, $html, or $components is updated", function(done) {
            it("$type", function() {
              var $d = document.createElement("div");
              var $node = $d.$build({
                $type: "div",
                $text: "hi"
              }, [])

              $node.$type = "span";
              setTimeout(function() {
                compare(spy.Genotype.update.callCount, 1)
                compare(Nucleus._queue.length, 1)
                compare(Nucleus._queue[0].Genotype, {$type: "span", $text: "hi"})
                compare(Nucleus._queue[0].Dirty, {$type: "dirty"})
                done()
              }, 100)
              
            })
            it("$text", function() {
              var $d = document.createElement("div");
              var $node = $d.$build({
                $type: "div",
                $text: "hi"
              }, [])

              $node.$text = "bye";
              setTimeout(function() {
                compare(spy.Genotype.update.callCount, 1)
                compare(Nucleus._queue.length, 1)
                compare(Nucleus._queue[0].Genotype, {$type: "div", $text: "bye"})
                compare(Nucleus._queue[0].Dirty, {$text: "hi"})
                done()
              }, 100)
              
            })
            it("$html", function() {
              var $d = document.createElement("div");
              var $node = $d.$build({
                $type: "div",
                $html: "<p>Hello</p>"
              }, [])

              $node.$html = "<p><span>Hello</span> world</p>";
              setTimeout(function() {
                compare(spy.Genotype.update.callCount, 1)
                compare(Nucleus._queue.length, 1)
                compare(Nucleus._queue[0].Genotype, {$type: "div", $html: "<p>Hello</p>"})
                compare(Nucleus._queue[0].Dirty, {$html: "<p><span>Hello</span> world</p>"})
                done()
              }, 100)
              
            })
            it("$components", function() {
              var $d = document.createElement("div");
              var $node = $d.$build({
                $type: "div",
                $text: "hi"
              }, [])

              $node.$components = [{$type: "div", $text: "child"}]
              setTimeout(function() {
                compare(spy.Genotype.update.callCount, 1)
                compare(Nucleus._queue.length, 1)
                compare(Nucleus._queue[0].Genotype, {$type: "div", $text: "hi", $components: [{$type: "div", $text: "child"}]})
                compare(Nucleus._queue[0].Dirty, {$components: "[{$type: \"div\", $text: \"child\"}]"})
                done()
              }, 100)
              
            })
          })
          it("doesn't call Phenotype.$update if a '_' variable is NOT in the queue", function(done) {
            Nucleus._queue = []
            $div.Genotype = {
              $type: "div",
              class: 'red'
            }
            for(let i = 0; i<10; i++) {
              Nucleus.queue($div)
            }

            spy.Phenotype.set.reset()
            spy.Phenotype.$update.reset()

            var newFun = Nucleus.bind($div, oldFun);
            newFun("world")

            setTimeout(function() {
              // 10 tasks * 2 keys
              compare(spy.Phenotype.set.callCount, 0)

              // _todo key exists so call $update for all elements
              compare(spy.Phenotype.$update.callCount, 0)
              done()
            }, 100)

          })
        })
      })
    })
  })
  describe("queue", function() {
    it("basic structure", function() {
      let $div1 = document.createElement("div")
      $div1.Meta = {}
      $div1.Genotype = {}
      Nucleus.build($div1)

      let $div2 = document.createElement("div")
      $div2.Meta = {}
      $div2.Genotype = {}
      Nucleus.build($div2)

      /*
        each task looks like this:
        {
          $node: $div,
          keys: {
            $type: null
          }
        }
      */

      Nucleus._queue = []
      Nucleus.queue($div1, "$type")
      Nucleus.queue($div1, "_type")
      Nucleus.queue($div2, "_todo")

      assert.equal(Nucleus._queue[0], $div1)
      assert.equal(Nucleus._queue[1], $div2)
      compare(Nucleus._queue.length, 2)
    })
    describe("queueing creates Dirty", function() {
      // All 'Dirty' objects are stringified (frozen) versions of the original
      it("simple object", function() {
        var $div = document.createElement("div")
        $div.Meta = {}
        $div.Genotype = {
          $type: "div",
          _todo: true,
          _done: true
        }
        compare($div.Dirty, undefined)
        Nucleus.build($div)
        Nucleus.queue($div, "_todo")
        compare($div.Dirty, {"_todo": "true"})
        Nucleus.queue($div, "_done")
        compare($div.Dirty, {"_todo": "true", "_done": "true"})
      })
      it("complex object", function() {
        var $div = document.createElement("div")
        $div.Meta = {}
        $div.Genotype = {
          $type: "div",
          _items: [1,2,3,4,5],
          _index: 2
        }
        compare($div.Dirty, undefined)
        Nucleus.build($div)
        Nucleus.queue($div, "_items")
        compare($div.Dirty, {"_items": "[1,2,3,4,5]"})
        Nucleus.queue($div, "_index")
        compare($div.Dirty, {"_items": "[1,2,3,4,5]", "_index": "2"})
      })
    })
  })
})
