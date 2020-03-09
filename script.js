var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var grid = [];
var cellSize = 20;
var running = false;
var mouseDown = false;

function handleMouseEvent(event, moving) {
	var x = event.clientX;
	var y = event.clientY;
	for (var i = 0; i < grid.length; i++) {
		for (var j = 0; j < grid[i].length; j++) {
			var cell = grid[i][j];
			if (x >= cell.x && x <= cell.x + cellSize
				&& y >= cell.y && y <= cell.y + cellSize) {
				if (moving) {
					cell.filled = true;
				}
				else {
					cell.filled = !cell.filled;
				}
			}
		}
	}
}

window.addEventListener('mousedown', function (event) {
	mouseDown = true;
	handleMouseEvent(event, false);
});

window.addEventListener('mouseup', function (event) {
	mouseDown = false;
});

window.addEventListener('mousemove', function (event) {
	if (mouseDown) {
		handleMouseEvent(event, true)
	}
});

function initGrid() {
	for (var i = 1; i < canvas.height; i += cellSize + 1) {
		var row = [];
		for (var j = 1; j < canvas.width; j += cellSize + 1) {
			ctx.beginPath();
			ctx.rect(j, i, cellSize, cellSize);
			ctx.fillStyle = "white";
			ctx.fill();
			row.push({
				"x": j,
				"y": i,
				"filled": false
			});
		}
		grid.push(row);
	}
}

function reset() {
	running = false;
	initGrid();
	update();
}

function getNumNeighbors(i, j) {
	var cell = grid[i][j];
	var numNeighbors = 0;

	if (i - 1 >= 0 && grid[i - 1][j].filled)
		numNeighbors++;

	if (j - 1 >= 0 && grid[i][j - 1].filled)
		numNeighbors++;

	if (i - 1 >= 0 && j - 1 >= 0 && grid[i - 1][j - 1].filled)
		numNeighbors++;

	if (i + 1 < grid.length && grid[i + 1][j].filled)
		numNeighbors++;

	if (j + 1 < grid[i].length && grid[i][j + 1].filled)
		numNeighbors++;

	if (i + 1 < grid.length && j + 1 < grid[i].length && grid[i + 1][j + 1].filled)
		numNeighbors++;

	if (i - 1 >= 0 && j + 1 < grid[i].length && grid[i - 1][j + 1].filled)
		numNeighbors++;

	if (i + 1 < grid.length && j - 1 >= 0 && grid[i + 1][j - 1].filled)
		numNeighbors++;

	return numNeighbors;
}

function randomize() {
	for (var i = 0; i < grid.length; i++) {
		for (var j = 0; j < grid[i].length; j++) {
			var filled = false;
			if (Math.random() < 0.5)
				filled = true;
			grid[i][j].filled = filled;
		}
	}
	updateGrid();
}

function run() {
	var rules = document.getElementById("rule");
	if (rules.selectedIndex == 0) {
		gameOfLife();
	}
	else if (rules.selectedIndex == 1) {
		rule30();
	}
}

async function gameOfLife() {
	running = true;

	while (running) {
		var updatedGrid = [];
		for (var i = 0; i < grid.length; i++) {
			var row = [];

			for (var j = 0; j < grid[i].length; j++) {
				var cell = grid[i][j];
				var numNeighbors = getNumNeighbors(i, j);
				// check if cell is populated
				if (cell.filled) {
					if (numNeighbors <= 1) {
						// die from solitude
						// cell.filled = false;
						row.push(false);
					}
					else if (numNeighbors >= 4) {
						// die from overpopulation
						// cell.filled = false;
						row.push(false);
					}
					else {
						// any other codition and it survives
						row.push(true);
					}
				}
				else {
					if (numNeighbors == 3) {
						// populate when it has three neighbors
						// cell.filled = true;
						row.push(true);
					}
					else {
						row.push(false);
					}
				}
			}
			updatedGrid.push(row);
		}

		for (var i = 0; i < grid.length; i++) {
			for (var j = 0; j < grid[i].length; j++) {
				grid[i][j].filled = updatedGrid[i][j];
			}
		}

		updateGrid();
		await new Promise(r => setTimeout(r, 75));
	}
}

async function rule30() {
	running = true;

	while (running) {
		var updatedGrid = [];
		for (var i = 0; i < grid.length; i++) {
			var row = [];

			for (var j = 0; j < grid[i].length; j++) {
				var cell = grid[i][j];
				var leftFilled = false;
				var rightFilled = false;

				// edge cases
				if (j != 0) {
					leftFilled = grid[i][j - 1].filled;
				}
				if (j != grid[i].length - 1) {
					rightFilled = grid[i][j + 1].filled;
				}

				if (cell.filled) {
					if ((leftFilled && rightFilled) || (leftFilled && !rightFilled)) {
						row.push(false);
					}
					else {
						row.push(true);
					}
				}
				else {
					if ((leftFilled && rightFilled) || (!leftFilled && !rightFilled)) {
						row.push(false);
					}
					else {
						row.push(true);
					}
				}
			}
			updatedGrid.push(row);
		}

		for (var i = 0; i < grid.length; i++) {
			for (var j = 0; j < grid[i].length; j++) {
				grid[i][j].filled = updatedGrid[i][j];
			}
		}

		updateGrid();
		await new Promise(r => setTimeout(r, 50));
	}
}

function updateGrid() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (var i = 0; i < grid.length; i++) {
		for (var j = 0; j < grid[i].length; j++) {
			var cell = grid[i][j];

			ctx.beginPath();
			ctx.rect(cell.x, cell.y, cellSize, cellSize);
			if (cell.filled) {
				ctx.fillStyle = "black";
			}
			else {
				ctx.fillStyle = "white";
			}
			ctx.fill();
		}
	}
}

function update() {
	if (!running) {
		updateGrid();

		requestAnimationFrame(update);
	}
}

initGrid();
requestAnimationFrame(update);