(function () {
  const container = document.getElementById("visual-aesthetic-panel");
  const downloadButton = document.getElementById("download-node-coordinates");

  if (!container) {
    return;
  }

  if (!window.d3) {
    container.innerHTML = '<div class="design-loading">Unable to load D3 diagram.</div>';
    return;
  }

  const width = 1600;
  const height = 900;
  const initialZoom = d3.zoomIdentity.translate(400, 200).scale(1.05);
  const cardInsetX = 12;
  const cardInsetY = 10;
  
  const nodes = [
    { id: "playground", label: "Playground", text: "colorful, playful, unserious vibes.", image: "imgs/goofy-vibes.png", imageClass: "design-goofy-image", x: -250.51760482788086, y: -110.76602172851562 },
    { id: "everything-together", label: "Everything Together", text: "everything in one place, so its easy to understand how all parts of a project relate to one another.", image: "imgs/scratch-interface.jpeg", imageClass: "design-interface-image", x: 450.2691345214844, y: -189.21327209472656 },
    { id: "jigsaw-puzzle", label: "Jigsaw Puzzle", text: "different types of code blocks have different colors and shapes. This gives us a clue to fit the blocks together like a jigsaw puzzle.", image: "imgs/block-code-example-1.png", imageClass: "design-jigsaw-image", x: 240.91094970703125, y: 227.39132690429688 }
  ];

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
    const title = `<div class="design-card-title">${escapeHtml(node.label)}</div>`;
    const text = node.text ? `<div class="design-card-text">${escapeHtml(node.text)}</div>` : "";
    const imageClass = node.imageClass ? ` class="${escapeHtml(node.imageClass)}"` : "";
    const image = node.image ? `<img${imageClass} src="${escapeHtml(node.image)}" alt="">` : "";
    
    return `${title}${text}${image}`;
  }

  function nodeTransform(node) {
    return `translate(${node.x}, ${node.y})`;
  }

  async function measureNodeSizes() {
    const measurementLayer = d3.select(document.body)
      .append("div")
      .attr("class", "design-measure-layer");

    const measuredCards = measurementLayer.selectAll("div")
      .data(nodes)
      .join("div")
      .attr("class", "design-card-content design-measure-card")
      .html(cardHtml);

    if (document.fonts) {
      await document.fonts.ready;
    }

    const images = Array.from(measurementLayer.node().querySelectorAll("img"));
    await Promise.all(images.map((image) => {
      if (image.complete) return Promise.resolve();
      return new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      });
    }));

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
      .attr("class", "design-diagram")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("role", "img")
      .attr("aria-label", "Design and aesthetics diagram");

    const defs = svg.append("defs");
    const grid = defs.append("pattern")
      .attr("id", "design-grid")
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
      .attr("fill", "url(#design-grid)");

    const viewport = svg.append("g").attr("class", "design-viewport");
    const nodeLayer = viewport.append("g").attr("class", "design-nodes");

    const nodeSelection = nodeLayer.selectAll("g")
      .data(nodes)
      .join("g")
      .attr("class", "design-node")
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
      .attr("class", "design-card-content")
      .html(cardHtml);

    const dragNodes = d3.drag()
      .on("start", function (event) {
        event.sourceEvent.stopPropagation();
        d3.select(this).raise().classed("is-dragging", true);
      })
      .on("drag", function (event, node) {
        node.x += event.dx;
        node.y += event.dy;
        d3.select(this).attr("transform", nodeTransform(node));
      })
      .on("end", function () {
        d3.select(this).classed("is-dragging", false);
      });

    function downloadDesignCoordinates() {
      if (container.hidden) {
        return;
      }

      const transform = d3.zoomTransform(svg.node());
      const data = {
        diagram: "design-aesthetics",
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
      link.download = "design-aesthetics-node-coordinates.json";
      link.click();
      URL.revokeObjectURL(url);
    }

    const zoomDiagram = d3.zoom()
      .scaleExtent([0.45, 6])
      .on("zoom", (event) => {
        viewport.attr("transform", event.transform);
      });

    svg.call(zoomDiagram);
    svg.call(zoomDiagram.transform, initialZoom);
    nodeSelection.call(dragNodes);
    downloadButton?.addEventListener("click", downloadDesignCoordinates);
  });
}());