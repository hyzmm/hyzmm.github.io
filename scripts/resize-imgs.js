const js = hexo.extend.helper.get("js").bind(hexo);

hexo.extend.injector.register(
  "body_end",
  `
    <script>
    function resizeImages() {
        document.querySelectorAll(".post-html img").forEach((img) => {
            const src = img.src;
            const query = src.split("?")[1];
            if (!query) return;
            const paramMap = {};
            query.split('&').forEach((e) => {
                const arr = e.split('=');
                if (arr[1] == null) {
                    paramMap[arr[0]] = true;
                } else {
                    paramMap[arr[0]] = arr[1];
                }
            });
            
            if (paramMap.w) {
                img.setAttribute("width", paramMap.w);
            }
            if (paramMap.h) {
                img.setAttribute("height", paramMap.h);
            }
            if (paramMap.bg) {
                img.style.backgroundColor = paramMap.bg;
            }
            if (paramMap.align == 'center') {
                img.style.margin = 'auto';
            }
        });
    }

    window.onload = () => {
        resizeImages();

        function onChildAdded(event) {
            if (event.target.getAttribute && event.target.getAttribute("class") == "post-html") {
                resizeImages();
                document.body.removeEventListener('DOMNodeInserted', onChildAdded, false);
            }
        }

        document.body.addEventListener('DOMNodeInserted', onChildAdded, false);
    };
    </script>
    `,
  "post",
);
