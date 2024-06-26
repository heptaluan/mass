const path = require('path')
// local
const API = 'http://192.168.1.65:9901/';

module.exports = {
    // publicPath: './', // 署应用包时的基本 URL。 vue-router hash 模式使用
    publicPath: '/', // 署应用包时的基本 URL。  vue-router history模式使用
    outputDir: 'dist', //  生产环境构建文件的目录
    assetsDir: 'static', //  outputDir的静态资源(js、css、img、fonts)目录
    // lintOnSave: !IS_PROD,
    productionSourceMap: false, // 如果你不需要生产环境的 source map，可以将其设置为 false 以加速生产环境构建。
    devServer: {
        proxy: {
            '/api': {
                target: API,
                changeOrigin: true,
                pathRewrite: {'^/api': ''}
            },
        }
    },
    configureWebpack: {
        resolve: {
            symlinks: false,
            alias: {
                vue: path.resolve('./node_modules/vue')
            }
        }
    }
}
