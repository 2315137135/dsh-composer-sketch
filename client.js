window.__ModuleLoader__.load({
  id: '@local/dsh-composer-sketch',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'composer-sketch';
    const TAB_ID = '@local/dsh-composer-sketch';
    const TAB_KIND = 'sketch';
    const BUTTON_SLOT = 'conversation.input.left';
    const BODY_SLOT = 'sidebar.right.pane.tab';
    const BOARD_CHUNK = './client.whiteboard.js';
    const BOARD_ASSETS = '/composer-sketch/';

    const EN = {
      'button.label': 'Whiteboard',
      'button.hint': 'Open the whiteboard in the right sidebar',
      'tab.title': 'Whiteboard',
      'guide.title': 'Whiteboard',
      'guide.description': 'Sketch shapes and frames, then attach the image to the composer',
      'action.insert': 'Attach',
      'board.loading': 'Loading the whiteboard…',
      'hint.empty': 'Empty board',
      'hint.items': '{count} elements',
      'error.empty': 'Nothing has been drawn yet.',
      'error.unavailable': 'The composer cannot accept attachments right now.',
      'error.busy': 'The input is busy; try again in a moment.',
      'error.session': 'This session is not available.',
      'error.load': 'The whiteboard failed to load: {detail}',
      'error.scene': 'The image was attached, but the scene file was not: {detail}',
      'toggle.scene': 'Scene file',
      'toggle.scene.title': 'Also attach a .excalidraw file with every element id, position and size, so the board can be cropped or edited precisely.',
    };

    const ZH = {
      'button.label': '白板',
      'button.hint': '在右侧栏打开白板',
      'tab.title': '白板',
      'guide.title': '白板',
      'guide.description': '画形状与画框，把结果作为图片附件插入输入框',
      'action.insert': '插入',
      'board.loading': '正在加载白板…',
      'hint.empty': '画板为空',
      'hint.items': '{count} 个元素',
      'error.empty': '画板上还没有内容。',
      'error.unavailable': '输入框当前不能接收附件。',
      'error.busy': '输入框正忙，请稍后再试。',
      'error.session': '当前会话不可用。',
      'error.load': '白板加载失败：{detail}',
      'error.scene': '图片已插入，但场景文件附加失败：{detail}',
      'toggle.scene': '附带场景',
      'toggle.scene.title': '同时附加同名 .excalidraw 文件，含每个元素的 id、坐标与尺寸，便于精确裁剪或再次编辑。',
    };

    const CSS = `
.csk-btn{appearance:none;border:0;background:transparent;width:28px;height:28px;border-radius:999px;display:grid;place-items:center;padding:0;flex:none;cursor:pointer;color:var(--dsw-alias-label-secondary,#6b7280);transition:background-color .1s,color .1s}
.csk-btn:hover:not(:disabled){background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,.14));color:var(--dsw-alias-label-primary,#111)}
.csk-btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#4c6ef5);outline-offset:2px}
.csk-btn:disabled{opacity:.5;cursor:default}
.csk-tab{display:flex;flex-direction:column;height:100%;min-height:0;background:var(--dsw-alias-bg-layer-1,#fff);color:var(--dsw-alias-label-primary,#111)}
.csk-tab__canvas{position:relative;flex:1 1 auto;min-height:0}
.csk-tab__canvas>.csw-canvas{position:absolute;inset:0}
.csk-tab__canvas .excalidraw{--right-sidebar-width:clamp(220px,42%,302px) !important}
.csk-tab__state{position:absolute;inset:0;display:grid;place-items:center;padding:16px;text-align:center;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary,#6b7280)}
.csk-tab__bar{display:flex;align-items:center;gap:8px;padding:8px 10px;border-top:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,.2))}
.csk-hint{font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary,#6b7280)}
.csk-grow{flex:1 1 auto}
.csk-check{display:inline-flex;align-items:center;gap:6px;font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary,#6b7280);cursor:pointer;user-select:none;white-space:nowrap}
.csk-check input{margin:0;width:13px;height:13px;accent-color:var(--dsw-alias-brand-primary,#4c6ef5);cursor:pointer}
.csk-primary{appearance:none;height:28px;padding:0 14px;border-radius:7px;border:0;background:var(--dsw-alias-brand-primary,#4c6ef5);color:#fff;font-size:12px;line-height:18px;cursor:pointer}
.csk-primary:hover:not(:disabled){filter:brightness(1.07)}
.csk-primary:disabled{opacity:.5;cursor:default}
.csk-primary:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#4c6ef5);outline-offset:2px}
.csk-error{margin:0;padding:0 10px 8px;font-size:11px;line-height:16px;color:var(--dsw-alias-state-error-primary,#d33)}
`;

    function translate(locale) {
      if (locale && typeof locale.bind === 'function') return locale.bind(NS);
      return (key, params) => format(EN[key] ?? key, params);
    }

    function format(text, params) {
      if (text === undefined || text === null) return '';
      if (params === undefined) return text;
      return String(text).replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match));
    }

    function boardIcon() {
      return h(
        'svg',
        {
          width: 16,
          height: 16,
          viewBox: '0 0 16 16',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.4,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
        },
        h('rect', { x: 1.6, y: 2.8, width: 8, height: 6.4, rx: 1.4 }),
        h('rect', { x: 6.4, y: 6.8, width: 8, height: 6.4, rx: 1.4 }),
        h('path', { d: 'M3.4 5.2h3.8M9.4 9.6h2.8' }),
      );
    }

    function imageFileName(prefix, date = new Date()) {
      const pad = (value) => String(value).padStart(2, '0');
      const stamp = [
        date.getFullYear(),
        pad(date.getMonth() + 1),
        pad(date.getDate()),
        pad(date.getHours()),
        pad(date.getMinutes()),
        pad(date.getSeconds()),
      ].join('');
      return `${prefix}-${stamp}.png`;
    }

    function useDarkTheme() {
      const read = () => typeof document !== 'undefined' && document.body !== null && document.body.hasAttribute('data-ds-dark-theme');
      const [dark, setDark] = React.useState(read);
      React.useEffect(() => {
        if (typeof MutationObserver !== 'function' || document.body === null) return undefined;
        const observer = new MutationObserver(() => setDark(read()));
        observer.observe(document.body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] });
        return () => observer.disconnect();
      }, []);
      return dark;
    }

    function useTranslate(ctx) {
      const locale = ctx.get('locale');
      return React.useMemo(() => translate(locale), [locale]);
    }

    const EXCALIDRAW_LANGUAGES = { zh: 'zh-CN', 'zh-cn': 'zh-CN', 'zh-tw': 'zh-TW' };

    function excalidrawLangCode(ctx) {
      const locale = ctx.get('locale');
      const snapshot = locale && typeof locale.getSnapshot === 'function' ? locale.getSnapshot() : undefined;
      const id = snapshot && typeof snapshot.active === 'string' ? snapshot.active : '';
      if (id === '') return 'en';
      return EXCALIDRAW_LANGUAGES[id.toLowerCase()] ?? id;
    }

    function useLangCode(ctx) {
      const [code, setCode] = React.useState(() => excalidrawLangCode(ctx));
      React.useEffect(() => {
        const locale = ctx.get('locale');
        if (!locale || typeof locale.subscribe !== 'function') return undefined;
        const update = () => setCode(excalidrawLangCode(ctx));
        update();
        return locale.subscribe(update);
      }, [ctx]);
      return code;
    }

    function useComposerState(props) {
      const { inputActions, useInput, useSession, useAccess } = props;
      const phase = useInput((state) => state.phase);
      const subagent = useSession((state) => state.subagent);
      const uploadDenied = useAccess('fileUploads/upload') === false;
      const machineBusy = phase === 'adjudicating' || phase === 'submitting' || phase === 'sending';
      return { subagent, disabled: uploadDenied || machineBusy || inputActions === undefined };
    }

    function useAttach(ctx, props, subagent, t) {
      const { sessionId, inputActions } = props;
      return React.useCallback(
        (files, uploadImages) => {
          const conversation = ctx.get('conversation');
          if (!conversation || typeof conversation.createDrafts !== 'function') return t('error.unavailable');
          const sessions = ctx.get('sessions');
          if (sessions && typeof sessions.binding === 'function' && sessions.binding(sessionId) === undefined) {
            return t('error.session');
          }
          const asImages = uploadImages === undefined ? subagent === null || subagent === undefined : uploadImages;
          let drafts = [];
          try {
            drafts = conversation.createDrafts(sessionId, files, asImages);
            const accepted = inputActions.addAttachments(drafts.map((draft) => draft.id));
            if (accepted !== true) {
              if (typeof conversation.releaseDraftAttachments === 'function') conversation.releaseDraftAttachments(drafts);
              return t('error.busy');
            }
            return null;
          } catch (cause) {
            if (typeof conversation.releaseDraftAttachments === 'function') conversation.releaseDraftAttachments(drafts);
            return cause instanceof Error ? cause.message : String(cause);
          }
        },
        [ctx, sessionId, subagent, inputActions, t],
      );
    }

    let boardChunkPromise = null;
    let includeScene = false;

    /**
     * A cold start activates this module (`immediately: true`) before the right sidebar and the slots
     * service publish their registries, so a single lookup in `apply` returns undefined and nothing
     * gets registered.
     */
    function afterAvailable(ctx, key, callback, timeout = 30000) {
      const deadline = performance.now() + timeout;
      let timer = 0;
      let stopped = false;
      const tick = () => {
        timer = 0;
        if (stopped) return;
        const value = ctx.get(key);
        if (value !== undefined && value !== null) {
          stopped = true;
          callback(value);
          return;
        }
        if (performance.now() > deadline) {
          stopped = true;
          return;
        }
        timer = setTimeout(tick, 100);
      };
      tick();
      return () => {
        stopped = true;
        if (timer !== 0) clearTimeout(timer);
      };
    }

    function loadBoardChunk() {
      if (boardChunkPromise === null) {
        boardChunkPromise = require
          .async(BOARD_CHUNK)
          .then((chunk) => {
            chunk.configure({ assetBase: BOARD_ASSETS });
            return chunk;
          })
          .catch((error) => {
            boardChunkPromise = null;
            throw error;
          });
      }
      return boardChunkPromise;
    }

    /* The tab body unmounts when the tab closes; the drawing survives in this per-session stash. */
    const scenes = new Map();

    /**
     * Excalidraw caches `width`/`height`/`offsetLeft`/`offsetTop` from its container rect and
     * re-measures only when that rect resizes. Zoom buttons centre on `width/2` (the offset cancels
     * out), so a stale size shifts the zoom centre, while a stale offset puts every stroke off. The
     * docked column can move without a size change, so all four stay in step with the host.
     */
    function useViewportSync(hostRef, apiRef, active) {
      React.useEffect(() => {
        if (!active) return undefined;
        const sync = () => {
          const host = hostRef.current;
          const api = apiRef.current;
          if (!host || !api) return;
          const rect = host.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return;
          const state = api.getAppState();
          const stale =
            Math.abs(state.offsetLeft - rect.left) >= 0.5 ||
            Math.abs(state.offsetTop - rect.top) >= 0.5 ||
            Math.abs(state.width - rect.width) >= 0.5 ||
            Math.abs(state.height - rect.height) >= 0.5;
          if (stale) {
            api.updateScene({
              appState: { offsetLeft: rect.left, offsetTop: rect.top, width: rect.width, height: rect.height },
            });
          }
        };
        sync();
        const timer = setInterval(sync, 250);
        const observer = new ResizeObserver(sync);
        if (hostRef.current) observer.observe(hostRef.current);
        window.addEventListener('resize', sync);
        return () => {
          clearInterval(timer);
          observer.disconnect();
          window.removeEventListener('resize', sync);
        };
      }, [active, hostRef, apiRef]);
    }

    function BoardTab(props) {
      const { sessionId } = props;
      const ctx = props.ctx;
      const t = useTranslate(ctx);
      const dark = useDarkTheme();
      const langCode = useLangCode(ctx);
      const state = useComposerState(props);
      const attach = useAttach(ctx, props, state.subagent, t);
      const apiRef = React.useRef(null);
      const hostRef = React.useRef(null);
      const initialData = React.useRef(scenes.get(sessionId));
      const [chunk, setChunk] = React.useState(null);
      const [loadError, setLoadError] = React.useState(null);
      const [drawn, setDrawn] = React.useState(0);
      const [withScene, setWithScene] = React.useState(includeScene);
      const [pending, setPending] = React.useState(false);
      const [error, setError] = React.useState(null);

      useViewportSync(hostRef, apiRef, chunk !== null);

      React.useEffect(() => {
        let cancelled = false;
        loadBoardChunk().then(
          (loaded) => {
            if (!cancelled) setChunk(loaded);
          },
          (cause) => {
            if (!cancelled) setLoadError(cause instanceof Error ? cause.message : String(cause));
          },
        );
        return () => {
          cancelled = true;
        };
      }, []);

      React.useEffect(
        () => () => {
          const api = apiRef.current;
          if (!api) return;
          const elements = api.getSceneElements();
          if (Array.isArray(elements) && elements.length > 0) scenes.set(sessionId, { elements, files: api.getFiles() });
          else scenes.delete(sessionId);
        },
        [sessionId],
      );

      const insert = async () => {
        if (!chunk || pending) return;
        setPending(true);
        setError(null);
        try {
          const captured = await chunk.capture(apiRef.current);
          if (captured.empty || !captured.blob) {
            setError(t('error.empty'));
            return;
          }
          const name = imageFileName('board');
          const failure = attach([new File([captured.blob], name, { type: 'image/png' })]);
          if (failure) {
            setError(failure);
            return;
          }
          if (withScene && typeof captured.scene === 'string' && captured.scene !== '') {
            // Plain-file path: the scene must not be sniffed as an image.
            const sceneFailure = attach([new File([captured.scene], name.replace(/\.png$/i, '.excalidraw'), { type: 'application/json' })], false);
            if (sceneFailure) setError(format(t('error.scene'), { detail: sceneFailure }));
          }
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : String(cause));
        } finally {
          setPending(false);
        }
      };

      return h(
        'div',
        { className: 'csk-tab' },
        h(
          'div',
          { className: 'csk-tab__canvas', ref: hostRef },
          chunk === null
            ? h('div', { className: 'csk-tab__state' }, loadError === null ? t('board.loading') : format(t('error.load'), { detail: loadError }))
            : h(chunk.WhiteboardView, {
                theme: dark ? 'dark' : 'light',
                langCode,
                apiRef,
                initialData: initialData.current,
                onSceneChange: setDrawn,
              }),
        ),
        error === null ? null : h('p', { className: 'csk-error', role: 'alert' }, error),
        h(
          'div',
          { className: 'csk-tab__bar' },
          h('span', { className: 'csk-hint' }, drawn === 0 ? t('hint.empty') : format(t('hint.items'), { count: drawn })),
          h('span', { className: 'csk-grow' }),
          h(
            'label',
            { className: 'csk-check', title: t('toggle.scene.title') },
            h('input', {
              type: 'checkbox',
              checked: withScene,
              onChange: (event) => {
                includeScene = event.target.checked;
                setWithScene(includeScene);
              },
            }),
            h('span', null, t('toggle.scene')),
          ),
          h(
            'button',
            { type: 'button', className: 'csk-primary', disabled: chunk === null || drawn === 0 || pending || state.disabled, onClick: insert },
            t('action.insert'),
          ),
        ),
      );
    }

    function ComposerButton(props) {
      const ctx = props.ctx;
      const t = useTranslate(ctx);
      const state = useComposerState(props);
      const open = () => {
        const right = ctx.get('sidebarRight');
        if (right && typeof right.openTab === 'function') right.openTab(TAB_KIND);
      };
      return h(
        'button',
        {
          type: 'button',
          className: 'csk-btn',
          title: t('button.hint'),
          'aria-label': t('button.label'),
          disabled: state.disabled,
          onMouseDown: (event) => event.preventDefault(),
          onClick: open,
        },
        boardIcon(),
      );
    }

    const inject = ['slots'];

    function mountSeats(ctx, slots, t) {
      const offBody = slots.inject(BODY_SLOT, () =>
        slots.register({ name: BODY_SLOT, key: TAB_ID }, (props) => h(BoardTab, { ...props, ctx })),
      );
      const offButton = slots.inject(BUTTON_SLOT, () =>
        slots.register(
          { name: BUTTON_SLOT, id: NS, order: 0, label: () => t('button.label'), locale: NS },
          (props) => h(ComposerButton, { ...props, ctx }),
        ),
      );
      return () => {
        offButton();
        offBody();
      };
    }

    function waitFor(ctx, key, label, install) {
      ctx.effect(() => {
        let dispose = null;
        const stop = afterAvailable(ctx, key, (value) => {
          dispose = install(value);
        });
        return () => {
          stop();
          if (typeof dispose === 'function') dispose();
        };
      }, label);
    }

    function apply(ctx) {
      const t = (key, params) => translate(ctx.get('locale'))(key, params);

      ctx.effect(() => {
        const style = document.createElement('style');
        style.setAttribute('data-dsh-composer-sketch', '');
        style.textContent = CSS;
        document.head.appendChild(style);
        return () => style.remove();
      }, 'composer-sketch: styles');

      waitFor(ctx, 'locale', 'composer-sketch: dictionaries', (locale) => {
        if (typeof locale.register !== 'function') return null;
        const offInline = locale.register(NS, { en: EN, 'zh-CN': ZH });
        const offAlias = locale.register(NS, 'zh', ZH);
        return () => {
          offInline();
          offAlias();
        };
      });

      waitFor(ctx, 'sidebarRightTabs', 'composer-sketch: sidebar tab type', (tabs) => {
        if (typeof tabs.register !== 'function') return null;
        return tabs.register({
          id: TAB_ID,
          kind: TAB_KIND,
          title: () => t('tab.title'),
          guide: [{ id: `${TAB_ID}/board`, order: 40, title: () => t('guide.title'), description: () => t('guide.description') }],
        });
      });

      waitFor(ctx, 'slots', 'composer-sketch: seats', (slots) => mountSeats(ctx, slots, t));
    }

    return { inject, apply };
  },
});
