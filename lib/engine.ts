import cheerio from 'cheerio';
import fs from 'fs';
import util from 'util';

import { WebconElementConfig, WebconElementProps } from './elements/webcon.decorator';

// TODO: import without knowlege of path
import * as WebconConfig from '../webcon.config.json';

import { getParsedTemplateFunction } from './template';

const elements = WebconConfig.elements;

const readFile = util.promisify(fs.readFile);

const init = (element: WebconElementConfig): Promise<WebconElementConfig> => {
  if (!element.template) {
    throw new Error('You need to pass a template for the element');
  }
  return new Promise<WebconElementConfig>((resolve, reject) => {
    if (!element.loaded) {
      const promises = [
        readFile(element.template)
          .then(response => response.toLocaleString())
      ];
      if (element.style) {
        promises.push(readFile(element.style)
          .then(response => response.toLocaleString()));
      }
      Promise.all(promises).then((values) => {
        element.template = values[0].replace(/(\r\n|\n|\r)/g, '').replace(/\s{2,}/g, ' ');
        if (values.length > 1) {
          element.style = values[1].replace(/(\r\n|\n|\r)/g, '').replace(/\s{1,}/g, '');
        }
        element.loaded = true;
        resolve(element);
      });
    } else {
      resolve(element);
    }
  });
}

export const engine = (path: string, options: { context: any }, callback: (e: NodeJS.ErrnoException, rendered?: string) => void): void => {
  fs.readFile(path, (err: NodeJS.ErrnoException, data: Buffer) => {
    if (err) {
      return callback(err);
    }
    const template = data.toString().trim();

    if (path.endsWith('.html')) {
      const cdom = cheerio.load(template);

      const promises = [];

      for (const selector in elements) {

        cdom(selector).each(function (i, e) {
          const cd = cdom(this);

          const context: WebconElementProps = Object.assign({}, cd.attr());

          const attributes = cd.attr();
          for (const attr in attributes) {
            const value = attributes[attr];
            if (value !== undefined) {
              if (value.length === 0) {
                context[attr] = true;
              } else {
                context[attr] = value;
              }
            }
          }

          if (context.prerender) {
            promises.push(init(elements[selector]).then((element: WebconElementConfig) => {
              const viewRender = getParsedTemplateFunction(element.template, {});

              const view = viewRender(context);

              if (context.head) {
                cd.remove();
                cdom('head').append(view);
              } else {
                if (element.style) {
                  const styleRender = getParsedTemplateFunction(element.style, {});
                  const style = styleRender(context);
                  cd.replaceWith(`<style>${style}</style>${view}`);
                } else {
                  cd.replaceWith(view);
                }
              }
            }));
          }

        });
      }

      Promise.all(promises).then(() => {
        callback(null, cdom.html());
      });
    } else {
      callback(null, template);
    }

  })
};
