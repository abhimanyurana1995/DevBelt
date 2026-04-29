(function () {
  var DevTools = window.DevTools || {};
  var tools = Object.keys(DevTools).map(function (k) { return DevTools[k]; });

  var container = document.getElementById('tool-container');
  var toolList = document.getElementById('tool-list');
  var activeTool = null;
  var activeNav = null;

  tools.forEach(function (tool) {
    var li = document.createElement('li');
    li.className = 'nav-item';
    li.innerHTML =
      '<span class="nav-icon">' + tool.meta.icon + '</span>' +
      '<span class="nav-name">' + tool.meta.name + '</span>';
    li.addEventListener('click', function () { loadTool(tool, li); });
    toolList.appendChild(li);
  });

  function loadTool(tool, navItem) {
    if (activeTool && activeTool.destroy) activeTool.destroy(container);
    if (activeNav) activeNav.classList.remove('active');
    container.innerHTML = '';
    activeTool = tool;
    activeNav = navItem;
    navItem.classList.add('active');
    tool.render(container);
  }

  if (tools.length > 0) loadTool(tools[0], toolList.firstChild);
})();
