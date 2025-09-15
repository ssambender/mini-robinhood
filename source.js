let timerInterval = null;
let seconds = 0;
let minutes = 0;

let correctAnswers = [];

async function fetchCorrectAnswers() {
    try {
        const response = await fetch('https://www.nytimes.com/svc/crosswords/v6/puzzle/mini.json');
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        correctAnswers = data.body[0].cells.map(cell => cell.answer || '');
        console.log("Correct answers cached:", correctAnswers.join(""));
    } catch (error) {
        console.error("Error fetching correct answers:", error);
    }
}

const heading = document.querySelector('h1.pz-moment__description.small.karnak');
if (heading) {
    heading.textContent = 'Made available via sambender.net';
}

const bylineDiv = document.querySelector('.xwd__details--byline');

if (bylineDiv) {
    const newSpan = document.createElement('span');
    newSpan.textContent = 'Made Available by Sam Bender';

    bylineDiv.appendChild(newSpan);
}

function areAllSquaresFilled() {
    const allPlayableCells = document.querySelectorAll('g.xwd__cell rect.xwd__cell--cell');
    let filledCount = 0;

    allPlayableCells.forEach(cell => {
        const cellGroup = cell.closest('g.xwd__cell');
        const letterTextElement = cellGroup.querySelector('text[data-testid="cell-text"]:last-of-type');

        if (letterTextElement && letterTextElement.textContent.trim().length > 0) {
            filledCount++;
        }
    });

    if (filledCount === allPlayableCells.length) {
        console.log("All letters filled!");

        const guessedLetters = [];
        const cellGroups = document.querySelectorAll('g.xwd__cell');

        cellGroups.forEach(group => {
            const textElements = group.querySelectorAll('text');
            if (textElements.length > 1) {
                const lastTextElement = textElements[textElements.length - 1];
                const letter = lastTextElement.textContent.trim();
                guessedLetters.push(letter || '');
            } else {
                guessedLetters.push('');
            }
        });

        function checkPuzzleCorrect(guessedLetters) {
            try {
                if (correctAnswers.length === 0) {
                    console.warn("Correct answers not loaded yet!");
                    return;
                }

                const allMatch = guessedLetters.length === correctAnswers.length &&
                    guessedLetters.every((letter, idx) => letter.toUpperCase() === correctAnswers[idx].toUpperCase());

                if (allMatch) {
                    if (timerInterval) {
                        clearInterval(timerInterval);
                    }

                    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
                    const formattedMinutes = minutes < 10 ? `${minutes}` : minutes;

                    (function() {
                        const popup = document.createElement('div');
                        popup.style.position = 'fixed';
                        popup.style.top = '50%';
                        popup.style.left = '50%';
                        popup.style.transform = 'translate(-50%, -50%)';
                        popup.style.width = '200px';
                        popup.style.height = '200px';
                        popup.style.backgroundColor = '#6493e6';
                        popup.style.color = 'white';
                        popup.style.display = 'flex';
                        popup.style.flexDirection = 'column';
                        popup.style.justifyContent = 'center';
                        popup.style.alignItems = 'center';
                        popup.style.borderRadius = '8px';
                        popup.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';
                        popup.style.fontFamily = 'sans-serif';
                        popup.style.zIndex = '9999';

                        const msg1 = document.createElement('div');
                        msg1.textContent = 'Well done!';

                        const msg2 = document.createElement('div');
                        msg2.textContent = `${formattedMinutes}:${formattedSeconds}`;

                        const btn = document.createElement('button');
                        btn.textContent = 'Close';
                        btn.style.marginTop = '10px';
                        btn.style.padding = '5px 10px';
                        btn.style.border = 'none';
                        btn.style.borderRadius = '4px';
                        btn.style.cursor = 'pointer';

                        btn.addEventListener('click', () => {
                            popup.remove();
                        });

                        popup.appendChild(msg1);
                        popup.appendChild(msg2);
                        popup.appendChild(btn);

                        document.body.appendChild(popup);
                    })();

                } else {
                    (function() {
                        const popup = document.createElement('div');
                        popup.style.position = 'fixed';
                        popup.style.top = '50%';
                        popup.style.left = '50%';
                        popup.style.transform = 'translate(-50%, -50%)';
                        popup.style.width = '200px';
                        popup.style.height = '200px';
                        popup.style.backgroundColor = '#6493e6';
                        popup.style.color = 'white';
                        popup.style.display = 'flex';
                        popup.style.flexDirection = 'column';
                        popup.style.justifyContent = 'center';
                        popup.style.alignItems = 'center';
                        popup.style.borderRadius = '8px';
                        popup.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';
                        popup.style.fontFamily = 'sans-serif';
                        popup.style.zIndex = '9999';

                        const msg1 = document.createElement('div');
                        msg1.textContent = 'Not quite!';

                        const btn = document.createElement('button');
                        btn.textContent = 'Close';
                        btn.style.marginTop = '10px';
                        btn.style.padding = '5px 10px';
                        btn.style.border = 'none';
                        btn.style.borderRadius = '4px';
                        btn.style.cursor = 'pointer';

                        btn.addEventListener('click', () => {
                            popup.remove();
                        });

                        popup.appendChild(msg1);
                        popup.appendChild(btn);

                        document.body.appendChild(popup);
                    })();
                }
            } catch (error) {
                console.error('Error checking puzzle correctness:', error);
            }
        }

        checkPuzzleCorrect(guessedLetters);

        return true;
    }
    return false;
}

