(function (global) {
  global.$_widget_workspaceId = ${workspaceId};
  document.cookie = "widget_workspaceId=${workspaceId}";

  const iframeElement = document.createElement("iframe");
  iframeElement.src = "http://localhost:3010/api/render/widget";
  iframeElement.classList.add("iframe-target");

  const style = document.createElement("style");
  style.innerHTML = `
    .iframe-target {
      position: fixed;
      right: 0;
      bottom: 0;
      z-index: 9999;
      background-color: red;
      border: none;
      width: 350px;
      height: 100%;
    }`;

  document.head.appendChild(style);
  document.body.appendChild(iframeElement);


  iframeElement.onload = () => {
        iframeElement.contentWindow.postMessage({
          type: "SET_WORKSPACE_ID",
          workspaceId: global.$_widget_workspaceId
        }, "http://localhost:3010") 
  }
})(window);
