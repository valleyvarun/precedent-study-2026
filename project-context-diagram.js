(function () {
	const container = document.getElementById("project-context-panel");
	const downloadButton = document.getElementById("download-node-coordinates");

	if (!container) {
		return;
	}

	if (!window.d3) {
		container.innerHTML = '<div class="project-context-loading">Unable to load D3 timeline.</div>';
		return;
	}

	const width = 1600;
	const height = 620;
	const centerY = 555;
	const marginX = 100;
	const lineExtension = 70;
	const stemLength = 82;
	const labelOffset = 34;
	const versionBlockGap = 10;
	const guideOverflow = 2400;
	const cardInsetX = 2;
	const cardInsetY = 2;
	const initialZoom = d3.zoomIdentity.translate(0, 90);
	const decadeYears = d3.range(1960, 2031, 10).map((year, index) => ({
		year,
		side: index % 2 === 0 ? "up" : "down"
	}));
	const eventYears = [1967, 1984, 1985, 1991, 1998, 2003, 2007, 2013, 2019].map((year) => ({
		year,
		side: "up"
	}));
	const contextNodes = [
		{ id: "papert", label: "Logo - Seymour Papert", x: 152.0435028076172, y: 311.6521759033203, layout: "titleLinesImage", titleLines: ["Logo", "- Seymour Papert"], image: "imgs/logo-seymor.png", imageClass: "project-context-logo-screenshot", imageAlt: "Logo programming language screenshot" },
		{ id: "mitchel-resnick", label: "mitchel resnick", x: 553.0000305175781, y: 110.52175903320312, image: "imgs/mitchel-resnick-legoblocks.jpg", imageClass: "project-context-photo-image", imageAlt: "Mitchel Resnick with Lego blocks", imagePlacement: "after", contentClass: "project-context-centered-card" },
		{ id: "mit-media-lab", label: "MIT Media Lab", x: 539.7391510009766, y: -137.65219116210938, image: "imgs/mit-media-lab-logo-1.jpg", imageClass: "project-context-logo-image project-context-logo-large", logoOnly: true },
		{ id: "lifelong-kindergarden", label: "Lifelong Kindergarden Group", x: 643.1739501953125, y: -20.478260040283203, image: "imgs/lifelong-kindergarten_logo-1.png", imageClass: "project-context-logo-image project-context-logo-large project-context-logo-feature", logoOnly: true },
		{ id: "lego-mindstroms", label: "mindstorms: robotics kit", x: 794.8695678710938, y: 199.0000171661377, image: "imgs/lego-logo.webp", imageClass: "project-context-logo-image", layout: "logoText", titleLines: ["mindstorms:", "robotics kit"] },
		{ id: "scratch", label: "Scratch", x: 1036.695556640625, y: 293.521728515625, image: "imgs/Scratchlogo.svg.webp", imageClass: "project-context-logo-image project-context-logo-large project-context-logo-feature", logoOnly: true },
		{ id: "scratch-1", label: "1.0", x: 1021.5, y: 436, timelineYear: 2007, fixed: true },
		{ id: "scratch-2", label: "2.0", x: 1141.5, y: 436, timelineYear: 2013, fixed: true },
		{ id: "scratch-3", label: "3.0", x: 1261.5, y: 436, timelineYear: 2019, fixed: true },
		{ id: "national-science-foundation", label: "National Science Foundation", x: 909.3912658691406, y: 353.5217590332031, image: "imgs/National-Science-Foundation-logo-1.webp", imageClass: "project-context-logo-image", logoOnly: true },
		{ id: "google-blockly", label: "Google Blockly", x: 1040.521728515625, y: -100, layout: "logoStack", images: [{ src: "imgs/google-logo.png", alt: "Google" }, { src: "imgs/blockly-logo.svg", alt: "Blockly" }] },
		{ id: "smalltalk", label: "smalltalk", x: 160.43487548828125, y: 87.65214538574219, layout: "textStack", textLines: ['"live" object-oriented programming'] },
		{ id: "squeak-etoys", label: "squeak, etoys", x: 605.1304016113281, y: 300.0869598388672, layout: "titleImagePair", images: [{ src: "imgs/squeak.png", alt: "Squeak" }, { src: "imgs/etoys.png", alt: "Etoys" }] },
		{ id: "scratch-foundation", label: "Scratch Foundation", x: 1214.521728515625, y: 131.0435028076172, image: "imgs/scratch-foundation-logo-1.png", imageClass: "project-context-logo-image project-context-logo-large project-context-logo-feature", logoOnly: true }
	];
	const contextLinks = [
		["papert", "squeak-etoys"],
		["squeak-etoys", "scratch"],
		["mitchel-resnick", "lifelong-kindergarden"],
		["mitchel-resnick", "lego-mindstroms"],
		["mitchel-resnick", "scratch"],
		["mit-media-lab", "lifelong-kindergarden"],
		["lifelong-kindergarden", "scratch"],
		["lifelong-kindergarden", "lego-mindstroms"],
		["lego-mindstroms", "scratch"],
		["google-blockly", "scratch"],
		["smalltalk", "squeak-etoys"],
		["national-science-foundation", "scratch-1"],
		["scratch-1", "scratch"],
		["scratch-2", "scratch"],
		["scratch-3", "scratch"],
		["scratch-3", "scratch-foundation"],
		["scratch", "scratch-foundation"]
	].map(([source, target]) => ({ source, target }));
	const nodeById = new Map(contextNodes.map((node) => [node.id, node]));
	const xScale = d3.scaleLinear()
		.domain(d3.extent(decadeYears, (item) => item.year))
		.range([marginX, width - marginX]);

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
		const imageAlt = escapeHtml(node.imageAlt || (node.logoOnly ? node.label : ""));
		const image = node.image ? `<img${imageClass} src="${escapeHtml(node.image)}" alt="${imageAlt}">` : "";
		const title = `<div class="diagram-card-title">${escapeHtml(node.label)}</div>`;

		if (node.layout === "logoText") {
			const titleLines = node.titleLines.map((line) => `<span>${escapeHtml(line)}</span>`).join("");

			return `<div class="project-context-logo-text-card">${image}<div class="project-context-logo-text">${titleLines}</div></div>`;
		}

		if (node.layout === "logoStack") {
			const logos = node.images.map((item) => `<img class="project-context-stack-logo" src="${escapeHtml(item.src)}" alt="${escapeHtml(item.alt)}">`).join("");

			return `<div class="project-context-logo-stack">${logos}</div>`;
		}

		if (node.layout === "textStack") {
			const lines = node.textLines.map((line) => `<span>${escapeHtml(line)}</span>`).join("");

			return `<div class="project-context-text-stack">${title}<div class="project-context-text-lines">${lines}</div></div>`;
		}

		if (node.layout === "titleImagePair") {
			const images = node.images.map((item) => `<img class="project-context-pair-image" src="${escapeHtml(item.src)}" alt="${escapeHtml(item.alt)}">`).join("");

			return `<div class="project-context-image-pair-card">${title}<div class="project-context-image-pair">${images}</div></div>`;
		}

		if (node.layout === "titleLinesImage") {
			const titleLines = node.titleLines.map((line) => `<span>${escapeHtml(line)}</span>`).join("");

			return `<div class="project-context-title-image-card"><div class="project-context-title-lines">${titleLines}</div>${image}</div>`;
		}

		if (node.logoOnly) {
			return image;
		}

		if (node.imagePlacement === "after") {
			return `${title}${image}`;
		}

		return `${image}${title}`;
	}

	function cardClass(node) {
		return `diagram-card-content${node.contentClass ? ` ${node.contentClass}` : ""}`;
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

	async function measureContextNodeSizes() {
		const measurementLayer = d3.select(document.body)
			.append("div")
			.attr("class", "diagram-measure-layer");

		const measuredCards = measurementLayer.selectAll("div")
			.data(contextNodes)
			.join("div")
			.attr("class", (node) => `${cardClass(node)} diagram-measure-card`)
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

		contextNodes.forEach((node) => {
			if (!node.timelineYear) {
				return;
			}

			node.x = xScale(node.timelineYear) - node.width / 2;
			node.y = centerY - stemLength - node.height - versionBlockGap;
		});

		measurementLayer.remove();
	}

	function nodeTransform(node) {
		return `translate(${node.x}, ${node.y})`;
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

	measureContextNodeSizes().then(() => {
	container.textContent = "";

	const svg = d3.select(container)
		.append("svg")
		.attr("class", "project-context-diagram")
		.attr("viewBox", `0 0 ${width} ${height}`)
		.attr("role", "img")
		.attr("aria-label", "Project context timeline from 1960 to 2030");

	const defs = svg.append("defs");
	const grid = defs.append("pattern")
		.attr("id", "project-context-grid")
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
		.attr("fill", "url(#project-context-grid)");

	const viewport = svg.append("g")
		.attr("class", "project-context-viewport");
	const connectionLayer = viewport.append("g")
		.attr("class", "project-context-connections");
	const connectionSelection = connectionLayer.selectAll("line")
		.data(contextLinks)
		.join("line")
		.attr("class", "project-context-connection");

	viewport.append("g")
		.attr("class", "project-context-guides")
		.selectAll("line")
		.data(decadeYears)
		.join("line")
		.attr("class", "project-context-decade-guide")
		.attr("x1", (item) => xScale(item.year))
		.attr("x2", (item) => xScale(item.year))
		.attr("y1", -guideOverflow)
		.attr("y2", height + guideOverflow);

	viewport.append("line")
		.attr("class", "project-context-main-line")
		.attr("x1", xScale(decadeYears[0].year) - lineExtension)
		.attr("x2", xScale(decadeYears[decadeYears.length - 1].year) + lineExtension)
		.attr("y1", centerY)
		.attr("y2", centerY);

	const eventSelection = viewport.append("g")
		.attr("class", "project-context-events")
		.selectAll("g")
		.data(eventYears)
		.join("g")
		.attr("class", (item) => `project-context-event is-${item.side}`)
		.attr("transform", (item) => `translate(${xScale(item.year)}, ${centerY})`);

	eventSelection.append("line")
		.attr("class", "project-context-stem")
		.attr("x1", 0)
		.attr("x2", 0)
		.attr("y1", 0)
		.attr("y2", (item) => item.side === "up" ? -stemLength : stemLength);

	eventSelection.append("circle")
		.attr("class", "project-context-marker")
		.attr("r", 5);

	const decadeLabelSelection = viewport.append("g")
		.attr("class", "project-context-decade-labels")
		.selectAll("g")
		.data(decadeYears)
		.join("g")
		.attr("class", (item) => `project-context-decade-label is-${item.side}`)
		.attr("transform", (item) => `translate(${xScale(item.year)}, ${centerY})`);

	decadeLabelSelection.append("text")
		.attr("class", "project-context-year")
		.attr("x", 0)
		.attr("y", labelOffset)
		.text((item) => item.year);

	const blockSelection = viewport.append("g")
		.attr("class", "project-context-blocks")
		.selectAll("g")
		.data(contextNodes)
		.join("g")
		.attr("class", (node) => `diagram-node project-context-block${node.fixed ? " is-fixed" : " is-draggable"}${node.id === "mitchel-resnick" ? " is-free-draggable" : ""}`)
		.attr("transform", nodeTransform);

	blockSelection.append("rect")
		.attr("width", (node) => node.width)
		.attr("height", (node) => node.height);

	blockSelection.append("foreignObject")
		.attr("x", cardInsetX)
		.attr("y", cardInsetY)
		.attr("width", (node) => node.width - cardInsetX * 2)
		.attr("height", (node) => node.height - cardInsetY * 2)
		.append("xhtml:div")
		.attr("class", cardClass)
		.html(cardHtml);

	function updateConnections() {
		connectionSelection
			.attr("x1", (link) => edgePoint(nodeById.get(link.source), nodeById.get(link.target)).x)
			.attr("y1", (link) => edgePoint(nodeById.get(link.source), nodeById.get(link.target)).y)
			.attr("x2", (link) => edgePoint(nodeById.get(link.target), nodeById.get(link.source)).x)
			.attr("y2", (link) => edgePoint(nodeById.get(link.target), nodeById.get(link.source)).y);
	}

	function downloadProjectContextCoordinates() {
		if (container.hidden) {
			return;
		}

		const transform = d3.zoomTransform(svg.node());
		const data = {
			diagram: "project-context",
			exportedAt: new Date().toISOString(),
			viewBox: { x: 0, y: 0, width, height },
			zoom: { x: transform.x, y: transform.y, scale: transform.k },
			timeline: {
				centerY,
				stemLength,
				labelOffset,
				decadeYears: decadeYears.map((item) => ({
					year: item.year,
					x: xScale(item.year),
					y: centerY + labelOffset
				})),
				eventYears: eventYears.map((item) => ({
					year: item.year,
					x: xScale(item.year),
					y: centerY,
					stemY2: item.side === "up" ? -stemLength : stemLength
				}))
			},
			connections: contextLinks.map((link) => ({
				source: link.source,
				target: link.target
			})),
			nodes: contextNodes.map((node) => ({
				id: node.id,
				label: node.label,
				x: node.x,
				y: node.y,
				width: node.width,
				height: node.height,
				fixed: Boolean(node.fixed),
				timelineYear: node.timelineYear || null
			}))
		};
		const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");

		link.href = url;
		link.download = "project-context-node-coordinates.json";
		link.click();
		URL.revokeObjectURL(url);
	}

	const dragBlocks = d3.drag()
		.on("start", function (event) {
			event.sourceEvent.stopPropagation();
			d3.select(this).raise().classed("is-dragging", true);
		})
		.on("drag", function (event, node) {
			if (node.id === "mitchel-resnick") {
				node.x += event.dx;
			}

			node.y += event.dy;
			d3.select(this).attr("transform", nodeTransform(node));
			updateConnections();
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
	blockSelection.filter((node) => !node.fixed).call(dragBlocks);
	blockSelection.filter((node) => node.fixed)
		.on("mousedown.locked-block touchstart.locked-block pointerdown.locked-block", (event) => {
			event.stopPropagation();
		});
	downloadButton?.addEventListener("click", downloadProjectContextCoordinates);
	updateConnections();
	});
}());
