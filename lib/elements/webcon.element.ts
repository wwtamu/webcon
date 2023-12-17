import { WebconElementProps } from './webcon.decorator';

export class WebconElement extends HTMLElement implements WebconElementProps {

  constructor() {
    super();
  }

  connectedCallback(): void {

  }

  disconnectedCallback(): void {

  }

  beforeMount(): void {

  }

  afterMount(): void {

  }

  beforeUnmount(): void {

  }

  afterUnmount(): void {

  }

  get prerender(): string {
    return this.getAttribute('prerender');
  }

  set prerender(prerender: string) {
    this.setAttribute('prerender', prerender);
  }

  get shadow(): string {
    return this.getAttribute('shadow');
  }

  set shadow(shadow: string) {
    this.setAttribute('shadow', shadow);
  }

  get head(): string {
    return this.getAttribute('head');
  }

  set head(head: string) {
    this.setAttribute('head', head);
  }

  get action(): string {
    return this.getAttribute('action');
  }

  set action(action: string) {
    this.setAttribute('action', action);
  }

  get method(): string {
    return this.getAttribute('method');
  }

  set method(method: string) {
    this.setAttribute('method', method);
  }

  get event(): string {
    return this.getAttribute('event');
  }

  set event(event: string) {
    this.setAttribute('event', event);
  }

  get language(): string {
    return this.getAttribute('language');
  }

  set language(language: string) {
    this.setAttribute('language', language);
  }

}
