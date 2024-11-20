(function (global) {
  global.$_widget_workspaceId = "468b0e21-dd45-4065-8491-ff4d90046c61";
  document.cookie = "widget_workspaceId=468b0e21-dd45-4065-8491-ff4d90046c61";

  const iframeElement = document.createElement("iframe");
  iframeElement.classList.add("iframe-target");
  iframeElement.src = "about:blank";

  const style = document.createElement("style");
  style.innerHTML = `
        .iframe-target {
          position: fixed;
          right: 0;
          bottom: 0;
          z-index: 9999;
        // background-color: red;
          border: none;
          width: 350px;
          height: 100%;
        }`;

  document.head.appendChild(style);
  document.body.appendChild(iframeElement);

  const iframeDoc = iframeElement.contentWindow.document;
  iframeDoc.open();
  iframeDoc.write(`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Vite + React</title>
      <script type="module" crossorigin src="http://localhost:3010/dist/bundle.js"></script>
      <link rel="stylesheet" crossorigin href="http://localhost:3010/dist/assets/index-DzY1Jiur.css" />
    </head>
    <body>
      <div id="root"></div>
    </body>
  </html>
    `);
  iframeDoc.close();

  iframeElement.onload = () => {
    iframeElement.contentWindow.postMessage(
      {
        type: "SET_WORKSPACE_ID",
        workspaceId: global.$_widget_workspaceId,
      },
      "http://localhost:3010" // Ensure this matches the iframe's origin
    );
  };
})(window);
