const sinon = require('sinon')
const {Phenotype, Genotype, Nucleus, Membrane, Gene, God} = require("../cell")
module.exports = {
  Genotype: {
    set: sinon.spy(Genotype, "set"),
    update: sinon.spy(Genotype, "update")
  },
  O: {
    defineProperty: sinon.spy(Object, "defineProperty"),
    getOwnPropertyDescriptor: sinon.spy(Object, "getOwnPropertyDescriptor")
  },
  Gene: {
    freeze: sinon.spy(Gene, "freeze")
  },
  Membrane: {
    inject: sinon.spy(Membrane, "inject"),
    add: sinon.spy(Membrane, "add")
  },
  God: {
    create: sinon.spy(God, "create"),
    detect: sinon.spy(God, "detect")
  },
  Phenotype: {
    $init: sinon.spy(Phenotype, "$init"),
    $update: sinon.spy(Phenotype, "$update"),
    $type: sinon.spy(Phenotype, "$type"),
    $components: sinon.spy(Phenotype, "$components"),
    set: sinon.spy(Phenotype, "set")
  },
  Nucleus: {
    bind: sinon.spy(Nucleus, "bind"),
    queue: sinon.spy(Nucleus, "queue")
  }
}
