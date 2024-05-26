const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = function override(config, env) {
    if (env === 'production') {
        // 清除原有的 CopyPlugin 配置，避免重复
        config.plugins = config.plugins.filter(plugin => !(plugin instanceof CopyPlugin));

        // 添加新的 CopyPlugin 配置，忽略 .psd 文件
        config.plugins.push(
            new CopyPlugin({
                patterns: [
                    {
                        from: path.resolve(__dirname, 'public'),
                        to: path.resolve(__dirname, 'build'),
                        globOptions: {
                            ignore: ['**/*.psd'], // 忽略所有 .psd 文件
                        },
                        noErrorOnMissing: true,
                        force: true,
                    },
                ],
            })
        );
    }
    return config;
};
