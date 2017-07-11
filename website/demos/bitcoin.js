/****************************************************
Bitcoin Ticker powered by wss://api.bitfinex.com/ws 
*****************************************************/
Item = function(o){
  return {
    class: "row hidden",
    $init: function(){
      var t = this;
      setTimeout(function(){ t._display() }, 200)
    },
    _display: function(){ this.class = "row" },
    $components: [
      { $type: "h1", $text: "$" + o.dollars },
      { class: "timestamp", _timestamp: o.timestamp, $text: Timeago(o.timestamp), _refresh: function(){
        this.$text = Timeago(this._timestamp)
      }}
    ]
  }
}

Btn = {
  $type: "a", $text: "View Source", target: "_blank", href: "https://gliechtenstein.github.io/bitcoin.cell.js/bitcoin.js",
  style: "position: absolute; top:10px; right:10px; padding: 8px 15px; border: 1px solid rgba(255,255,255,0.2); text-decoration: none; color: rgba(255,255,255,0.9); font-weight: normal; font-size: 12px; border-radius: 4px;"
}

Bitcoin = function($el){
  var ws = new WebSocket('wss://api.bitfinex.com/ws')
  ws.addEventListener('message', function (event) {
    if(Array.isArray(JSON.parse(event.data))) $el._add(JSON.parse(event.data))
  })
  ws.addEventListener('open', function (event) {
    ws.send(JSON.stringify({ "event":"subscribe", "channel":"ticker", "pair":"BTCUSD" }))
  })
  return ws;
}

Container = {
  class: "container",
  $init: function(){ this._bitcoin = Bitcoin(this) },
  $components: [],
  _add: function(data){
    if(data[1] !== "hb"){
      this.$components.unshift(Item({dollars: data[1], timestamp: Date.now()}))
      this.querySelectorAll(".timestamp").forEach(function(timestamp){ timestamp._refresh() })
    }
  }
}

Timeago = function(d){ return timeago().format(d) }

$root = {
  $cell: true, id: "widget", style: "position: relative;",
  $components: [Container, Btn]
}
