// Only need to run this when upgrading antd or overrides
import less from 'less'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'

const options = {
	javascriptEnabled: true,
	modifyVars: {
		hack: `true; @import "${path.join(
			process.cwd(),
			'src/style/AntDesign/antd.overrides.less',
		)}";`,
	},
	filename: path.join(process.cwd(), '../node_modules/antd/dist/antd.less'),
}

const antdLess = await fs.readFile(options.filename, { encoding: 'utf-8' })

less.render(antdLess, options).then(({ css }) =>
	fs.writeFile(path.join(process.cwd(), 'src/__generated/antd.css'), css),
)
