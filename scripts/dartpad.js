// {% dartpad id height %}
function dartpadTagRender(args) {
  console.log(args);

  return `<iframe width="100%" height="${args[1]}" src="https://dartpad.dev/embed-flutter.html?id=${args[0]}&run=true&theme=dark"></iframe>`;
}

hexo.extend.tag.register('dartpad', dartpadTagRender);