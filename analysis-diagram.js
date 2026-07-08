(function () {
  const container = document.getElementById("what-exists-panel");

  if (!container) {
    return;
  }

  if (!window.d3) {
    container.innerHTML = '<div class="diagram-loading">Unable to load D3 diagram.</div>';
    return;
  }

  const width = 1600;
  const height = 900;
  const nodes = [
    { id: "what", label: "What exists?", x: 670, y: 290, width: 220, height: 120, root: true, image: "imgs/Scratchlogo.svg.webp", imageClass: "diagram-logo-image" },
    { id: "create", label: "create", x: 730, y: 180, width: 140, height: 54 },
    { id: "community", label: "community", x: 460, y: 285, width: 165, height: 54 },
    { id: "learning", label: "learning", x: 825, y: 500, width: 165, height: 54 },
    { id: "editor", label: "Scratch editor", x: 820, y: 90, width: 240, height: 125, items: ["block code", "sprites", "stage preview"] },
    { id: "community-projects", label: "community projects", x: 95, y: 210, width: 330, height: 240, images: ["imgs/comments-ss-1.png", "imgs/scratch-explore-ss-1.png"], showLabel: false, items: ["see others' projects", "make studios and add projects", "remix, giving credit"] },
    { id: "tutorials", label: "tutorials + remixes", x: 805, y: 525, width: 320, height: 285, image: "imgs/tutorials-ss-1.png", imageClass: "diagram-tutorial-image", items: ["video tutorials", "user-made tutorial Scratch projects", "shared with community"] },
    { id: "create-img-1", label: "create-img-1", x: 960, y: 250, width: 220, height: 190, image: "imgs/create-img-1.png", showLabel: false },
    { id: "projects", label: "projects", x: 1180, y: 170, width: 150, height: 54 },
    { id: "block-code", label: "block code", x: 1320, y: 70, width: 165, height: 54 },
    { id: "assets", label: "assets", x: 1360, y: 205, width: 140, height: 54 },
    { id: "images", label: "images", x: 1510, y: 145, width: 130, height: 48 },
    { id: "text", label: "text", x: 1510, y: 225, width: 130, height: 48 },
    { id: "audio", label: "audio", x: 1510, y: 305, width: 130, height: 48 },
    { id: "extensions", label: "extensions", x: 1180, y: 365, width: 170, height: 54 },
    { id: "software", label: "software", x: 1395, y: 385, width: 150, height: 54 },
    { id: "hardware", label: "hardware", x: 1165, y: 500, width: 160, height: 54 },
    { id: "lego", label: "lego robotics kits", x: 1285, y: 590, width: 230, height: 54 }
  ];

  const links = [
    ["what", "create"],
    ["what", "community"],
    ["what", "learning"],
    ["create", "community"],
    ["community", "learning"],
    ["learning", "create"],
    ["create", "editor"],
    ["create", "create-img-1"],
    ["create-img-1", "projects"],
    ["community", "community-projects"],
    ["learning", "tutorials"],
    ["projects", "block-code"],
    ["projects", "assets"],
    ["assets", "images"],
    ["assets", "text"],
    ["assets", "audio"],
    ["projects", "extensions"],
    ["extensions", "software"],
    ["extensions", "hardware"],
    ["hardware", "lego"]
  ].map(([source, target]) => ({ source, target }));

  const nodeById = new Map(nodes.map((node) => [node.id, node]));

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[character];
    });
  }

  function cardHtml(node) {
    const imageClass = node.imageClass ? ` class="${escapeHtml(node.imageClass)}"` : "";
    const image = node.image ? `<img${imageClass} src="${escapeHtml(node.image)}" alt="">` : "";
    const images = node.images ? `<div class="diagram-image-row">${node.images.map((source) => `<img src="${escapeHtml(source)}" alt="">`).join("")}</div>` : "";
    const items = node.items ? `<ul>${node.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : "";
    const title = node.showLabel === false ? "" : `<div class="diagram-card-title">${escapeHtml(node.label)}</div>`;

    return `${image}${images}${title}${items}`;
  }

  function edgePoint(fromNode, toNode) {
    const fromX = fromNode.x + fromNode.width / 2;
    const fromY = fromNode.y + fromNode.height / 2;
    const toX = toNode.x + toNode.width / 2;
    const toY = toNode.y + toNode.height / 2;
    const deltaX = toX - fromX;
    const deltaY = toY - fromY;
    const scaleX = deltaX === 0 ? Infinity : fromNode.width / 2 / Math.abs(deltaX);
    const scaleY = deltaY === 0 ? Infinity : fromNode.height / 2 / Math.abs(deltaY);
    const scale = Math.min(scaleX, scaleY);

    return {
      x: fromX + deltaX * scale,
      y: fromY + deltaY * scale
    };
  }

  function nodeTransform(node) {
    return `translate(${node.x}, ${node.y})`;
  }

  container.textContent = "";

  const svg = d3.select(container)
    .append("svg")
    .attr("class", "analysis-diagram")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("role", "img")
    .attr("aria-label", "What exists diagram for Scratch");

  const defs = svg.append("defs");
  const grid = defs.append("pattern")
    .attr("id", "diagram-grid")
    .attr("width", 18)
    .attr("height", 18)
    .attr("patternUnits", "userSpaceOnUse");

  grid.append("circle")
    .attr("cx", 1.5)
    .attr("cy", 1.5)
    .attr("r", 1.1)
    .attr("fill", "#cfc8bc");

  svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "url(#diagram-grid)");

  const viewport = svg.append("g").attr("class", "diagram-viewport");
  const linkLayer = viewport.append("g").attr("class", "diagram-links");
  const nodeLayer = viewport.append("g").attr("class", "diagram-nodes");

  const linkSelection = linkLayer.selectAll("line")
    .data(links)
    .join("line")
    .attr("class", "diagram-link");

  const nodeSelection = nodeLayer.selectAll("g")
    .data(nodes)
    .join("g")
    .attr("class", (node) => `diagram-node${node.root ? " is-root" : ""}`)
    .attr("transform", nodeTransform);

  nodeSelection.append("rect")
    .attr("width", (node) => node.width)
    .attr("height", (node) => node.height);

  nodeSelection.append("foreignObject")
    .attr("x", 12)
    .attr("y", 10)
    .attr("width", (node) => node.width - 24)
    .attr("height", (node) => node.height - 20)
    .append("xhtml:div")
    .attr("class", "diagram-card-content")
    .html(cardHtml);

  function updateLinks() {
    linkSelection
      .attr("x1", (link) => edgePoint(nodeById.get(link.source), nodeById.get(link.target)).x)
      .attr("y1", (link) => edgePoint(nodeById.get(link.source), nodeById.get(link.target)).y)
      .attr("x2", (link) => edgePoint(nodeById.get(link.target), nodeById.get(link.source)).x)
      .attr("y2", (link) => edgePoint(nodeById.get(link.target), nodeById.get(link.source)).y);
  }

  const dragNodes = d3.drag()
    .on("start", function (event) {
      event.sourceEvent.stopPropagation();
      d3.select(this).raise().classed("is-dragging", true);
    })
    .on("drag", function (event, node) {
      node.x += event.dx;
      node.y += event.dy;
      d3.select(this).attr("transform", nodeTransform(node));
      updateLinks();
    })
    .on("end", function () {
      d3.select(this).classed("is-dragging", false);
    });

  const zoomDiagram = d3.zoom()
    .scaleExtent([0.45, 2.5])
    .on("zoom", (event) => {
      viewport.attr("transform", event.transform);
    });

  svg.call(zoomDiagram);
  nodeSelection.call(dragNodes);
  updateLinks();
}());