module.exports = [{
  js: [
    'https://www.celljs.org/cell.js',
    'https://cdnjs.cloudflare.com/ajax/libs/timeago.js/3.0.1/timeago.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.11.0/highlight.min.js',
    './website/demos/twitter.js',
    './website/demos/bitcoin.js'
  ],
  css: [
    'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.11.0/styles/grayscale.min.css',
    'https://fonts.googleapis.com/css?family=Raleway:300,400,500,600,700',
    'https://fonts.googleapis.com/css?family=Merriweather:900',
    './website/style.css'
  ],
  inject: {
    "#mailchimp": "./website/components/mailchimp/form.html"
  },
  init: function() {

    var container = document.createElement('div');
    container.className = 'container';
    document.body.appendChild(container);

    var phd = document.getElementById('phd');
    container.appendChild(phd);

    document.querySelector("#widget").$build($root);
    document.querySelector("#twitter").$build(T);
    hljs.initHighlighting();

    (function(i,s,o,g,r,a,m) {i['GoogleAnalyticsObject']=r;i[r]=i[r]||function() {
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
    ga('create', 'UA-54282166-10', 'auto');
    ga('send', 'pageview');
  }
}]
