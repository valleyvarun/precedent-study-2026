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
  const cardInsetX = 12;
  const cardInsetY = 10;
  const nodes = [
    { id: "what", label: "What exists?", x: 439.966552734375, y: 381.82275390625, root: true, image: "imgs/Scratchlogo.svg.webp", imageClass: "diagram-logo-image" },
    { id: "create", label: "create", x: 529.5652465820312, y: 133.64549255371094 },
    { id: "community", label: "community", x: 130, y: 350 },
    { id: "learning", label: "learning", x: 660.2008056640625, y: 620.7525024414062 },
    { id: "editor", label: "Scratch editor", x: 760.1337890625, y: -161.20401763916016, image: "imgs/create-img-1.png", imageClass: "diagram-editor-image", imagePlacement: "after", items: ["block code", "sprites", "stage preview"] },
    { id: "community-projects", label: "community projects", x: -434.6822814941406, y: 122.07357788085938, images: ["imgs/comments-ss-1.png", "imgs/scratch-explore-ss-1.png"], imagesClass: "diagram-community-images", showLabel: false },
    { id: "share-projects", label: "share projects", x: -434.6321334838867, y: 572.4248046875 },
    { id: "remix-projects", label: "remix projects", x: -41.85616111755371, y: 614.5652465820312 },
    { id: "studios", label: "studios", x: -228.2441635131836, y: 790.6689453125 },
    { id: "tutorials", label: "tutorials screenshot", x: 720.033447265625, y: 704.8161010742188, image: "imgs/tutorials-ss-1.png", imageClass: "diagram-tutorial-image", showLabel: false },
    { id: "youtube-video-tutorials", label: "Youtube video tutorials", labelLines: ["Youtube video", "tutorials"], x: 437.7591552734375, y: 997.6087646484375 },
    { id: "community-tutorial-projects", label: "community tutorial scratch projects", labelLines: ["community tutorial", "scratch projects"], x: 672.474853515625, y: 1014.46484375 },
    { id: "projects", label: "projects", x: 1134.1806640625, y: 11.15383529663086 },
    { id: "block-code", label: "block code", x: 1318.39453125, y: -212.17391562461853, image: "imgs/block-code-example-1.png", imageClass: "diagram-block-code-image", imagePlacement: "after" },
    { id: "code-block-types", label: "code block types", x: 1485.39453125, y: -208.17391562461853, image: "imgs/code-block-types.png", imageClass: "diagram-code-block-types-image", showLabel: false },
    { id: "website-html-embed", label: "Website HTML embed", labelLines: ["Website HTML", "embed"], x: 930.1806640625, y: 210.15383529663086, cardClass: "is-website-embed", image: "imgs/web-embed-ss.png", imageClass: "diagram-web-embed-image", imagePlacement: "after" },
    { id: "assets", label: "assets", x: 1333.3946533203125, y: 91.15384674072266 },
    { id: "images", label: "images", x: 1513.896240234375, y: 35.401336669921875 },
    { id: "sprite", label: "sprite", x: 1662.35791015625, y: -205.6688995361328, images: ["imgs/cat-sprite.png", "imgs/blueguy-sprite.png", "imgs/crab-sprite.png", "imgs/hammer-sprite.jpg"], imagesClass: "diagram-sprite-grid", imagePlacement: "after" },
    { id: "backdrop", label: "backdrop", x: 1666.5718994140625, y: -23.561874389648438, images: ["imgs/backdrop-example-1.png", "imgs/backdrop-example-2.png"], imagesClass: "diagram-backdrop-stack", imagePlacement: "after" },
    { id: "text", label: "text", x: 1518.1103515625, y: 139.61538696289062 },
    { id: "audio", label: "audio", x: 1516.00341796875, y: 233.29428100585938 },
    { id: "extensions", label: "extensions", x: 1247.9598388671875, y: 365.4347839355469, image: "imgs/extensions-ss.png", imageClass: "diagram-extensions-image", imagePlacement: "after" },
    { id: "software", label: "software", x: 1642.926513671875, y: 428.12493896484375 },
    { id: "hardware", label: "hardware", x: 1466.053466796875, y: 681.6387939453125 },
    { id: "extension-music", label: "Music", x: 1624.5791015625, y: 280.87957763671875, cardClass: "is-extension-name", image: "imgs/music-project-example-1.png", imageClass: "diagram-extension-image", imagePlacement: "after" },
    { id: "extension-pen", label: "pen: drawing", x: 1781.453857421875, y: 279.8056640625, cardClass: "is-extension-name", image: "imgs/pen-drawing-example-1.jpeg", imageClass: "diagram-extension-image", imagePlacement: "after" },
    { id: "extension-computer-vision", label: "Computer vision", x: 1884.142822265625, y: 427.0343933105469, cardClass: "is-extension-name" },
    { id: "extension-video-sensing", label: "Video Sensing", x: 2067.8414306640625, y: 536.5830993652344, cardClass: "is-extension-name" },
    { id: "extension-face-sensing", label: "Face Sensing", x: 2066.515869140625, y: 372.36724853515625, cardClass: "is-extension-name", image: "imgs/face-sensing-example-1.jpeg", imageClass: "diagram-extension-image", imagePlacement: "after" },
    { id: "extension-text-to-speech", label: "Text to Speech", x: 1753.0777587890625, y: 554.2421569824219, cardClass: "is-extension-name" },
    { id: "extension-translate", label: "Google Translate", x: 1554.0645751953125, y: 555.4566040039062, cardClass: "is-extension-name", image: "imgs/google-translate-symbol.png", imageClass: "diagram-translate-image", imagePlacement: "left" },
    { id: "extension-makey-makey", label: "Makey Makey", x: 1487.35791015625, y: 831.2709350585938, cardClass: "is-extension-name", image: "imgs/makey-makey-example-1.jpg", imageClass: "diagram-extension-image", imagePlacement: "after" },
    { id: "extension-microbit", label: "micro:bit", x: 1701.605224609375, y: 831.2709350585938, cardClass: "is-extension-name", image: "imgs/micro-bit-example-1.jpg", imageClass: "diagram-extension-image", imagePlacement: "after" },
    { id: "extension-go-direct", label: "Go Direct Force & Acceleration", labelLines: ["Go Direct Force", "& Acceleration"], x: 1894.7825927734375, y: 732.2408447265625, cardClass: "is-extension-name" },
    { id: "extension-mindstorms", label: "lego mindstorms: robotics kits", labelLines: ["lego mindstorms:", "robotics kits"], x: 1249.26416015625, y: 820.6688842773438, cardClass: "is-extension-name", image: "imgs/lego-mindstorm-example-1.jpg", imageClass: "diagram-extension-image", imagePlacement: "after" }
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
    ["tutorials", "youtube-video-tutorials"],
    ["tutorials", "community-tutorial-projects"],
    ["projects", "block-code"],
    ["projects", "website-html-embed"],
    ["block-code", "code-block-types"],
    ["projects", "assets"],
    ["assets", "images"],
    ["images", "sprite"],
    ["images", "backdrop"],
    ["assets", "text"],
    ["assets", "audio"],
    ["projects", "extensions"],
    ["extensions", "software"],
    ["extensions", "hardware"],
    ["software", "extension-music"],
    ["software", "extension-pen"],
    ["software", "extension-computer-vision"],
    ["extension-computer-vision", "extension-video-sensing"],
    ["extension-computer-vision", "extension-face-sensing"],
    ["software", "extension-text-to-speech"],
    ["software", "extension-translate"],
    ["hardware", "extension-makey-makey"],
    ["hardware", "extension-microbit"],
    ["hardware", "extension-go-direct"],
    ["hardware", "extension-mindstorms"]
  ].map(([source, target]) => ({ source, target }));

  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const nodeLevels = getNodeLevels("what");

  links.forEach((link) => {
    link.level = Math.min(nodeLevels.get(link.source) ?? 0, nodeLevels.get(link.target) ?? 0);
  });

  function getNodeLevels(rootId) {
    const levels = new Map([[rootId, 0]]);
    const queue = [rootId];

    while (queue.length) {
      const source = queue.shift();
      const nextLevel = levels.get(source) + 1;

      links.forEach((link) => {
        if (link.source === source && !levels.has(link.target)) {
          levels.set(link.target, nextLevel);
          queue.push(link.target);
        }
      });
    }

    return levels;
  }

  function linkStrokeWidth(link) {
    return Math.max(1.2, 4.4 - link.level * 0.7);
  }

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
    const imagesClass = node.imagesClass ? ` ${escapeHtml(node.imagesClass)}` : "";
    const images = node.images ? `<div class="diagram-image-row${imagesClass}">${node.images.map((source) => `<img src="${escapeHtml(source)}" alt="">`).join("")}</div>` : "";
    const items = node.items ? `<ul>${node.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : "";
    const titleText = node.labelLines ? node.labelLines.map((line) => `<span class="diagram-card-title-line">${escapeHtml(line)}</span>`).join("") : escapeHtml(node.label);
    const title = node.showLabel === false ? "" : `<div class="diagram-card-title">${titleText}</div>`;

    if (node.imagePlacement === "left") {
      return `<div class="diagram-card-inline">${image}${title}</div>${items}${images}`;
    }

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

  function waitForImages(root) {
    const images = Array.from(root.querySelectorAll("img"));

    return Promise.all(images.map((image) => {
      if (image.complete) {
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      });
    }));
  }

  async function measureNodeSizes() {
    const measurementLayer = d3.select(document.body)
      .append("div")
      .attr("class", "diagram-measure-layer");

    const measuredCards = measurementLayer.selectAll("div")
      .data(nodes)
      .join("div")
      .attr("class", (node) => `diagram-card-content${node.cardClass ? ` ${node.cardClass}` : ""} diagram-measure-card${node.root ? " is-root-card" : ""}`)
      .html(cardHtml);

    if (document.fonts) {
      await document.fonts.ready;
    }

    await waitForImages(measurementLayer.node());

    measuredCards.each(function (node) {
      const rect = this.getBoundingClientRect();

      node.width = Math.ceil(rect.width + cardInsetX * 2);
      node.height = Math.ceil(rect.height + cardInsetY * 2);
    });

    measurementLayer.remove();
  }

  measureNodeSizes().then(() => {
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
    .attr("class", "diagram-link")
    .style("stroke-width", (link) => linkStrokeWidth(link));

  const nodeSelection = nodeLayer.selectAll("g")
    .data(nodes)
    .join("g")
    .attr("class", (node) => `diagram-node${node.root ? " is-root" : ""}`)
    .attr("transform", nodeTransform);

  nodeSelection.append("rect")
    .attr("width", (node) => node.width)
    .attr("height", (node) => node.height);

  nodeSelection.append("foreignObject")
    .attr("x", cardInsetX)
    .attr("y", cardInsetY)
    .attr("width", (node) => node.width - cardInsetX * 2)
    .attr("height", (node) => node.height - cardInsetY * 2)
    .append("xhtml:div")
    .attr("class", (node) => `diagram-card-content${node.cardClass ? ` ${node.cardClass}` : ""}`)
    .html(cardHtml);

  function updateLinks() {
    linkSelection
      .attr("x1", (link) => edgePoint(nodeById.get(link.source), nodeById.get(link.target)).x)
      .attr("y1", (link) => edgePoint(nodeById.get(link.source), nodeById.get(link.target)).y)
      .attr("x2", (link) => edgePoint(nodeById.get(link.target), nodeById.get(link.source)).x)
      .attr("y2", (link) => edgePoint(nodeById.get(link.target), nodeById.get(link.source)).y);
  }

  function downloadNodeCoordinates() {
    if (container.hidden) {
      return;
    }

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
  });
}());