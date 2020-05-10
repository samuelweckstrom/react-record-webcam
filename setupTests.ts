const tsc = require('typescript')
const tsConfig = require('./tsconfig.json')
const Enzyme = require('enzyme')
const Adapter = require('enzyme-adapter-react-16')
Enzyme.configure({ adapter: new Adapter() })

module.exports = {
  process(src: string, path: string): string {
    if (
      path.endsWith('.ts') ||
      path.endsWith('.tsx') ||
      path.endsWith('.js') ||
      path.endsWith('.jsx')
    ) {
      return tsc.transpile(src, tsConfig.compilerOptions, path, [])
    }
    return src
  },
}
