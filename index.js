const fs = require('fs');
const http = require('http');
const url = require('url');
const slugify = require('slugify');
const replaceTemplate = require('./modules/replaceTemplate');




const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  'utf-8',
);

const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  'utf-8',
);

const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  'utf-8',
);

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

const slugs = dataObj.map((el) =>
  slugify(el.productName, { lower: true, trim: true }),
);
dataObj.forEach((el, i) => (el['slug'] = slugs[i]));

// Server
const server = http.Server((req, res) => {
  const { pathname, query } = url.parse(req.url, true);
  // Overview
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, {
      'Content-Type': 'text/html',
    });
    const overviewHtml = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join('');
    const output = tempOverview.replace(/{%PRODUCT_CARDS%}/, overviewHtml);
    res.end(output);
  }

  // Product
  else if (pathname === '/product') {
    res.writeHead(200, {
      'Content-Type': 'text/html',
    });
    const id = dataObj.findIndex((el) => el.slug === query.id);
    const product = dataObj[id];
    const output = replaceTemplate(tempProduct, product);
    res.end(output);
  }

  // Api
  else if (pathname === '/api') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
    });
    res.end(data);
  }

  // 404
  else {
    res.writeHead(404, {
      'Content-Type': 'text/html',
      'my-own-header': 'hello-world',
    });
    res.end("<h1>couldn't find what you are looking for</h1>");
  }

});

server.listen(8000, '127.0.0.1', () => {
  console.log('listening to requests on port 8000');
});
