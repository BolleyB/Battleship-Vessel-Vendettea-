document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const userGrid = document.querySelector('.grid-user');
    const computerGrid = document.querySelector('.grid-computer');
    const startButton = document.querySelector('#start');
    const rotateButton = document.querySelector('#rotate');
    const turnDisplay = document.querySelector('#whose-go');
    const infoDisplay = document.querySelector('#info');

    // Game variables
    const width = 10;
    let isHorizontal = true;
    let isGameOver = false;
    let currentPlayer = 'user';
    const userSquares = [];
    const computerSquares = [];

    // Ship definitions
    const shipArray = [
        { name: 'destroyer', length: 2 },
        { name: 'submarine', length: 3 },
        { name: 'cruiser', length: 3 },
        { name: 'battleship', length: 4 },
        { name: 'carrier', length: 5 }
    ];

    // Initialize game
    function init() {
        createBoard(userGrid, userSquares);
        createBoard(computerGrid, computerSquares);
        startButton.addEventListener('click', startGame);
        rotateButton.addEventListener('click', rotateShips);
    }

    // Create game boards
    function createBoard(grid, squares) {
        for (let i = 0; i < width * width; i++) {
            const square = document.createElement('div');
            square.dataset.id = i;
            grid.appendChild(square);
            squares.push(square);
        }
    }

    // Start the game
    function startGame() {
        generateRandomShips();
        playGame();
    }

    // Generate random ship placements
    function generateRandomShips() {
        shipArray.forEach(ship => {
            let randomDirection = Math.floor(Math.random() * 2); // 0 for horizontal, 1 for vertical
            let current = ship.directions[randomDirection];
            let randomStart = Math.floor(Math.random() * userSquares.length);

            const isTaken = current.some(index => userSquares[randomStart + index].classList.contains('taken'));
            const isAtRightEdge = current.some(index => (randomStart + index) % width === width - 1);
            const isAtLeftEdge = current.some(index => (randomStart + index) % width === 0);

            if (!isTaken && !(isAtRightEdge && isAtLeftEdge)) {
                current.forEach(index => userSquares[randomStart + index].classList.add('taken', ship.name));
            } else {
                generateRandomShips(); // Recursive call on invalid placement
            }
        });
    }

    // Game loop
    function playGame() {
        turnDisplay.textContent = "Your turn";
        computerGrid.addEventListener('click', event => {
            if (currentPlayer === 'user' && !isGameOver) {
                const squareId = event.target.dataset.id;
                handleUserShot(computerSquares[squareId]);
            }
        });
    }

    // Handle user's shot
    function handleUserShot(square) {
        if (!square.classList.contains('fired')) {
            square.classList.add('fired');
            if (square.classList.contains('taken')) {
                square.classList.add('hit');
                infoDisplay.textContent = 'Hit!';
            } else {
                square.classList.add('miss');
                infoDisplay.textContent = 'Miss!';
            }
            checkForWin();
        }
    }

   // Handle computer's turn
    function computerShot() {
        let validShot = false;
        let target;

    // Keep trying until a valid, unfired square is selected
        while (!validShot) {
        // Generate a random index for the shot
            const randomIndex = Math.floor(Math.random() * userSquares.length);

        // Get the target square at the random index
            target = userSquares[randomIndex];

        // Check if the square has not been fired upon
            if (!target.classList.contains('fired')) {
                validShot = true; // Mark as valid shot and exit the loop
            }
        }

        // Mark the square as fired
        target.classList.add('fired');

        // Check for hit or miss
        if (target.classList.contains('taken')) {
            // It's a hit
            target.classList.add('hit');
            infoDisplay.textContent = 'Computer hit one of your ships!';
        } else {
            // It's a miss
            target.classList.add('miss');
            infoDisplay.textContent = 'Computer missed!';
        }

        // Check for win condition after the computer's shot
        checkForWin();

        // Change turn back to the user
        currentPlayer = 'user';
        turnDisplay.textContent = "Your turn";
    }

    // Check for win conditions
    function checkForWin() {
        // Check if all ships in the computer's grid have been hit
        const allComputerShipsHit = computerSquares.every(square => {
            return !square.classList.contains('taken') || square.classList.contains('hit');
        });

        // Check if all ships in the user's grid have been hit
        const allUserShipsHit = userSquares.every(square => {
            return !square.classList.contains('taken') || square.classList.contains('hit');
        });

        // Declare the winner based on the ships hit
        if (allComputerShipsHit) {
            infoDisplay.textContent = 'Congratulations! You Win!';
            gameOver();
        } else if (allUserShipsHit) {
            infoDisplay.textContent = 'Computer Wins! Better luck next time.';
            gameOver();
        }
    }


    // End the game
    function gameOver() {
        isGameOver = true;
        turnDisplay.textContent = "Game Over";
        startButton.disabled = true;
    }

    // Rotate ships
    function rotateShips() {
        isHorizontal = !isHorizontal;
        // Update UI or ship elements as needed to indicate rotation
    }

    // Initialize the game setup
    init();
});
