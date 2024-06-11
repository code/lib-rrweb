import * as fs from 'fs';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import * as path from 'path';
import { vi } from 'vitest';

import dialogPlaybackEvents, {
  closedFullSnapshotTime,
  showIncrementalAttributeTime,
  closeIncrementalAttributeTime,
  showModalIncrementalAttributeTime,
  showFullSnapshotTime,
  showModalFullSnapshotTime,
  showModalIncrementalAddTime,
  switchBetweenShowModalAndShowIncrementalAttributeTime,
  switchBetweenShowAndShowModalIncrementalAttributeTime,
} from '../events/dialog-playback';
import {
  fakeGoto,
  getServerURL,
  hideMouseAnimation,
  ISuite,
  launchPuppeteer,
  startServer,
  waitForRAF,
} from '../utils';

expect.extend({ toMatchImageSnapshot });

// TODO: test the following:
// == on record ==
// - dialog open (standard) full snapshot
// √ dialog open (standard) incremental (virtual dom)
// √ dialog open (standard) incremental (non virtual dom)
// √ dialog open (showModal) full snapshot
// √ dialog open (showModal) incremental (virtual dom)
// √ dialog open (showModal) incremental (non virtual dom)
// √ append dialog open (showModal) incremental (virtual dom)
// √ append dialog open (showModal) incremental (non virtual dom)
// √ dialog close (rrdom)
// √ dialog close (non virtual dom)
// √ dialog open and close (switching from modal to non modal)
// √ dialog open and close (switching from non modal to modal)
// - multiple dialogs open, recording order
// == on playback ==
// - dialog open
// - dialog close
// - dialog open and close (switching from modal to non modal and vise versa)
// - multiple dialogs open, playback order
// == on rrdom ==
// - that the modal modes are recorded...

