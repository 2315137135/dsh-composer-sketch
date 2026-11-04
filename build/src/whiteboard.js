import excalidrawCss from '@excalidraw/excalidraw/index.css'
import { Excalidraw, exportToBlob, serializeAsJSON } from '@excalidraw/excalidraw'
import * as React from 'react'

let stylesInjected = false

const countOf = (elements) => (Array.isArray(elements) ? elements.length : 0)

const isEditableTarget = (target) =>
  target instanceof HTMLElement && (target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')

const DELETE_KEY_EVENT = { key: 'Delete', code: 'Delete', keyCode: 46, which: 46, bubbles: true, cancelable: true }

export function configure(options) {
  const assetBase = typeof options.assetBase === 'string' ? options.assetBase : ''
  if (assetBase !== '') window.EXCALIDRAW_ASSET_PATH = assetBase
  if (!stylesInjected) {
    const style = document.createElement('style')
    style.setAttribute('data-dsh-composer-sketch', 'whiteboard')
    /* The injected sheet has no package URL, so its relative font URLs are rebased onto the Host route. */
    style.textContent = excalidrawCss.replace(/url\((['"]?)\.\//g, (match, quote) => `url(${quote}${assetBase}`)
    document.head.appendChild(style)
    stylesInjected = true
  }
}

export function WhiteboardView(props) {
  const { theme, langCode, apiRef, onSceneChange, initialData } = props
  const bindApi = React.useCallback(
    (api) => {
      if (apiRef) apiRef.current = api
      onSceneChange?.(countOf(api?.getSceneElements()))
    },
    [apiRef, onSceneChange],
  )
  const onScene = React.useCallback((elements) => onSceneChange?.(countOf(elements)), [onSceneChange])
  const onKeyDownCapture = React.useCallback((event) => {
    if (event.key !== '`' || event.ctrlKey || event.metaKey || event.altKey || isEditableTarget(event.target)) return
    event.preventDefault()
    event.stopPropagation()
    event.target.dispatchEvent(new KeyboardEvent('keydown', DELETE_KEY_EVENT))
  }, [])
  return React.createElement(
    'div',
    { className: 'csw-canvas', onKeyDownCapture },
    React.createElement(Excalidraw, {
      excalidrawAPI: bindApi,
      onChange: onScene,
      theme: theme === 'dark' ? 'dark' : 'light',
      langCode,
      name: 'DSH board',
      handleKeyboardGlobally: false,
      initialData,
      UIOptions: {
        canvasActions: {
          loadScene: false,
          saveAsImage: false,
          saveToActiveFile: false,
          export: false,
          toggleTheme: false,
          changeViewBackgroundColor: false,
        },
      },
    }),
  )
}

export async function capture(api) {
  if (!api) return { empty: true }
  const elements = api.getSceneElements()
  if (!Array.isArray(elements) || elements.length === 0) return { empty: true }
  const appState = api.getAppState()
  const files = api.getFiles()
  const blob = await exportToBlob({
    elements,
    files,
    mimeType: 'image/png',
    exportPadding: 16,
    appState: { ...appState, exportBackground: true, exportEmbedScene: false, exportWithDarkMode: appState.theme === 'dark' },
  })
  const scene = serializeAsJSON(
    elements,
    {
      gridSize: appState.gridSize,
      gridStep: appState.gridStep,
      gridModeEnabled: appState.gridModeEnabled,
      viewBackgroundColor: appState.viewBackgroundColor,
    },
    files,
    'local',
  )
  return { empty: false, blob, scene }
}

