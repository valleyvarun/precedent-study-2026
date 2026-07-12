(function () {
  const container = document.getElementById("what-exists-panel");
  const downloadButton = document.getElementById("download-node-coordinates");

  if (!container) {
    return;
  }

  if (!window.d3) {
    container.innerHTML = '<div class="diagram-loading">Unable to load D3 diagram.</div>';
    return;
  }

  const width = 2100;
  const height = 900;
  const initialZoom = d3.zoomIdentity.translate(367.5, 157.5).scale(0.65);
  const nodes = [
    { id: "what", label: "What exists?", x: 739.966552734375, y: 381.82275390625, width: 220, height: 120, root: true, image: "imgs/Scratchlogo.svg.webp", imageClass: "diagram-logo-image" },
    { id: "create", label: "create", x: 829.5652465820312, y: 133.64549255371094, width: 140, height: 54 },
    { id: "community", label: "community", x: 430, y: 350, width: 165, height: 54 },
    { id: "learning", label: "learning", x: 960.2008056640625, y: 620.7525024414062, width: 165, height: 54 },
    { id: "editor", label: "Scratch editor", x: 1060.1337890625, y: -161.20401763916016, width: 300, height: 350, image: "imgs/create-img-1.png", imageClass: "diagram-editor-image", imagePlacement: "after", items: ["block code", "sprites", "stage preview"] },
    { id: "community-projects", label: "community projects", x: 60, y: 290, width: 330, height: 145, images: ["imgs/comments-ss-1.png", "imgs/scratch-explore-ss-1.png"], showLabel: false },
    { id: "share-projects", label: "share projects", x: -35.602012634277344, y: 507.1070556640625, width: 190, height: 54 },
    { id: "remix-projects", label: "remix projects", x: 270.7859802246094, y: 505, width: 190, height: 54 },
    { id: "studios", label: "studios", x: 149.71571350097656, y: 632.6421508789062, width: 135, height: 54 },
    { id: "tutorials", label: "tutorials + remixes", x: 967.3577880859375, y: 746.95654296875, width: 320, height: 285, image: "imgs/tutorials-ss-1.png", imageClass: "diagram-tutorial-image", items: ["video tutorials", "user-made tutorial Scratch projects", "shared with community"] },
    { id: "projects", label: "projects", x: 1434.1806640625, y: 11.15383529663086, width: 150, height: 54 },
    { id: "block-code", label: "block code", x: 1647.8929443359375, y: -80.91973876953125, width: 165, height: 54 },
    { id: "assets", label: "assets", x: 1667.1070556640625, y: 122.75920104980469, width: 140, height: 54 },
    { id: "images", label: "images", x: 1885.5350341796875, y: 62.792640686035156, width: 130, height: 48 },
    { id: "text", label: "text", x: 1889.7491455078125, y: 181.755859375, width: 130, height: 48 },
    { id: "audio", label: "audio", x: 1885.53515625, y: 294.39794921875, width: 130, height: 48 },
    { id: "extensions", label: "extensions", x: 1547.9598388671875, y: 365.4347839355469, width: 170, height: 54 },
    { id: "software", label: "software", x: 1790.60205078125, y: 438.8963317871094, width: 150, height: 54 },
    { id: "hardware", label: "hardware", x: 1576.42138671875, y: 553.0769653320312, width: 160, height: 54 },
    { id: "lego", label: "lego robotics kits", x: 1697.6422119140625, y: 694.966552734375, width: 230, height: 54 }
  ];

  const links = [
    ["what", "create"],
    ["what", "community"],
    ["what", "learning"],
    ["create", "community"],
    ["community", "learning"],
    ["learning", "create"],
    ["create", "editor"],
    ["editor", "projects"],
    ["community", "community-projects"],
    ["community-projects", "share-projects"],
    ["community-projects", "remix-projects"],
    ["community-projects", "studios"],
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

    if (node.imagePlacement === "after") {
      return `${title}${items}${image}${images}`;
    }

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

  function downloadNodeCoordinates() {
    const transform = d3.zoomTransform(svg.node());
    const data = {
      diagram: "what-exists",
      exportedAt: new Date().toISOString(),
      viewBox: { x: 0, y: 0, width, height },
      zoom: { x: transform.x, y: transform.y, scale: transform.k },
      nodes: nodes.map((node) => ({
        id: node.id,
        label: node.label,
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height
      }))
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "what-exists-node-coordinates.json";
    link.click();
    URL.revokeObjectURL(url);
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
    .scaleExtent([0.45, 6])
    .on("zoom", (event) => {
      viewport.attr("transform", event.transform);
    });

  svg.call(zoomDiagram);
  svg.call(zoomDiagram.transform, initialZoom);
  nodeSelection.call(dragNodes);
  downloadButton?.addEventListener("click", downloadNodeCoordinates);
  updateLinks();
}());