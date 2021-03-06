const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
// const CompressionWebpackPlugin = require('compression-webpack-plugin');

const packageCfg = require('../package.json');
const util = require('../build/util');

//设置全局环境变量
const env = require('../config/prod.env');
process.env.NODE_ENV = JSON.parse(env.NODE_ENV);
//构建配置
const config = require('../config');
const prodCfg = config.build;

module.exports = {
    output: {
        filename: util.assetsPath('js/[name].js'),
        chunkFilename: util.assetsPath('js/[name].js')
    },
    devtool: prodCfg.devtool,
    plugins: [
        new webpack.DefinePlugin({
            'process.env': env
        }),
        new webpack.BannerPlugin({//注释信息
            banner: `project:"${packageCfg.name}",author:"${packageCfg.author}"`,
            test: [/\.js$/, /\.css$/]
        }),
        //如果你引入一个新的模块，会导致 module id 整体发生改变，可能会导致所有文件的chunkhash发生变化
        //HashedModuleIdsPlugin根据模块的相对路径生成一个四位数的hash作为模块id，这样就算引入了新的模块，也不会影响 module id 的值
        new webpack.HashedModuleIdsPlugin(),
        new ParallelUglifyPlugin({
            // 缓存压缩后的结果，下次遇到一样的输入时直接从缓存中获取压缩后的结果返回
            // cacheDir 用于配置缓存存放的目录路径
            cacheDir: 'node_modules/.uglify-cache',
            sourceMap: true,
            output: {
                // 最紧凑的输出
                beautify: false,
                // 删除所有的注释
                comments: false
            },
            compress: {
                // 在UglifyJs删除没有用到的代码时不输出警告
                warnings: false,
                // 删除所有的 `console` 语句，可以兼容ie浏览器
                drop_console: true,
                // 内嵌定义了但是只用到一次的变量
                collapse_vars: true,
                // 提取出出现多次但是没有定义成变量去引用的静态值
                reduce_vars: true
            }
        }),
        new ExtractTextPlugin({
            filename: util.assetsPath('css/[name].css'),
            allChunks: true
        }),
        // new CompressionWebpackPlugin({
        //     test:/\.(js|css)$/,
        //     asset: '[path].gz[query]',
        //     algorithm:'gzip',
        //     threshold:0
        // }),
        // new webpack.optimize.CommonsChunkPlugin({//提取框架/类库脚本
        //     name: 'vendor',
        //     minChunks: function (module, count) {
        //         return (
        //             module.resource &&
        //             /\.js$/.test(module.resource) &&
        //             module.resource.indexOf('css-loader') === -1 &&//去除被打包进来的css-loader
        //             module.resource.indexOf(
        //                 path.join(__dirname, '../node_modules')
        //             ) === 0
        //         )
        //     }
        // }),
        // new webpack.optimize.CommonsChunkPlugin({//提取webpack运行时脚本
        //     name: 'manifest',
        //     minChunks: Infinity
        // }),
        new webpack.optimize.ModuleConcatenationPlugin(),//作用域提升 (scope hoisting)
        new BundleAnalyzerPlugin({
            analyzerHost: '127.0.0.1',
            analyzerPort: 8888,
            openAnalyzer: false
        })
    ]
}