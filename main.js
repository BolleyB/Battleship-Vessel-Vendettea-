document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const userGrid = document.querySelector(".grid-user");
  const computerGrid = document.querySelector(".grid-computer");
  const startButton = document.querySelector("#start");
  const rotateButton = document.querySelector("#rotate");
  const restartButton = document.querySelector("#restart");
  const turnDisplay = document.querySelector("#whose-go");
  const infoDisplay = document.querySelector("#info");

  // Game variables
  const width = 10;
  let isHorizontal = true;
  let isGameOver = false;
  let currentPlayer = "user";
  const userSquares = [];
  const computerSquares = [];

  // Ship definitions
  const shipArray = [
    {
      name: "destroyer",
      length: 2,
      directions: [
        [0, 1],
        [1, width],
      ],
    },
    {
      name: "submarine",
      length: 3,
      directions: [
        [0, 1, 2],
        [1, width, width * 2],
      ],
    },
    {
      name: "cruiser",
      length: 3,
      directions: [
        [0, 1, 2],
        [1, width, width * 2],
      ],
    },
    {
      name: "battleship",
      length: 4,
      directions: [
        [0, 1, 2, 3],
        [1, width, width * 2, width * 3],
      ],
    },
    {
      name: "carrier",
      length: 5,
      directions: [
        [0, 1, 2, 3, 4],
        [1, width, width * 2, width * 3, width * 4],
      ],
    },
  ];

  // Initialize game
  function init() {
    createBoard(userGrid, userSquares);
    createBoard(computerGrid, computerSquares);
    startButton.addEventListener("click", startGame);
    rotateButton.addEventListener("click", rotateShips);
    restartButton.addEventListener("click", restartGame); // Event listener for restart button
  }

  // Create game boards
  function createBoard(grid, squares) {
    for (let i = 0; i < width * width; i++) {
      const square = document.createElement("div");
      square.dataset.id = i;
      grid.appendChild(square);
      squares.push(square);
    }
  }

  // Start the game
  function startGame() {
    generateRandomShips(); // Generate user ships
    generateCPUShips(); // Generate CPU ships
    playGame();
  }
  function restartGame() {
    // Remove ships from both grids
    userSquares.forEach((square) => {
      square.classList.remove(
        "taken",
        "destroyer",
        "submarine",
        "cruiser",
        "battleship",
        "carrier",
        "hit",
        "miss",
        "fired"
      );
    });
    computerSquares.forEach((square) => {
      square.classList.remove(
        "taken",
        "destroyer",
        "submarine",
        "cruiser",
        "battleship",
        "carrier",
        "hit",
        "miss",
        "fired"
      );
    });
    // Reset game variables
    isGameOver = false;
    currentPlayer = "user";
    // Clear info display
    infoDisplay.textContent = "";
    // Start a new game
    startGame();
  }

  function generateRandomShips() {
    shipArray.forEach((ship) => {
      let randomDirection,
        current,
        randomStart,
        isTaken,
        isAtRightEdge,
        isAtLeftEdge;

      // Try to place the ship until successful
      do {
        randomDirection = Math.floor(Math.random() * 2); // 0 for horizontal, 1 for vertical
        current = ship.directions[randomDirection];
        randomStart = Math.floor(
          Math.random() * (userSquares.length - ship.length + 1)
        );

        // Check if any of the squares in the ship's path are taken or at grid edges
        isTaken = current.some((index) => {
          const square = userSquares[randomStart + index];
          return !square || square.classList.contains("taken");
        });

        isAtRightEdge = current.some(
          (index) => (randomStart + index) % width === width - 1
        );
        isAtLeftEdge = current.some(
          (index) => (randomStart + index) % width === 0
        );
      } while (isTaken || (isAtRightEdge && isAtLeftEdge));

      // Place the ship if conditions are met
      current.forEach((index) =>
        userSquares[randomStart + index].classList.add("taken", ship.name)
      );
    });
  }

  // Generate CPU ships
  function generateCPUShips() {
    shipArray.forEach((ship) => {
      let randomDirection,
        current,
        randomStart,
        isTaken,
        isAtRightEdge,
        isAtLeftEdge;
      do {
        randomDirection = Math.floor(Math.random() * 2); // 0 for horizontal, 1 for vertical
        current = ship.directions[randomDirection];
        randomStart = Math.floor(
          Math.random() * (computerSquares.length - ship.length + 1)
        );
        isTaken = current.some((index) => {
          const square = computerSquares[randomStart + index];
          return !square || square.classList.contains("taken");
        });
        isAtRightEdge = current.some(
          (index) => (randomStart + index) % width === width - 1
        );
        isAtLeftEdge = current.some(
          (index) => (randomStart + index) % width === 0
        );
      } while (isTaken || (isAtRightEdge && isAtLeftEdge));
      current.forEach((index) =>
        computerSquares[randomStart + index].classList.add("taken", ship.name)
      );
    });
  }

  // Game loop
  function playGame() {
    turnDisplay.textContent = "Your turn";
    computerGrid.addEventListener("click", (event) => {
      if (currentPlayer === "user" && !isGameOver) {
        const squareId = event.target.dataset.id;
        handleUserShot(computerSquares[squareId]);
        if (!isGameOver && currentPlayer === "computer") {
          // Check if it's the computer's turn after handling user shot
          setTimeout(computerShot, 1000); // Delay computer's shot for 1 second
        }
      }
    });
  }

  // Handle user's shot
  function handleUserShot(square) {
    if (!square.classList.contains("fired")) {
      square.classList.add("fired");
      if (square.classList.contains("taken")) {
        square.classList.add("hit");
        infoDisplay.textContent = "Hit!";
      } else {
        square.classList.add("miss");
        infoDisplay.textContent = "Miss!";
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
      if (!target.classList.contains("fired")) {
        validShot = true; // Mark as valid shot and exit the loop
      }
    }

    // Mark the square as fired
    target.classList.add("fired");

    // Check for hit or miss
    if (target.classList.contains("taken")) {
      // It's a hit
      target.classList.add("hit");
      infoDisplay.textContent = "Computer hit one of your ships!";
    } else {
      // It's a miss
      target.classList.add("miss");
      infoDisplay.textContent = "Computer missed!";
    }

    // Check for win condition after the computer's shot
    checkForWin();

    // Change turn back to the user
    currentPlayer = "user";
    turnDisplay.textContent = "Your turn";
  }

  // Check for win conditions
  function checkForWin() {
    // Check if all ships in the computer's grid have been hit
    const allComputerShipsHit = computerSquares.every((square) => {
      return (
        !square.classList.contains("taken") || square.classList.contains("hit")
      );
    });

    // Check if all ships in the user's grid have been hit
    const allUserShipsHit = userSquares.every((square) => {
      return (
        !square.classList.contains("taken") || square.classList.contains("hit")
      );
    });

    // Declare the winner based on the ships hit
    if (allComputerShipsHit) {
      infoDisplay.textContent = "Congratulations! You Win!";
      gameOver();
    } else if (allUserShipsHit) {
      infoDisplay.textContent = "Computer Wins! Better luck next time.";
      gameOver();
    } else {
      // Switch turns
      currentPlayer = currentPlayer === "user" ? "computer" : "user";
      turnDisplay.textContent =
        currentPlayer === "user" ? "Your turn" : "Computer's turn";
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
