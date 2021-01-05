const fs = require('fs-extra');
const concat = require('concat');
(async function build() {
  const files = [
    './dist/deliverai-frontend-web-widget/runtime.js',
    './dist/deliverai-frontend-web-widget/polyfills.js',
    './dist/deliverai-frontend-web-widget/scripts.js',
    './dist/deliverai-frontend-web-widget/main.js'
  ];
  await fs.ensureDir('order-widget');
  await concat(files, 'order-widget/order-widget.js');
  await fs.copy('./dist/deliverai-frontend-web-widget/styles.css', 'order-widget/order-widget.css');
  await fs.copy('./dist/deliverai-frontend-web-widget/assets/', 'order-widget/assets/');
})();
