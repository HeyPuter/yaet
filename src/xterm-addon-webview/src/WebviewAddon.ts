declare global {
    var term_: ITerminalExt;
}

import type {
    ITerminalAddon,
    Terminal,
    IDisposable,
} from '@xterm/xterm';

import type {
    ITerminalExt,
    IRenderDimensions,
    IRenderService,
    IResetHandler,
    ICellSize,
} from '@xterm/addon-image/src/Types';

export class WebviewAddon implements ITerminalAddon {
    private _terminal: any
    private el: HTMLDivElement | undefined
    private el_inner: HTMLDivElement | undefined
    private _renderService: IRenderService | undefined;
    
    private _disposables: IDisposable[] = [];
    private _handlers: Map<String, IResetHandler> = new Map();

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
            console.log('here is the data: ' + data);
            console.log('term?', terminal);
            this.addWebview();
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
        // console.log('render() called!', range);
        if ( ! this.el ) {
            this.insertLayerToDom();
        }
        
        // typescript made me do this
        if ( this.el ) {
            const buffer = this._terminal._core.buffer;
            console.log('scroll?', buffer.ydisp * this.cellSize.height);
            this.el.style.height = '' + (
                (buffer.ydisp + buffer._rows) * this.cellSize.height
            ) + 'px';
            this.el.scrollTop = buffer.ydisp * this.cellSize.height;
        }
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
        this.el.style.backgroundColor = 'rgba(255,255,0,0.2)';
        this.el.style.overflow = 'hidden';

        this.el_inner = document.createElement('div');
        this.el.appendChild(this.el_inner);
        this.el_inner.style.minHeight = '200%';
        this.el_inner.style.width = '100%';
        
        this._terminal._core.screenElement.appendChild(this.el);
    }

    public get document(): Document | undefined {
        if ( ! this._terminal ) return;
        return this._terminal._core._coreBrowserService?.window.document;
    }
    
    public addWebview () {
        const buffer = this._terminal._core.buffer;
        let x = buffer.x;
        let y = buffer.y;
        
        
        // Webviews must always be all the way to the left of the screen;
        // if we're a number of columns in, move to the next line.
        if ( x !== 0 ) {
            this._terminal.write('\r\n');
            y++;
        }
        
        const n_rows = Math.ceil(208 / this.cellSize.height);
        for ( let i=1 ; i < n_rows ; i++ ) {
            this._terminal.write('\r\n');
        }
        
        y += buffer.ydisp;
        
        console.log('aaa', buffer.y, y, buffer.ydisp);

        const el = document.createElement('div');
        el.style.width = '100%';
        el.style.height = '208px';
        el.style.backgroundColor = 'blue';
        el.style.position = 'absolute';
        el.style.top = `${y*this.cellSize.height}px`;
        el.style.left = '0';
        
        this.el_inner?.appendChild(el);
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
