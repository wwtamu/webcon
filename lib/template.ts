import { compile } from 'handlebars';

const cache: Map<number, any> = new Map<number, any>();

const hashCode = (value) => {
  let hash;
  for (let i = 0; i < value.length; i++) {
    // tslint:disable-next-line: no-bitwise
    hash = Math.imul(31, hash) + value.charCodeAt(i) | 0;
  }
  return hash;
};

const compileTemplate = (template) => {
  if (template && template.length > 0) {
    const hash = hashCode(template);
    let templateFunction = cache.get(hash);
    if (templateFunction === undefined) {
      templateFunction = compile(template);
      cache.set(hash, templateFunction);
    }
    return templateFunction;
  }
  return (context) => '';
};

const renderTemplate = (template, resource) => {
  const templateFunction = compileTemplate(template);
  return templateFunction(resource);
};

const getTemplateFunction = (template: string, additionalContext: any = {}) => (resource: any) => {
  resource = Object.assign(resource, additionalContext);
  return renderTemplate(template, resource);
};

export const getParsedTemplateFunction = (template: string, additionalContext: any = {}): (resource: any) => any => {
  compileTemplate(template);
  return getTemplateFunction(template, additionalContext);
};
