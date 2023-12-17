// TODO: import without knowlege of path
import * as WebconConfig from '../../webcon.config.json';
import { getParsedTemplateFunction } from "../template";

interface WebconElementConfig {
  loaded: boolean;
  selector: string;
  template: string;
  style?: string;
}

interface WebconElementProps {
  prerender?: string;
  shadow?: string;
  head?: string;
  action?: string;
  method?: string;
  event?: string;
  lanuage?: string;
}

const noop = () => { };

const elements = WebconConfig.elements;

const init = (element: WebconElementConfig): Promise<WebconElementConfig> => {
  if (!element.template) {
    throw new Error('You need to pass a template for the element');
  }
  return new Promise<WebconElementConfig>((resolve, reject) => {
    if (!element.loaded) {
      const promises = [
        fetch(`templates/${element.template}`)
          .then(response => response.text())
      ];
      if (element.style) {
        promises.push(fetch(`templates/${element.style}`)
          .then(response => response.text()));
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

const Webcon = (selector: string) => (cls: CustomElementConstructor): void => {
  if (selector.indexOf('-') <= 0) {
    throw new Error('You need at least 1 dash in the custom element name!');
  }

  init(elements[selector]).then((element: WebconElementConfig) => {

    const connectedCallback = cls.prototype.connectedCallback || noop;
    const disconnectedCallback = cls.prototype.disconnectedCallback || noop;

    cls.prototype.connectedCallback = function () {

      const context: WebconElementProps = {};

      Array.from(this.attributes).forEach((attr: any) => {
        if (attr.nodeValue !== undefined) {
          if (attr.nodeValue.length === 0) {
            context[attr.nodeName] = true;
          } else {
            context[attr.nodeName] = attr.nodeValue;
          }
        }
      });

      const viewRender = getParsedTemplateFunction(element.template, {});

      const viewElem = document.createElement('template');
      viewElem.innerHTML = viewRender(context);

      const viewClone = document.importNode(viewElem.content, true);

      let styleClone;

      if (element.style) {
        const styleRender = getParsedTemplateFunction(element.style, {});
        const styleElem = document.createElement('style');
        styleElem.innerText = styleRender(context);
        styleClone = document.importNode(styleElem, true);
      }

      if (context.head) {
        document.head.appendChild(viewClone);
        document.body.removeChild(this);
      } else if (context.shadow) {
        const shadowWrapper = document.createElement('div');
        const shadowRoot = shadowWrapper.attachShadow({ mode: 'open' });
        if (styleClone) {
          shadowRoot.appendChild(styleClone);
        }
        shadowRoot.appendChild(viewClone);
        this.parentNode.insertBefore(shadowWrapper, this);
        this.parentNode.removeChild(this);
      } else {
        if (styleClone) {
          this.parentNode.insertBefore(styleClone, this);
        }
        this.parentNode.insertBefore(viewClone, this);
        this.parentNode.removeChild(this);
      }

      if (this.beforeMount) {
        this.beforeMount();
      }

      connectedCallback.call(this);

      if (this.afterMount) {
        this.afterMount();
      }

    };

    cls.prototype.disconnectedCallback = function () {

      if (this.beforeUnmount) {
        this.beforeUnmount();
      }

      disconnectedCallback.call(this);

      if (this.afterUnmount) {
        this.afterUnmount();
      }

    };

    window.customElements.define(selector, cls);

  });

};

export {
  Webcon,
  WebconElementConfig,
  WebconElementProps
};

