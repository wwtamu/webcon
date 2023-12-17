import compression from 'compression';
import express from 'express';
import fs from 'fs';
import spdy from 'spdy';
import { engine } from './lib/engine';

const app = express();

const port = 8080;

app.engine('html', engine);
app.engine('css', engine);

// TODO: should use dist directory
// TODO: use webpack to move static files into dist
app.set('views', './app/views');
app.set('view engine', 'html');
app.set('view engine', 'css');

app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}))

app.get('/', (req, res) => {
  res.render('index.html', {});
});

app.get('/templates/:template(*)', (req, res) => {
  // TODO: should be relative to dist and not require stripping part of path
  res.render(req.params.template.replace('app/views/', ''), {});
});

app.use('/static', express.static(__dirname, {
  maxAge: '604800000'
}));

const options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.crt')
};

spdy.createServer(options, app).listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