describe('dialog', () => {
  vi.setConfig({ testTimeout: 100_000 });
  let code: ISuite['code'];
  let page: ISuite['page'];
  let browser: ISuite['browser'];
  let server: ISuite['server'];
  let serverURL: ISuite['serverURL'];

  beforeAll(async () => {
    server = await startServer();
    serverURL = getServerURL(server);
    browser = await launchPuppeteer();

    const bundlePath = path.resolve(__dirname, '../../dist/rrweb.umd.cjs');
    code = fs.readFileSync(bundlePath, 'utf8');
  });

  afterEach(async () => {
    await page.close();
  });

  afterAll(async () => {
    await server.close();
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
    page.on('console', (msg) => {
      console.log(msg.text());
    });

    await fakeGoto(page, `${serverURL}/html/dialog.html`);
    await page.evaluate(code);
    await waitForRAF(page);
    await hideMouseAnimation(page);
  });

  it('closed dialogs show nothing', async () => {
    await page.evaluate(`let events = ${JSON.stringify(dialogPlaybackEvents)}`);
    await page.evaluate(`
      const { Replayer } = rrweb;
      window.replayer = new Replayer(events);
    `);
    await waitForRAF(page);

    const frameImage = await page!.screenshot();
    expect(frameImage).toMatchImageSnapshot({
      failureThreshold: 0.05,
      failureThresholdType: 'percent',
    });
  });

  it('show show the dialog when open attribute gets added', async () => {
    await page.evaluate(`let events = ${JSON.stringify(dialogPlaybackEvents)}`);
    await page.evaluate(`
      const { Replayer } = rrweb;
      window.replayer = new Replayer(events);
      window.replayer.pause(${showIncrementalAttributeTime});
    `);
    await waitForRAF(page);

    const frameImage = await page!.screenshot();
    expect(frameImage).toMatchImageSnapshot({
      failureThreshold: 0.05,
      failureThresholdType: 'percent',
    });
  });

  it('show show the dialog when open attribute gets added (non virtual)', async () => {
    await page.evaluate(`let events = ${JSON.stringify(dialogPlaybackEvents)}`);
    await page.evaluate(`
      const { Replayer } = rrweb;
      window.replayer = new Replayer(events, { useVirtualDom: false });
      window.replayer.pause(${showIncrementalAttributeTime});
    `);
    await waitForRAF(page);

    const frameImage = await page!.screenshot();
    expect(frameImage).toMatchImageSnapshot({
      failureThreshold: 0.05,
      failureThresholdType: 'percent',
    });
  });

  it('should close dialog again when open attribute gets removed', async () => {
    await page.evaluate(`let events = ${JSON.stringify(dialogPlaybackEvents)}`);
    await page.evaluate(`
      const { Replayer } = rrweb;
      window.replayer = new Replayer(events);
      window.replayer.pause(${closeIncrementalAttributeTime});
    `);
    await waitForRAF(page);

    const frameImage = await page!.screenshot();
    expect(frameImage).toMatchImageSnapshot({
      failureThreshold: 0.05,
      failureThresholdType: 'percent',
    });
  });

  it('should close dialog again when open attribute gets removed (without virtual dom)', async () => {
    await page.evaluate(`let events = ${JSON.stringify(dialogPlaybackEvents)}`);
    await page.evaluate(`
      const { Replayer } = rrweb;
      window.replayer = new Replayer(events, { useVirtualDom: false });
      window.replayer.pause(${closeIncrementalAttributeTime});
    `);
    await waitForRAF(page);

    const frameImage = await page!.screenshot();
    expect(frameImage).toMatchImageSnapshot({
      failureThreshold: 0.05,
      failureThresholdType: 'percent',
    });
  });

  it('should open dialog with showModal', async () => {
    await page.evaluate(`let events = ${JSON.stringify(dialogPlaybackEvents)}`);
    await page.evaluate(`
      const { Replayer } = rrweb;
      window.replayer = new Replayer(events);
      window.replayer.pause(${showModalIncrementalAttributeTime});
    `);
    await waitForRAF(page);

    const frameImage = await page!.screenshot();
    expect(frameImage).toMatchImageSnapshot({
      failureThreshold: 0.05,
      failureThresholdType: 'percent',
    });
  });

  it('should open dialog with showModal (without virtual dom)', async () => {
    await page.evaluate(`let events = ${JSON.stringify(dialogPlaybackEvents)}`);
    await page.evaluate(`
      const { Replayer } = rrweb;
      window.replayer = new Replayer(events, { useVirtualDom: false });
      window.replayer.pause(${showModalIncrementalAttributeTime});
    `);
    await waitForRAF(page);

    const frameImage = await page!.screenshot();
    expect(frameImage).toMatchImageSnapshot({
      failureThreshold: 0.05,
      failureThresholdType: 'percent',
    });
  });

  it('should switch between showModal and show', async () => {
    await page.evaluate(`let events = ${JSON.stringify(dialogPlaybackEvents)}`);
    await page.evaluate(`
      const { Replayer } = rrweb;
      window.replayer = new Replayer(events);
      window.replayer.pause(${switchBetweenShowModalAndShowIncrementalAttributeTime});
    `);
    await waitForRAF(page);

    const frameImage = await page!.screenshot();
    expect(frameImage).toMatchImageSnapshot({
      failureThreshold: 0.05,
      failureThresholdType: 'percent',
    });
  });

  it('should switch between showModal and show (without virtual dom)', async () => {
    await page.evaluate(`let events = ${JSON.stringify(dialogPlaybackEvents)}`);
    await page.evaluate(`
      const { Replayer } = rrweb;
      window.replayer = new Replayer(events, { useVirtualDom: false });
      window.replayer.pause(${switchBetweenShowModalAndShowIncrementalAttributeTime});
    `);
    await waitForRAF(page);

    const frameImage = await page!.screenshot();
    expect(frameImage).toMatchImageSnapshot({
      failureThreshold: 0.05,
      failureThresholdType: 'percent',
    });
  });

  it('should switch between show and showModal', async () => {
    await page.evaluate(`let events = ${JSON.stringify(dialogPlaybackEvents)}`);
    await page.evaluate(`
      const { Replayer } = rrweb;
      window.replayer = new Replayer(events);
      window.replayer.pause(${switchBetweenShowAndShowModalIncrementalAttributeTime});
    `);
    await waitForRAF(page);

    const frameImage = await page!.screenshot();
    expect(frameImage).toMatchImageSnapshot({
      failureThreshold: 0.05,
      failureThresholdType: 'percent',
    });
  });

  it('should switch between show and showModal (without virtual dom)', async () => {
    await page.evaluate(`let events = ${JSON.stringify(dialogPlaybackEvents)}`);
    await page.evaluate(`
      const { Replayer } = rrweb;
      window.replayer = new Replayer(events, { useVirtualDom: false });
      window.replayer.pause(${switchBetweenShowAndShowModalIncrementalAttributeTime});
    `);
    await waitForRAF(page);

    const frameImage = await page!.screenshot();
    expect(frameImage).toMatchImageSnapshot({
      failureThreshold: 0.05,
      failureThresholdType: 'percent',
    });
  });

  it('should open dialog with show in full snapshot', async () => {
    await page.evaluate(`let events = ${JSON.stringify(dialogPlaybackEvents)}`);
    await page.evaluate(`
      const { Replayer } = rrweb;
      window.replayer = new Replayer(events);
      window.replayer.pause(${showFullSnapshotTime});
    `);
    await waitForRAF(page);

    const frameImage = await page!.screenshot();
    expect(frameImage).toMatchImageSnapshot({
      failureThreshold: 0.05,
      failureThresholdType: 'percent',
    });
  });

  it('should open dialog with show in full snapshot (without virtual dom)', async () => {
    await page.evaluate(`let events = ${JSON.stringify(dialogPlaybackEvents)}`);
    await page.evaluate(`
      const { Replayer } = rrweb;
      window.replayer = new Replayer(events, { useVirtualDom: false });
      window.replayer.pause(${showFullSnapshotTime});
    `);
    await waitForRAF(page);

    const frameImage = await page!.screenshot();
    expect(frameImage).toMatchImageSnapshot({
      failureThreshold: 0.05,
      failureThresholdType: 'percent',
    });
  });

  it('should open dialog with showModal in full snapshot', async () => {
    await page.evaluate(`let events = ${JSON.stringify(dialogPlaybackEvents)}`);
    await page.evaluate(`
      const { Replayer } = rrweb;
      window.replayer = new Replayer(events);
      window.replayer.pause(${showModalFullSnapshotTime});
    `);
    await waitForRAF(page);

    const frameImage = await page!.screenshot();
    expect(frameImage).toMatchImageSnapshot({
      failureThreshold: 0.05,
      failureThresholdType: 'percent',
    });
  });

  it('should open dialog with showModal in full snapshot (without virtual dom)', async () => {
    await page.evaluate(`let events = ${JSON.stringify(dialogPlaybackEvents)}`);
    try {
      await page.evaluate(`
        const { Replayer } = rrweb;
        window.replayer = new Replayer(events, { useVirtualDom: false });
        window.replayer.pause(${showModalFullSnapshotTime});
      `);
    } catch (e) {
      console.log('error');
    }
    await waitForRAF(page);

    const frameImage = await page!.screenshot();
    expect(frameImage).toMatchImageSnapshot({
      failureThreshold: 0.05,
      failureThresholdType: 'percent',
    });
  });

  it('should add an opened dialog with showModal in incremental snapshot', async () => {
    await page.evaluate(`let events = ${JSON.stringify(dialogPlaybackEvents)}`);
    await page.evaluate(`
      const { Replayer } = rrweb;
      window.replayer = new Replayer(events);
      window.replayer.pause(${showModalIncrementalAddTime});
    `);
    await waitForRAF(page);

    const frameImage = await page!.screenshot();
    expect(frameImage).toMatchImageSnapshot({
      failureThreshold: 0.05,
      failureThresholdType: 'percent',
    });
  });

  it('should add an opened dialog with showModal in incremental snapshot (without virtual dom)', async () => {
    await page.evaluate(`let events = ${JSON.stringify(dialogPlaybackEvents)}`);
    try {
      await page.evaluate(`
        const { Replayer } = rrweb;
        window.replayer = new Replayer(events, { useVirtualDom: false });
        window.replayer.pause(${showModalIncrementalAddTime});
      `);
    } catch (e) {
      console.log('error');
    }
    await waitForRAF(page);

    const frameImage = await page!.screenshot();
    expect(frameImage).toMatchImageSnapshot({
      failureThreshold: 0.05,
      failureThresholdType: 'percent',
    });
  });
});