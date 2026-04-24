const fs = require('fs');
const path = require('path');

const castDir = path.join(__dirname, '../images/cast');
const outputJs = path.join(__dirname, '../data/cast-data.js');

function getCastList() {
	const files = fs.readdirSync(castDir).filter(file => file.match(/\.(jpg|png)$/i));
	const numbered = [];

	files.forEach(file => {
		const match = file.match(/^([0-9]+)_(.+)\.(jpg|png)$/i);
		if (!match) return;

		numbered.push({
			order: parseInt(match[1], 10),
			name: match[2],
			image: `images/cast/${ file }`
		});
	});

	numbered.sort((a, b) => a.order - b.order);
	return numbered;
}

function writeCastDataJs(castList) {
	const jsStr = `window.CAST_DATA = ${JSON.stringify(castList, null, 2)};\n`;
	fs.writeFileSync(outputJs, jsStr, 'utf8');
	console.log('Updated data/cast-data.js');
}

const castList = getCastList();
writeCastDataJs(castList);
