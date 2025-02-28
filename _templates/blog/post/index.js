module.exports = {
	prompt: ({ prompter }) => {
		return prompter
			.prompt([
				{
					type: 'input',
					name: 'slug',
					message:
						'What do you want the slug of the blog post to be?',
				},
				{
					type: 'input',
					name: 'title',
					message: 'What is the title of the blog post?',
				},
			])
			.then((answers) => {
				return {
					...answers,
					createdAt: new Date().toISOString(),
				}
			})
	},
}
