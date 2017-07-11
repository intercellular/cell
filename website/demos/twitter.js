var T = { $cell: true, $components: [
  { $type: "link", href: "./website/demos/twitter.css", rel: "stylesheet" },
  { $components: [], class: "container", id: "twitter",
    _add: function(data){ this.$components = [this._mediaItem(data)].concat(this.$components).slice(0,50) },
    $init: function(){
      var ws = new WebSocket('wss://twitsocket.herokuapp.com').addEventListener('message', function (event) { this._add(JSON.parse(event.data)) }.bind(this)) },
    _mediaItem: function(data){
      return { class: "item hidden", $init: function(){ this.class = "item" },
        $components: [
          { style: "display: block;", $components: [{$type: "img", class: "avatar", src: data.user.profile_image_url_https }] },
          { class: "body", $components: [
            { $type: "h5", $text: data.user.name + " (" + data.user.screen_name + ")" }, { $type: "text", $text: data.text }
          ].concat( data.extended_entities && data.extended_entities.media ? [{ $type: "img", src: data.extended_entities.media[0].media_url_https }] : [] ) } ] } } } ]}
