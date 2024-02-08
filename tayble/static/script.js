let isFirstPair = true;
let isSecondPair = false;
let startCoords = null;
let selectedCellsCoords = [];
let currentColor = 'blue';
let targetIndex = null;


document.addEventListener('DOMContentLoaded', function() {
    // Select all buttons
    const buttons = document.querySelectorAll('.sheetButton');

    // Add event listeners to each button
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Get the target index from the button's data-target attribute
            targetIndex = this.getAttribute('data-target');

            console.log(targetIndex); 
            // Find the corresponding table content
            const targetContent = document.getElementById(`tableContent_${targetIndex}`).innerHTML;

            // Update the tableDiv's content
            document.getElementById('tableDiv').innerHTML = targetContent;
            const myTableWithinDiv = document.getElementById('tableDiv').querySelector('#myTable');
            myTableWithinDiv.addEventListener('mousedown', trackClicks);

            // Reset the selection state
            selectedCellsCoords = []; // Reset after sending
            resetSelectionState(); // Reset selection states and clear highlights
        });
    });
});

function trackClicks(event) {
    if (event.target.tagName === 'TD') {
        console.log("Click recorded"); 
        if (!startCoords) {
            // Start of a pair
            startCoords = getCellCoords(event.target);
            console.log(startCoords);
        } else {
            // End of a pair
            const endCoords = getCellCoords(event.target);
            console.log(endCoords);
            highlightCellsBetween(startCoords, endCoords, currentColor);
            adjustColor(); // Adjust the color for the next selection pair
            startCoords = null; // Reset for the next start of a pair
        }
    }
}

document.getElementById('doneButton').addEventListener('click', function() {
    console.log("Done recorded");
    sendCoordsToServer(selectedCellsCoords);
    const savePath = replaceExtensionWithSheetId(document.getElementById('file_path').innerHTML, targetIndex);
    alert(`CSV saved at path: ${savePath}`);
    selectedCellsCoords = []; // Reset after sending
    resetSelectionState(); // Reset selection states and clear highlights
});

document.getElementById('cancelButton').addEventListener('click', function() {
    selectedCellsCoords = []; // Reset after sending
    resetSelectionState(); // Reset selection states and clear highlights
});

function getCellCoords(cell) {
    return { rowIndex: cell.parentNode.rowIndex, cellIndex: cell.cellIndex };
}

function highlightCellsBetween(start, end, color) {
    const table = document.getElementById('tableDiv').querySelector('#myTable');
    for (let i = Math.min(start.rowIndex, end.rowIndex); i <= Math.max(start.rowIndex, end.rowIndex); i++) {
        for (let j = Math.min(start.cellIndex, end.cellIndex); j <= Math.max(start.cellIndex, end.cellIndex); j++) {
            const cell = table.rows[i].cells[j];
            console.log(color);
            console.log(cell);
            cell.classList.add(color);
        }
    }
    const start_end_coords = [start.rowIndex, start.cellIndex, end.rowIndex, end.cellIndex];
    selectedCellsCoords.push(start_end_coords); // Save coordinates
}

function adjustColor() {
    // Adjust color based on the current selection state
    if (isFirstPair) {
        currentColor = 'green';
        isFirstPair = false;
        isSecondPair = true;
    } else if (isSecondPair) {
        currentColor = 'red';
        isSecondPair = false; // All subsequent selections will remain red
    }
}

function resetSelectionState() {
    clearHighlights(); // Clear all highlights from the table
    isFirstPair = true;
    isSecondPair = false;
    currentColor = 'blue';
}

function clearHighlights() {
    document.querySelectorAll('#myTable td').forEach(cell => {
        cell.classList.remove('blue', 'green', 'red');
    });
}

function sendCoordsToServer(selectedCoords) {
    console.log(targetIndex);
    fetch('/save-coords', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            coords: selectedCoords,
            sheetIndex: targetIndex
            })
    })
    .then(response => response.json())
    .then(data => console.log('Success:', data))
    .catch((error) => console.error('Error:', error));
}


function replaceExtensionWithSheetId(path, sheetId) {
    return path.replace(/\.[^/.]+$/, `_${sheetId}.csv`); // This is a simplified version for the client side
}