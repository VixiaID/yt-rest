var http = require('http');
var unirest = require('unirest');
const isUrl = require("is-valid-http-url");
var beautify = require("json-beautify");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

var formatThousandsRegExp=/\B(?=(\d{3})+(?!\d))/g,formatDecimalsRegExp=/(?:\.0*|(\.[^0]+)0+)$/,map={b:1,kb:1024,mb:1&lt;&lt;20,gb:1&lt;&lt;30,tb:Math.pow(1024,4),pb:Math.pow(1024,5)},parseRegExp=/^((-|\+)?(\d+(?:\.\d+)?)) *(kb|mb|gb|tb|pb)$/i;function bytes(a,e){return"string"==typeof a?parse(a):"number"==typeof a?format(a,e):null}function format(a,e){if(!Number.isFinite(a))return null;var r=Math.abs(a),t=e&amp;&amp;e.thousandsSeparator||"",p=e&amp;&amp;e.unitSeparator||"",o=e&amp;&amp;void 0!==e.decimalPlaces?e.decimalPlaces:2,n=Boolean(e&amp;&amp;e.fixedDecimals),m=e&amp;&amp;e.unit||"";m&amp;&amp;map[m.toLowerCase()]||(m=r&gt;=map.pb?"PB":r&gt;=map.tb?"TB":r&gt;=map.gb?"GB":r&gt;=map.mb?"MB":r&gt;=map.kb?"KB":"B");var s=(a/map[m.toLowerCase()]).toFixed(o);return n||(s=s.replace(formatDecimalsRegExp,"$1")),t&amp;&amp;(s=s.replace(formatThousandsRegExp,t)),s+p+" "+m}function parse(a){if("number"==typeof a&amp;&amp;!isNaN(a))return a;if("string"!=typeof a)return null;var e,r=parseRegExp.exec(a),t="b";return r?(e=parseFloat(r[1]),t=r[4].toLowerCase()):(e=parseInt(a,10),t="b"),Math.floor(map[t]*e)}

http.createServer(function (req, res) {
    res.writeHead(200, {
        "Access-Control-Allow-Origin": "*",
        "content-type": "text/plain"
    });
    if (req.url.split("/?get=")[1] == undefined == false &amp;&amp; isUrl(req.url.split("/?get=")[1]) == true &amp;&amp; req.method === "GET") {
      let linkYt=req.url.split("/?get=")[1];
      unirest('GET',linkYt)
      .end(function (resku) {
        const dom = new JSDOM(resku.raw_body);
        let dbSc=dom.window.document.querySelectorAll("script");
        let dbScript=[];
        dbSc.forEach(function(a){
          if(a.innerHTML.indexOf("ytInitialPlayerResponse")&gt;0){
            dbScript.push(a.innerHTML);
          };
        });
        let fixScript="";
        dbScript.forEach(function(b){
          if(b.indexOf("streamingData")&gt;0){
            fixScript=b;
          };
        });
        try{
          eval(fixScript);
          let dbFormat = ytInitialPlayerResponse.streamingData.adaptiveFormats;
          let fixData=[];
          let nameFile="video";
          if(ytInitialPlayerResponse.videoDetails){
            nameFile=encodeURIComponent(ytInitialPlayerResponse.videoDetails.title);
          };
          dbFormat.forEach(function(c){
            var formatData={};
            formatData["url"]=c.url+"&amp;title="+nameFile;
            formatData["mime"]=c.mimeType;
            formatData["size"]=bytes(Number(c.contentLength));
            if(c.fps){
              formatData["fps"]=c.fps;
            }else{
              formatData["fps"]="-";
            };
            if(c.qualityLabel){
              formatData["quality"]=c.qualityLabel;
            }else{
              formatData["quality"]="-";
            };
            fixData.push(formatData);
          });
          res.end(beautify(fixData, null, 2, 100));
        }catch(e){
          res.end("error!");
        };
      });
    } else {
      res.end("error!");
    };
}).listen(process.env.PORT);