declare global {
    var term_: ITerminalExt;
}

import type {
    ITerminalAddon,
    Terminal,
    IDisposable,
    IBufferLine,
} from '@xterm/xterm';

import type {
    ITerminalExt,
    IRenderDimensions,
    IRenderService,
    IResetHandler,
    ICellSize,
} from '@xterm/addon-image/src/Types';

type IFrameEntry = {
    iframe: HTMLIFrameElement,
    el: HTMLElement,
    visible?: boolean,
}

type IWriteSrcdocOptions = {
    srcdoc?: string,
    src?: string,
    height?: string,
}

export class WebviewAddon implements ITerminalAddon {
    private _terminal: any
    private el: HTMLDivElement | undefined
    private el_inner: HTMLDivElement | undefined
    private _renderService: IRenderService | undefined;
    
    private _disposables: IDisposable[] = [];
    private _handlers: Map<String, IResetHandler> = new Map();
    
    private _iframe_registry: { [key: number]: IFrameEntry };
    private _next_iframe_id: number = 0;
    private _iframe_rows_map: (number|undefined)[]

    // Scroll detection, to prevent iframes from stopping scroll
    private _scroll_cooldown: ReturnType<typeof setTimeout> | undefined;
    private _last_ydisp: number = 0;
    private _scrolling: boolean = false;

    constructor () {
        this._iframe_registry = {};
        this._iframe_rows_map = [];
    }
    private _register_iframe(entry: IFrameEntry) {
        const id = ++this._next_iframe_id;
        this._iframe_registry[id] = entry;
        return id;
    }
    
    private _iframe_interaction (on: boolean) {
        for ( const k in this._iframe_registry ) {
            const iframe = this._iframe_registry[k].iframe;
            if ( on ) iframe.style.pointerEvents = 'auto';
            else iframe.style.pointerEvents = 'none';
        }
    }

    public dispose(): void {
        for (const obj of this._disposables) {
            obj.dispose();
          }
          this._disposables.length = 0;
          this._handlers.clear();
    }
    private _disposeLater(...args: IDisposable[]): void {
        for (const obj of args) {
          this._disposables.push(obj);
        }
    }
    

    public activate(terminal: ITerminalExt): void {

        globalThis.term_ = terminal;

        this._terminal = terminal;
        this._renderService = terminal._core._renderService;
        terminal.parser.registerOscHandler(21337, data => {
            const PREFIX = 'web-terminal;write-srcdoc';
            if ( ! data.startsWith(PREFIX) ) return false;
            data = data.slice(PREFIX.length);
            const options: { [key: string]: string } = {};
            if ( data[0] === '?' ) {
                const i = data.indexOf(';');
                if ( i === -1 ) {
                    console.warn('missing semicolon in 21337 OSC sequence');
                    return false;
                }
                const querystring = data.slice(0, i);
                const params = new URLSearchParams(querystring);
                for (const [k, v] of params) {
                    options[k] = v;
                }
                data = data.slice(i+1);
            } else data = data.slice(1);
            if ( options.encoding && options.encoding === 'base64' ) {
                data = Buffer.from(data, 'base64').toString('utf-8');
            }
            this.addWebview({ ...options, srcdoc: data });
            return true;
        });
        terminal.parser.registerOscHandler(21337, data => {
            const PREFIX = 'web-terminal;write-src';
            if ( ! data.startsWith(PREFIX) ) return false;
            data = data.slice(PREFIX.length);
            const options: { [key: string]: string } = {};
            if ( data[0] === '?' ) {
                const i = data.indexOf(';');
                if ( i === -1 ) {
                    console.warn('missing semicolon in 21337 OSC sequence');
                    return false;
                }
                const querystring = data.slice(0, i);
                const params = new URLSearchParams(querystring);
                for (const [k, v] of params) {
                    options[k] = v;
                }
                data = data.slice(i+1);
            } else data = data.slice(1);
            if ( options.encoding && options.encoding === 'base64' ) {
                data = Buffer.from(data, 'base64').toString('utf-8');
            }
            this.addWebview({ ...options, src: data });
            return true;
        });
        
        this._disposeLater(
            terminal.onRender(range => this.render(range)),
        )
    }
    web_handler_(data: string): boolean | Promise<boolean> {
        return false;
    }

    render (range: { start: number, end: number }): void {
        const { start, end } = range;
        const buffer = this._terminal._core.buffer;
        
        if ( buffer.ydisp !== this._last_ydisp ) {
            if ( ! this._scrolling ) {
                this._scrolling = true;
                this._iframe_interaction(false);
            }

            // TODO: this might cause lag if re-creating the
            // timeout is heavy. The timestamp could be stored
            // in addition so that could be checked instead.
            if ( this._scroll_cooldown ) {
                clearTimeout(this._scroll_cooldown);
            }
            this._scroll_cooldown = setTimeout(() => {
                this._iframe_interaction(true);
                this._scrolling = false;
            }, 200);
        }
        this._last_ydisp = buffer.ydisp;
        
        if ( ! this.el ) {
            this.insertLayerToDom();
        }
        if ( ! this.el ) throw new Error('this won\'t happen');
        if ( ! this.el_inner ) throw new Error('this won\'t happen');
        
        for ( let row = start ; row <= end ; row++ ) {
            this._iframe_rows_map[row] = undefined;
            // NOTE: couldn't use line as IBufferLineExt because
            // typescript told me 'getBg' is missing, but for some
            // reason this works in addon-image/src/ImageStorage.ts.
            const line = buffer.lines.get(row + buffer.ydisp);
            if ( ! line ) continue;
            const e = line._extendedAttrs[0];
            if ( ! e?.iframeId ) continue;
            this._iframe_rows_map[row] = e.iframeId;
        }
        
        this._update_visible_iframes();
        
        // typescript made me do this
        this.el_inner.style.height = '' + (
            (buffer.ydisp + buffer._rows) * this.cellSize.height
        ) + 'px';
        this.el.scrollTop = buffer.ydisp * this.cellSize.height;
    }
    
