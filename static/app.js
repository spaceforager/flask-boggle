class BoggleGame {
	constructor(boardId, secs = 60) {
		this.secs = secs;
		this.showTimer();
		this.score = 0;
		this.words = new Set();

		this.board = $('#' + boardId);
		// Counts down every 1000ms
		this.timer = setInterval(this.clockTick.bind(this), 1000);
		$('.word-form', this.board).on('submit', this.handleSubmit.bind(this));
	}

	/* Handle submission of word. If word is unique and valid, score and show */
	async handleSubmit(evt) {
		evt.preventDefault();

		const $word = $('.word', this.board);
		let word = $word.val();

		if (!word) return;

		if (this.words.has(word)) {
			this.showMessage(`Already found ${word}`, 'err');
			return;
		}

		// Check validity of word by making get request to /check-word

		const resp = await axios.get('/check-word', { params: { word: word } });
		if (resp.data.result === 'not-word') {
			this.showMessage(`${word} is not a valid English word`, 'err');
		} else if (resp.data.result === 'not-on-board') {
			this.showMessage(`${word} is not a valid word on this board`, 'err');
		} else {
			this.showWord(word);
			this.score += word.length;
			this.showScore();
			this.words.add(word);
			this.showMessage(`${word} has been added`, 'OK');
		}

		$(word).val('').focus();
	}

	/* show word in list of words */

	showWord(word) {
		let li = document.createElement('LI');
		li.innerText = word;

		let ul = document.querySelector('.words-used');
		ul.append(li);
	}

	/* show score if words used are valid */

	showScore() {
		$('.score', this.board).text(this.score);
	}

	/* Show message depending on accepted/rejected word */
	showMessage(msg, className) {
		let msge = document.querySelector('.msg');
		msge.innerText = msg;
		msge.classList.add('className');
	}

	/* Update timer in DOM */
	showTimer() {
		$('.timer', this.board).text(this.secs);
	}

	/* Handle a second passing while in game */
	async clockTick() {
		this.secs -= 1;
		this.showTimer();

		if (this.secs === 0) {
			clearInterval(this.timer);
			await this.gameScore();
		}
	}

	/* At end of game, score and show message */
	async gameScore() {
		$('.word-form', this.board).hide();
		const resp = await axios.post('/post-score', { score: this.score });
		if (resp.data.brokeRecord) {
			this.showMessage(`New record: ${this.score}`, 'ok');
		} else {
			this.showMessage(`Final score: ${this.score}`, 'ok');
		}
	}
}
