import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../script.js', import.meta.url), 'utf8');

function element() {
  const classes = new Set();
  return {
    events: {}, attributes: {}, dataset: {}, hidden: false, textContent: '',
    classList: {
      add: (...names) => names.forEach(name => classes.add(name)),
      remove: name => classes.delete(name),
      contains: name => classes.has(name),
      toggle(name, enabled) { enabled ? classes.add(name) : classes.delete(name); },
    },
    addEventListener(name, handler) { this.events[name] = handler; },
    setAttribute(name, value) { this.attributes[name] = value; },
    removeAttribute(name) { delete this.attributes[name]; },
    getAttribute(name) { return this.attributes[name] ?? null; },
  };
}

function fixture({ reduced = false, withForm = false, withCalculator = false, fetchResponse } = {}) {
  const preference = { ...element(), matches: reduced };
  const toggle = element();
  const label = element();
  const icon = element();
  toggle.querySelector = selector => selector === 'span' ? label : icon;
  const sources = [element(), element(), element()];
  const demo = element();
  demo.querySelectorAll = () => sources;
  const timers = new Set();
  const button = { ...element(), disabled: false, textContent: 'Send brief' };
  const form = element();
  form.valid = true;
  form.resets = 0;
  form.getAttribute = () => 'https://formspree.io/f/xzdoqpke';
  form.reportValidity = () => form.valid;
  form.querySelector = () => button;
  form.appendChild = child => { form.status = child; };
  form.reset = () => { form.resets += 1; };
  const hours = { ...element(), value: '8', min: '1', max: '40', style: { setProperty() {} } };
  const rate = { ...element(), value: '35', min: '10', max: '250' };
  rate.checkValidity = () => Number(rate.value) >= 10 && Number(rate.value) <= 250;
  const annual = element();
  const yearlyHours = element();
  const calculatorFields = {
    '[data-roi-hours]': hours, '[data-roi-rate]': rate,
    '[data-roi-annual]': annual, '[data-roi-year-hours]': yearlyHours,
    '[data-roi-hours-value]': element(), '[data-roi-summary]': element(),
  };
  const calculator = { querySelector: selector => calculatorFields[selector] };
  const document = {
    ...element(), hidden: false,
    querySelector(selector) {
      if (selector === '[data-workflow-demo]') return demo;
      if (selector === '[data-motion-toggle]') return toggle;
      if (selector === '[data-roi-calculator]' && withCalculator) return calculator;
      return null;
    },
    querySelectorAll: selector => selector === '.task-form' && withForm ? [form] : [],
    createElement: () => element(),
  };
  let requests = 0;
  const fetch = async () => { requests += 1; return fetchResponse ? fetchResponse() : { ok: true }; };
  const window = { ...element(), scrollY: 0, matchMedia: () => preference, fetch };
  vm.runInNewContext(source, {
    window, document, fetch, Intl,
    FormData: class {},
    setInterval: callback => { timers.add(callback); return callback; },
    clearInterval: timer => timers.delete(timer),
  });
  return { preference, toggle, demo, timers, document, form, button, hours, rate, annual, yearlyHours, requests: () => requests };
}

test('reduced motion starts with a static visible workflow and no timer', () => {
  const app = fixture({ reduced: true });
  assert.equal(app.timers.size, 0);
  assert.equal(app.demo.classList.contains('is-playing'), false);
  assert.equal(app.toggle.hidden, true);
});

test('pause and resume control both the timer and accessible state', () => {
  const app = fixture();
  assert.equal(app.timers.size, 1);
  app.toggle.events.click();
  assert.equal(app.timers.size, 0);
  assert.equal(app.toggle.attributes['aria-pressed'], 'true');
  assert.equal(app.toggle.attributes['aria-label'], 'Play workflow animation');
  app.toggle.events.click();
  assert.equal(app.timers.size, 1);
  assert.equal(app.toggle.attributes['aria-pressed'], 'false');
});

test('hidden tabs stop motion and resume only when visible', () => {
  const app = fixture();
  app.document.hidden = true;
  app.document.events.visibilitychange();
  assert.equal(app.timers.size, 0);
  app.document.hidden = false;
  app.document.events.visibilitychange();
  assert.equal(app.timers.size, 1);
});

test('changing the system motion preference stops a running demo', () => {
  const app = fixture();
  app.preference.matches = true;
  app.preference.events.change();
  assert.equal(app.timers.size, 0);
  assert.equal(app.toggle.hidden, true);
});

test('invalid forms make no request', async () => {
  const app = fixture({ withForm: true });
  app.form.valid = false;
  await app.form.events.submit({ preventDefault() {} });
  assert.equal(app.requests(), 0);
  assert.equal(app.form.resets, 0);
});

test('successful submission resets the form and restores its button', async () => {
  const app = fixture({ withForm: true });
  await app.form.events.submit({ preventDefault() {} });
  assert.equal(app.requests(), 1);
  assert.equal(app.form.resets, 1);
  assert.equal(app.form.status.dataset.state, 'success');
  assert.equal(app.button.disabled, false);
  assert.equal(app.button.textContent, 'Send brief');
});

test('failed submission preserves the brief and offers a retry', async () => {
  const app = fixture({ withForm: true, fetchResponse: () => ({ ok: false }) });
  await app.form.events.submit({ preventDefault() {} });
  assert.equal(app.form.resets, 0);
  assert.equal(app.form.status.dataset.state, 'error');
  assert.match(app.form.status.textContent, /Your text is still here/);
  assert.equal(app.button.disabled, false);
});

test('a second submission is ignored while the first is pending', async () => {
  let complete;
  const response = new Promise(resolve => { complete = resolve; });
  const app = fixture({ withForm: true, fetchResponse: () => response });
  const first = app.form.events.submit({ preventDefault() {} });
  await app.form.events.submit({ preventDefault() {} });
  assert.equal(app.requests(), 1);
  assert.equal(app.button.disabled, true);
  complete({ ok: true });
  await first;
  assert.equal(app.form.resets, 1);
});

test('manual time calculator shows the annual cost and hours, not net savings', () => {
  const app = fixture({ withCalculator: true });
  assert.equal(app.annual.textContent, '$14,560');
  assert.equal(app.yearlyHours.textContent, '416');
});

test('calculator recomputes when either input changes', () => {
  const app = fixture({ withCalculator: true });
  app.hours.value = '12';
  app.hours.events.input();
  app.rate.value = '40';
  app.rate.events.input();
  assert.equal(app.annual.textContent, '$24,960');
  assert.equal(app.yearlyHours.textContent, '624');
});

test('calculator asks for a rate instead of showing a misleading zero', () => {
  const app = fixture({ withCalculator: true });
  app.rate.value = '';
  app.rate.events.input();
  assert.equal(app.annual.textContent, 'Enter a rate');
});

test('calculator does not display an out-of-range cost', () => {
  const app = fixture({ withCalculator: true });
  app.rate.value = '9999';
  app.rate.events.input();
  assert.equal(app.annual.textContent, 'Enter a rate');
});
