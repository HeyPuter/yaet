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
    el: HTMLElement,
    visible?: boolean,
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
    constructor () {
        this._iframe_registry = {};
        this._iframe_rows_map = [];
    }
    private _register_iframe(entry: IFrameEntry) {
        const id = ++this._next_iframe_id;
        this._iframe_registry[id] = entry;
        return id;
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
            const PREFIX = 'web-terminal;write-srcdoc;';
            if ( ! data.startsWith(PREFIX) ) return false;
            data = data.slice(PREFIX.length);
            this.addWebview({ srcdoc: data });
            return true;
        });
        
        console.log('what?');
        this._disposeLater(
            terminal.onRender(range => this.render(range)),
        )
    }
    web_handler_(data: string): boolean | Promise<boolean> {
        console.log(data);
        return false;
    }

    render (range: { start: number, end: number }): void {
        const { start, end } = range;
        const buffer = this._terminal._core.buffer;
        
        console.log('render', range);

        // console.log('render() called!', range);
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
        console.log('scroll?', buffer.ydisp * this.cellSize.height);
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
    
    public addWebview (options: { srcdoc: string }) {
        const buffer = this._terminal._core.buffer;
        let x = buffer.x;
        let y = buffer.y;
        
        
        // Webviews must always be all the way to the left of the screen;
        // if we're a number of columns in, move to the next line.
        if ( x !== 0 ) {
            this._terminal.write('\r\n');
            y++;
        }
        
        const n_rows = Math.ceil(204 / this.cellSize.height);
        for ( let i=1 ; i < n_rows ; i++ ) {
            this._terminal.write('\r\n');
        }
        
        y += buffer.ydisp;
        
        console.log('aaa', buffer.y, y, buffer.ydisp);

        // IIFE for typescript reasons
        let el: HTMLElement = (() => {
            const el = document.createElement('iframe');
            // el.style.backgroundColor = 'blue';
            el.style.border = 'none';
            el.srcdoc = options.srcdoc;
            el.style.pointerEvents = 'auto';
            return el;
        })();
        
        const borders = ['#000000', '#FFFFFF'];
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
        el.style.height = '204px';
        el.style.position = 'absolute';
        el.style.top = `${y*this.cellSize.height}px`;
        el.style.left = '0';

        const entry: IFrameEntry = {
            el,
            visible: true,
        };
        const id = this._register_iframe(entry);
        
        for ( let i = y ; i < y + n_rows ; i++ ) {
            const line = buffer.lines.get(i);
            console.log('line?', line);
            // TODO: I don't know why line is undefined sometimes
            if ( ! line ) continue;
            this._writeToCell(line, id);
        }
        
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
