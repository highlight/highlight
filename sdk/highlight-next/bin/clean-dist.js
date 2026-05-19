import fs from 'fs';

const files = ['dist/next-client.js', 'dist/next-client.cjs'];

for (const file of files) {
	if (fs.existsSync(file)) {
		let content = fs.readFileSync(file, 'utf8');
		// Remove all occurrences of "use client"; or 'use client';
		content = content.replace(/['"]use client['"];?/g, '');
		// Prepend "use client"; to the top of the file
		fs.writeFileSync(file, `"use client";\n${content.trimStart()}`);
		console.log(`Successfully prepared ${file} with "use client"`);
	}
}
