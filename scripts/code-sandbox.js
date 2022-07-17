// {% dartpad id height %}
function codeSandboxRenderer(args) {
  return `<iframe src="https://codesandbox.io/embed/${args[0]}?fontsize=14&hidenavigation=1&theme=dark"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="PIXI-6"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>`;
}

hexo.extend.tag.register('CodeSandbox', codeSandboxRenderer);