function updateHintBox(clueNumber, direction, clueText) {
    const hintbox = document.querySelector('.xwd__clue-bar-desktop--bar');
    if (hintbox) {
        const newContent = `
      <div class="xwd__clue-bar-desktop--number">${clueNumber}${direction}</div>
      <div class="xwd__clue-bar-desktop--text xwd__clue-format">${clueText}</div>
    `;
        hintbox.innerHTML = newContent;
    }
}

const newButton = document.createElement('button');
newButton.type = 'button';
newButton.className = 'pz-moment__button';
newButton.setAttribute('aria-disabled', 'false');
newButton.setAttribute('aria-label', 'Play');
newButton.style.backgroundColor = '#000000';

const span = document.createElement('span');
span.textContent = 'Play';
newButton.appendChild(span);

const container = document.querySelector('.xwd__modal--button-container');
if (container) {
    container.prepend(newButton);
}

const subscribeButton = document.querySelector('.pz-moment__button[aria-label="Subscribe"]');
if (subscribeButton) {
    subscribeButton.remove();
}
const loginButton = document.querySelector('.pz-moment__button[aria-label="Log in"]');
if (loginButton) {
    loginButton.remove();
}

const clueListItems = document.querySelectorAll('li.xwd__clue--li');
clueListItems.forEach(clue => {
    clue.addEventListener('click', (event) => {
        const clueListItem = event.currentTarget;
        let direction = '';
        const parentList = clueListItem.closest('.xwd__clue-list--wrapper');
        if (parentList) {
            const titleElement = parentList.querySelector('.xwd__clue-list--title');
            if (titleElement) {
                direction = titleElement.textContent.trim().toLowerCase();
                direction = direction === 'across' ? 'A' : 'D';
            }
        }
        const clueNumber = clueListItem.querySelector('.xwd__clue--label').textContent.trim();
        const clueText = clueListItem.querySelector('.xwd__clue--text').textContent.trim();
        updateHintBox(clueNumber, direction, clueText);
    });
});

const board = document.querySelector('.xwd__board--content');
if (board) {
    board.addEventListener('click', () => {
        setTimeout(() => {
            const selectedCell = document.querySelector('rect.xwd__cell--selected[role="cell"]');
            if (selectedCell) {
                const ariaLabel = selectedCell.getAttribute('aria-label');
                const match = ariaLabel.match(/(\d+[AD]):\s(.+?),/);
                if (match && match[1] && match[2]) {
                    const clueNumberAndDirection = match[1];
                    const clueText = match[2];
                    const direction = clueNumberAndDirection.slice(-1);
                    const clueNumber = clueNumberAndDirection.slice(0, -1);
                    updateHintBox(clueNumber, direction, clueText);
                }
            }
        }, 50);
    });
}

document.addEventListener('keydown', (event) => {
    const key = event.key.toUpperCase();
    const isLetter = /^[A-Z]$/.test(key);

    if (!isLetter) {
        return;
    }

    const selectedCellRect = document.querySelector('rect.xwd__cell--selected');

    if (selectedCellRect) {
        const cellGroup = selectedCellRect.closest('g.xwd__cell');
        const letterTextElement = cellGroup.querySelector('text[data-testid="cell-text"]:last-of-type');

        if (letterTextElement) {
            const hiddenText = letterTextElement.querySelector('.xwd__cell--hidden');
            if (hiddenText) {
                hiddenText.textContent = key;
            }
            letterTextElement.innerHTML = `<text class="xwd__cell--hidden" aria-live="polite">${key}</text>${key}`;

            areAllSquaresFilled();
        }
    }
});

newButton.addEventListener('click', () => {
    document.querySelectorAll('.xwd__modal--wrapper').forEach(el => el.remove());

    const elements = document.querySelectorAll('.xwd__clue-list--obscured');
    elements.forEach(el => {
        el.classList.remove('xwd__clue-list--obscured');
    });

    const modal = document.querySelector('.modal-system-container.start-modal-container');
    if (modal) {
        modal.remove();
        console.log('Modal removed.');
    } else {
        console.log('Modal not found.');
    }

    seconds = 0;
    minutes = 0;
    timerInterval = setInterval(() => {
        seconds++;
        if (seconds === 60) {
            minutes++;
            seconds = 0;
        }
        const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
        const formattedMinutes = minutes < 10 ? `${minutes}` : minutes;
        const timerElement = document.querySelector('.timer-count');
        if (timerElement) {
            timerElement.textContent = `${formattedMinutes}:${formattedSeconds}`;
        }
    }, 1000);

    const hintbox = document.querySelector('.xwd__clue-bar-desktop--bar');
    if (hintbox) {
        hintbox.classList.remove('obscured');
        hintbox.classList.add('xwd__clue-format');
    }

    const firstClue = document.querySelector('li.xwd__clue--li');
    if (firstClue) {
        firstClue.click();
    }

    fetchCorrectAnswers();
});