    public insertLayerToDom(): void {
        if ( ! this.document && ! this._terminal?._core?.screenElement ) {
            console.warn('web addon: cannot insert layer to DOM');
            return;
        }
        
        this.el = document.createElement('div');
        this.el.classList.add('xterm-webview-layer');
        this.el.style.width = '100%';
        this.el.style.height = '100%';
        this.el.style.position = 'absolute';
        this.el.style.top = '0';
        this.el.style.left = '0';
        this.el.style.pointerEvents = 'none';
        // backdrop to debug the layer position
        // this.el.style.backgroundColor = 'rgba(255,255,0,0.2)';
        this.el.style.overflow = 'hidden';

        this.el_inner = document.createElement('div');
        this.el.appendChild(this.el_inner);
        this.el_inner.style.width = '100%';
        
        this._terminal._core.screenElement.appendChild(this.el);
    }

    public get document(): Document | undefined {
        if ( ! this._terminal ) return;
        return this._terminal._core._coreBrowserService?.window.document;
    }
    
    public addWebview (options: IWriteSrcdocOptions) {
        const buffer = this._terminal._core.buffer;
        let x = buffer.x;
        let y = buffer.y;
        
        
        // Webviews must always be all the way to the left of the screen;
        // if we're a number of columns in, move to the next line.
        if ( x !== 0 ) {
            this._terminal.write('\r\n');
            y++;
        }
        
        const height = options.height ? Number.parseInt(options.height) : 204;
        
        const n_rows = Math.ceil(height / this.cellSize.height);
        for ( let i=1 ; i < n_rows ; i++ ) {
            this._terminal.write(' \r\n');
        }
        
        y += buffer.ydisp;
        
        const iframe_el = (() => {
            const el = document.createElement('iframe');
            // el.style.backgroundColor = 'blue';
            el.style.border = 'none';
            if ( options.srcdoc ) {
                el.srcdoc = options.srcdoc;
            } else {
                el.src = options.src ?? 'about:blank';
            }
            el.style.pointerEvents = 'auto';
            return el;
        })();
        
        let el = iframe_el as HTMLElement;
        
        // const borders = ['#000000', '#FFFFFF'];
        const borders: string[] = [];
        for ( const border of borders ) {
            const border_el = document.createElement('div');
            el.style.boxSizing = 'border-box';
            el.style.width = '100%';
            el.style.height = '100%';
            border_el.appendChild(el);
            border_el.style.border = `2px solid ${border}`;
            el = border_el;
        }
        el.style.boxSizing = 'border-box';

        el.style.width = '100%';
        el.style.height = height + 'px';
        el.style.position = 'absolute';
        el.style.top = `${y*this.cellSize.height}px`;
        el.style.left = '0';

        const entry: IFrameEntry = {
            el,
            iframe: iframe_el,
            visible: true,
        };
        const id = this._register_iframe(entry);
        
        setTimeout(() => {
            for ( let i = y ; i < y + n_rows ; i++ ) {
                const line = buffer.lines.get(i);
                // TODO: I don't know why line is undefined sometimes
                if ( ! line ) continue;
                this._writeToCell(line, id);
            }
        }, 0);
        
        this.el_inner?.appendChild(el);
    }
    
    // used 'any' type here because '_extendedAttrs' is on IBufferLineExt
    // from the image addon, but not in IBufferLine from @xterm/xterm,
    // so I'm not sure of the correct way to type this.
    private _writeToCell(line: any, iframeId: number) {
        const ext_attrs = (() => {
            let ext_attrs = line._extendedAttrs[0];
            if ( ext_attrs ) return ext_attrs;
            
            // This definitely has potential to break something
            return line._extendedAttrs[0] = {};
        })();
        
        ext_attrs.iframeId = iframeId;
    }
    
    private _update_visible_iframes () {
        for ( const id in this._iframe_registry ) {
            this._iframe_registry[id].visible = false;
        }
        for ( const id of this._iframe_rows_map ) {
            if ( id === undefined ) continue;
            this._iframe_registry[id].visible = true;
        }
        for ( const id in this._iframe_registry ) {
            const entry = this._iframe_registry[id];
            if ( entry.visible ) {
                entry.el.style.visibility = 'visible';
            } else {
                entry.el.style.visibility = 'hidden';
            }
        }
    }

  /**
   * Dimensions of the terminal.
   * Forwarded from internal render service.
   */
  public get dimensions(): IRenderDimensions | undefined {
    return this._renderService?.dimensions;
  }
  
  public get cellSize(): ICellSize {
    return {
      width: this.dimensions?.css.cell.width || -1,
      height: this.dimensions?.css.cell.height || -1
    };
  }
}
