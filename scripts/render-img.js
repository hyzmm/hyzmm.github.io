const url_for = require('hexo-util').url_for.bind(hexo);

hexo.extend.filter.register('after_post_render', function(data) {
	if(data.layout=='post'||data.layout=='page'||data.layout=='about'){
		data.content=data.content.replace(/(<(img|a) *(src|href)=")(?!http:\/\/|https:\/\/|\/\/)(.*?)"/gi, '$1' + data.path.replace(/([^\/]+).html$/g,'').replace("//./", "/") + '$4"').replace(/\/post\//g, "").replace(/\/\/\.\//g, "/");
	}
    return data;
});

hexo.extend.filter.register("marked:renderer", function (renderer) {
  const { config } = this; // Skip this line if you don't need user config from _config.yml
  renderer.image = function (href, title, text) {
    const [url, query] = href.split("?");
    let img = `<img src="${url_for(url)}"`;
    if (!query) return img + ">";

    const paramMap = {};
    query.split("&").forEach((e) => {
      const arr = e.split("=");
      if (arr[1] == null) {
        paramMap[arr[0]] = true;
      } else {
        paramMap[arr[0]] = arr[1];
      }
    });

    if (paramMap.w) {
      img += ` width="${paramMap.w}"`;
    }
    if (paramMap.h) {
      img += ` height="${paramMap.h}"`;
    }
    var style = "";
    if (paramMap.bg) {
      style += ` background-color: ${paramMap.bg}`;
    }
    if (paramMap.align == "center") {
      style += ` margin: "auto"`;
    }
    if (style) {
      img += ` style="${style}"`;
    }

    return img + ">";
  };
});
