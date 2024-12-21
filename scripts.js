$(document).ready(function () {
	let doors = [1, 2, 3];
	let prizeDoor, chosenDoor, revealedDoor, initialChoice;
	let finalPhase = false;
	let gameCounter = 1; // Start counter for games played
	const allGameResults = []; // Array to store all game results
	const bgMusic = document.getElementById('bg-music');
	const speakerIcon = document.getElementById('speaker-icon');
	let isMuted = false; // Tracks the mute state

	// Initialize or reset the game
	function initializeGame() {
		$('.door-panel').removeClass('open correct incorrect unclickable');
		$('.door-reveal').removeClass('open');
		$('#instructions').text('Make your first choice.');
		chosenDoor = null;
		revealedDoor = null;
		initialChoice = null;
		finalPhase = false;
		prizeDoor = doors[Math.floor(Math.random() * doors.length)];
	}

	// Get current date and time in the format YYYY-MM-DD, HH:MM:SS AM/PM
	function getCurrentDateTime() {
		const now = new Date();
		const date = now.toISOString().split('T')[0];
		const time = now.toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: true,
		});
		return `${date}, ${time}`;
	}

	// Reveal one goat door
	function revealGoat() {
		revealedDoor = doors.find(door => door !== chosenDoor && door !== prizeDoor);
		$(`#door${revealedDoor} .door-panel`).addClass('open unclickable'); // Mark the eliminated door as unclickable
		$('#instructions').text('Would you like to switch doors? Click your final choice.');
		finalPhase = true;
		initialChoice = chosenDoor; // Save the initial choice
	}

	// Check if the player won or lost
	function checkWin() {
		const result = chosenDoor === prizeDoor ? "Win!!!" : "Loss :(";
		const rowClass = chosenDoor === prizeDoor ? "win" : "loss";

		// Determine if the player switched or stayed
		const switchOrStay = chosenDoor === initialChoice ? "No" : "Yes";

		$('.door-frame').each(function () {
			const doorNumber = parseInt($(this).data('door'));
			const panel = $(this).find('.door-panel');
			const reveal = $(this).find('.door-reveal');

			panel.addClass('open'); // Swing the door open
			if (doorNumber === prizeDoor) {
				panel.addClass('correct');
				reveal.addClass('open').text('✔');
			} else {
				panel.addClass('incorrect');
				reveal.addClass('open').text('✖');
			}
		});

		$('#instructions').text(
			result === "Win!!!" ? "Congratulations! You won the prize!" : "Sorry! You chose the wrong door."
		);

		updateHistory(
			gameCounter++,
			getCurrentDateTime(),
			result,
			chosenDoor,
			prizeDoor,
			switchOrStay,
			rowClass
		);
		finalPhase = false;

		// Add a 2-second delay before resetting the game
		setTimeout(() => {
			initializeGame();
			$('#instructions').text('Make your first choice.'); // Reset the instructions
		}, 2500);
	}


	// Update the history table with game details
	function updateHistory(gameNumber, dateTime, result, chosen, prize, switchOrStay, rowClass) {
		// Add the new game result to memory
		allGameResults.push({
			gameNumber,
			dateTime,
			result,
			chosen,
			prize,
			switchOrStay,
			rowClass
		});

		// Get the last 3 results, in reverse order (newest at the top)
		const visibleResults = allGameResults.slice(-3).reverse();

		// Clear the table and re-render visible results
		$('#history-body').empty();
		visibleResults.forEach(({
			gameNumber,
			dateTime,
			result,
			chosen,
			prize,
			switchOrStay,
			rowClass
		}) => {
			const newRow = `
      <tr class="${rowClass}">
        <td>${gameNumber}</td>
        <td>${dateTime}</td>
        <td>${result}</td>
        <td>${chosen}</td>
        <td>${prize}</td>
        <td>${switchOrStay}</td>
      </tr>
    `;
			$('#history-body').append(newRow);
		});

		// Update the score after adding the new row
		updateScore();
	}


	// Door click event
	$('.door-panel').on('click', function (event) {
		event.stopPropagation();
		const doorPanel = $(this);

		// Prevent interaction with unclickable doors
		if (doorPanel.hasClass('unclickable')) return;

		const doorFrame = doorPanel.closest('.door-frame');
		const selectedDoor = parseInt(doorFrame.data('door'));

		if (!chosenDoor) {
			// First choice
			chosenDoor = selectedDoor;
			revealGoat();
		} else if (finalPhase) {
			// Final choice
			chosenDoor = selectedDoor;
			checkWin();
		}
	});

	// Speaker button click event for muting/unmuting background music
	$('.speaker-button').on('click', function () {
		isMuted = !isMuted;
		bgMusic.muted = isMuted;

		// Update the icon
		if (isMuted) {
			speakerIcon.classList.remove('fa-volume-high');
			speakerIcon.classList.add('fa-volume-xmark');
		} else {
			speakerIcon.classList.remove('fa-volume-xmark');
			speakerIcon.classList.add('fa-volume-high');
		}
	});

	// Restart button event
	$('#restart').on('click', function () {
		initializeGame();
	});

	// Clear history button event
	$('#clear-history').on('click', function () {
		$('#history-body').empty();
		allGameResults.length = 0; // Clear the stored results array
		gameCounter = 1; // Reset counter
		updateScore(); // Reset the score
	});


	// Popup Ad Logic
	const popupAd = document.getElementById('popup-ad');
	const closePopup = document.getElementById('close-popup');

	// Show popup on load
	popupAd.classList.add('active');

	// Close popup and start game music
	closePopup.addEventListener('click', () => {
		popupAd.classList.remove('active');
		bgMusic.play().catch(() => console.log('Autoplay prevented by browser.'));
	});

	// Function to update the score
	function updateScore() {
		let wins = 0;
		let losses = 0;

		// Iterate over the allGameResults array to calculate the total wins and losses
		allGameResults.forEach(({
			result
		}) => {
			if (result === "Win!!!") {
				wins++;
			} else if (result === "Loss :(") {
				losses++;
			}
		});

		// Calculate the win percentage
		const totalGames = wins + losses;
		const winPercentage = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

		// Update the score text dynamically with styles
		$('.score-text').html(
			`<span style="color: #cc0000; font-weight: bold;">${wins}W</span><span style="color: black; font-weight: bold;">&nbsp;|&nbsp;</span><span style="color: #0077cc; font-weight: bold;">${losses}L</span>`
		);

		// Update the win percentage text dynamically
		$('.win-percentage-text').text(`${winPercentage}%`);
	}


	// Start the game on page load
	initializeGame();
});