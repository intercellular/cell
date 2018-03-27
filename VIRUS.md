# Virus

## Concept
Viruses are a plug-in system that makes it able to include custom transformations to the cells, extending them as far as wanted.

To use it, you should "infect" a Gene with a Virus, which is a function that takes a Gene-like object and returns another Gene-like object. This returned object _could_ be a real Gene or an object to be transformed by another Virus (pretty much like a Pipeline).

## Examples
The following virus propagates the $update method down the inheritance tree when a variable is changed:

```
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
```

As the virus can be any function that expects a component, you can also send other arguments to it.

The following example shows how to make a virus to call a method every X seconds:

```
var Tickable = function(timer, trigger){
  return function(gene) {
    gene.$init = function() {
      var self = this;
      setInterval(function() {
        self[trigger]();
      }, timer);
    }
    return gene;
  }
}

...

  {
    $virus: [Tickable(500, '_mutate')]
  }
```

Refer to the [tests](test/integration.js) for more examples and details.
