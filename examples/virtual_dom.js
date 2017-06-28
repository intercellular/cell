const { JSDOM } = require('jsdom');
const cell = require('../cell');

const dom = new JSDOM('<html></html>', {
  beforeParse(window) {
    window.app = {
      $cell: true,
      $type: 'p',
      $text: 'hi!',
    };
  },
});

cell.plan(dom.window);
cell.create(dom.window);

// perhaps this is served to a client
console.log(dom.serialize());
