/*! markmap-view v0.15.4 | MIT License */
(function (exports, npm2url, d3) {
    'use strict';
    
    class Hook {
      constructor() {
        this.listeners = [];
      }
      tap(fn) {
        this.listeners.push(fn);
        return () => this.revoke(fn);
      }
      revoke(fn) {
        const i = this.listeners.indexOf(fn);
        if (i >= 0) this.listeners.splice(i, 1);
      }
      revokeAll() {
        this.listeners.splice(0);
      }
      call(...args) {
        for (const fn of this.listeners) {
          fn(...args);
        }
      }
    }
    
    function _extends() {
      _extends = Object.assign ? Object.assign.bind() : function (target) {
        for (var i = 1; i < arguments.length; i++) {
          var source = arguments[i];
          for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
              target[key] = source[key];
            }
          }
        }
        return target;
      };
      return _extends.apply(this, arguments);
    }
    
    const uniqId = Math.random().toString(36).slice(2, 8);
    let globalIndex = 0;
    function getId() {
      globalIndex += 1;
      return `mm-${uniqId}-${globalIndex}`;
    }
    function noop() {
      // noop
    }
    function walkTree(tree, callback) {
      const walk = (item, parent) => callback(item, () => {
        var _item$children;
        (_item$children = item.children) == null || _item$children.forEach(child => {
          walk(child, item);
        });
      }, parent);
      walk(tree);
    }
    function addClass(className, ...rest) {
      const classList = (className || '').split(' ').filter(Boolean);
      rest.forEach(item => {
        if (item && classList.indexOf(item) < 0) classList.push(item);
      });
      return classList.join(' ');
    }
    function childSelector(filter) {
      if (typeof filter === 'string') {
        const tagName = filter;
        filter = el => el.tagName === tagName;
      }
      const filterFn = filter;
      return function selector() {
        let nodes = Array.from(this.childNodes);
        if (filterFn) nodes = nodes.filter(node => filterFn(node));
        return nodes;
      };
    }
    function memoize(fn) {
      const cache = {};
      return function memoized(...args) {
        const key = `${args[0]}`;
        let data = cache[key];
        if (!data) {
          data = {
            value: fn(...args)
          };
          cache[key] = data;
        }
        return data.value;
      };
    }
    
    /*! @gera2ld/jsx-dom v2.2.2 | ISC License */
    const VTYPE_ELEMENT = 1;
    const VTYPE_FUNCTION = 2;
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const XLINK_NS = 'http://www.w3.org/1999/xlink';
    const NS_ATTRS = {
      show: XLINK_NS,
      actuate: XLINK_NS,
      href: XLINK_NS
    };
    
    const isLeaf = c => typeof c === 'string' || typeof c === 'number';
    const isElement = c => (c == null ? void 0 : c.vtype) === VTYPE_ELEMENT;
    const isRenderFunction = c => (c == null ? void 0 : c.vtype) === VTYPE_FUNCTION;
    function h(type, props, ...children) {
      props = Object.assign({}, props, {
        children: children.length === 1 ? children[0] : children
      });
      return jsx(type, props);
    }
    function jsx(type, props) {
      let vtype;
      if (typeof type === 'string') vtype = VTYPE_ELEMENT;else if (typeof type === 'function') vtype = VTYPE_FUNCTION;else throw new Error('Invalid VNode type');
      return {
        vtype,
        type,
        props
      };
    }
    function Fragment(props) {
      return props.children;
    }
    
    const DEFAULT_ENV = {
      isSvg: false
    };
    function insertDom(parent, nodes) {
      if (!Array.isArray(nodes)) nodes = [nodes];
      nodes = nodes.filter(Boolean);
      if (nodes.length) parent.append(...nodes);
    }
    function mountAttributes(domElement, props, env) {
      for (const key in props) {
        if (key === 'key' || key === 'children' || key === 'ref') continue;
        if (key === 'dangerouslySetInnerHTML') {
          domElement.innerHTML = props[key].__html;
        } else if (key === 'innerHTML' || key === 'textContent' || key === 'innerText' || key === 'value' && ['textarea', 'select'].includes(domElement.tagName)) {
          const value = props[key];
          if (value != null) domElement[key] = value;
        } else if (key.startsWith('on')) {
          domElement[key.toLowerCase()] = props[key];
        } else {
          setDOMAttribute(domElement, key, props[key], env.isSvg);
        }
      }
    }
    const attrMap = {
      className: 'class',
      labelFor: 'for'
    };
    function setDOMAttribute(el, attr, value, isSVG) {
      attr = attrMap[attr] || attr;
      if (value === true) {
        el.setAttribute(attr, '');
      } else if (value === false) {
        el.removeAttribute(attr);
      } else {
        const namespace = isSVG ? NS_ATTRS[attr] : undefined;
        if (namespace !== undefined) {
          el.setAttributeNS(namespace, attr, value);
        } else {
          el.setAttribute(attr, value);
        }
      }
    }
    function flatten(arr) {
      return arr.reduce((prev, item) => prev.concat(item), []);
    }
    function mountChildren(children, env) {
      return Array.isArray(children) ? flatten(children.map(child => mountChildren(child, env))) : mount(children, env);
    }
    function mount(vnode, env = DEFAULT_ENV) {
      if (vnode == null || typeof vnode === 'boolean') {
        return null;
      }
      if (vnode instanceof Node) {
        return vnode;
      }
      if (isRenderFunction(vnode)) {
        const {
          type,
          props
        } = vnode;
        if (type === Fragment) {
          const node = document.createDocumentFragment();
          if (props.children) {
            const children = mountChildren(props.children, env);
            insertDom(node, children);
          }
          return node;
        }
        const childVNode = type(props);
        return mount(childVNode, env);
      }
      if (isLeaf(vnode)) {
        return document.createTextNode(`${vnode}`);
      }
      if (isElement(vnode)) {
        let node;
        const {
          type,
          props
        } = vnode;
        if (!env.isSvg && type === 'svg') {
          env = Object.assign({}, env, {
            isSvg: true
          });
        }
        if (!env.isSvg) {
          node = document.createElement(type);
        } else {
          node = document.createElementNS(SVG_NS, type);
        }
        mountAttributes(node, props, env);
        if (props.children) {
          let childEnv = env;
          if (env.isSvg && type === 'foreignObject') {
            childEnv = Object.assign({}, childEnv, {
              isSvg: false
            });
          }
          const children = mountChildren(props.children, childEnv);
          if (children != null) insertDom(node, children);
        }
        const {
          ref
        } = props;
        if (typeof ref === 'function') ref(node);
        return node;
      }
      throw new Error('mount: Invalid Vnode!');
    }
    
    /**
     * Mount vdom as real DOM nodes.
     */
    function mountDom(vnode) {
      return mount(vnode);
    }
    
    /**
     * Render and mount without returning VirtualDOM, useful when you don't need SVG support.
     */
    function hm(...args) {
      return mountDom(h(...args));
    }
    
    const memoizedPreloadJS = memoize(url => {
      document.head.append(hm('link', {
        rel: 'preload',
        as: 'script',
        href: url
      }));
    });
    const jsCache = {};
    const cssCache = {};
    async function loadJSItem(item, context) {
      var _item$data;
      const src = item.type === 'script' && ((_item$data = item.data) == null ? void 0 : _item$data.src) || '';
      item.loaded || (item.loaded = jsCache[src]);
      if (!item.loaded) {
        if (item.type === 'script') {
          item.loaded = new Promise((resolve, reject) => {
            document.head.append(hm('script', _extends({}, item.data, {
              onLoad: resolve,
              onError: reject
            })));
            if (!src) {
              // Run inline script synchronously
              resolve(undefined);
            }
          }).then(() => {
            item.loaded = true;
          });
          if (src) jsCache[src] = item.loaded;
        }
        if (item.type === 'iife') {
          const {
            fn,
            getParams
          } = item.data;
          fn(...((getParams == null ? void 0 : getParams(context)) || []));
          item.loaded = true;
        }
      }
      await item.loaded;
    }
    function loadCSSItem(item) {
      const url = item.type === 'stylesheet' && item.data.href || '';
      item.loaded || (item.loaded = cssCache[url]);
      if (item.loaded) return;
      item.loaded = true;
      if (url) cssCache[url] = true;
      if (item.type === 'style') {
        document.head.append(hm('style', {
          textContent: item.data
        }));
      } else if (item.type === 'stylesheet') {
        document.head.append(hm('link', _extends({
          rel: 'stylesheet'
        }, item.data)));
      }
    }
    async function loadJS(items, context) {
      items.forEach(item => {
        var _item$data2;
        if (item.type === 'script' && (_item$data2 = item.data) != null && _item$data2.src) {
          memoizedPreloadJS(item.data.src);
        }
      });
      context = _extends({
        getMarkmap: () => window.markmap
      }, context);
      for (const item of items) {
        await loadJSItem(item, context);
      }
    }
    function loadCSS(items) {
      for (const item of items) {
        loadCSSItem(item);
      }
    }
    
    var css_248z$1 = ".markmap{font:300 16px/20px sans-serif}.markmap-link{fill:none}.markmap-node>circle{cursor:pointer}.markmap-foreign{display:inline-block}.markmap-foreign a{color:#0097e6}.markmap-foreign a:hover{color:#00a8ff}.markmap-foreign code{background-color:#f0f0f0;border-radius:2px;color:#555;font-size:calc(1em - 2px);padding:.25em}.markmap-foreign pre{margin:0}.markmap-foreign pre>code{display:block}.markmap-foreign del{text-decoration:line-through}.markmap-foreign em{font-style:italic}.markmap-foreign strong{font-weight:700}.markmap-foreign mark{background:#ffeaa7}";
    
    var css_248z = ".markmap-container{height:0;left:-100px;overflow:hidden;position:absolute;top:-100px;width:0}.markmap-container>.markmap-foreign{display:inline-block}.markmap-container>.markmap-foreign>div:last-child,.markmap-container>.markmap-foreign>div:last-child *{white-space:nowrap}";
    
    const globalCSS = css_248z$1;
    function linkWidth(nodeData) {
      const data = nodeData.data;
      return Math.max(4 - 2 * data.depth, 1.5);
    }
    function minBy(numbers, by) {
      const index = d3.minIndex(numbers, by);
      return numbers[index];
    }
    function stopPropagation(e) {
      e.stopPropagation();
    }
    function createViewHooks() {
      return {
        transformHtml: new Hook()
      };
    }
    
    /**
     * A global hook to refresh all markmaps when called.
     */
    const refreshHook = new Hook();
    const defaultColorFn = d3.scaleOrdinal(d3.schemeCategory10);
    const isMacintosh = typeof navigator !== 'undefined' && navigator.userAgent.includes('Macintosh');
    class Markmap {
      constructor(svg, opts) {
        this.options = Markmap.defaultOptions;
        this.revokers = [];
        this.handleZoom = e => {
          const {
            transform
          } = e;
          this.g.attr('transform', transform);
        };
        this.handlePan = e => {
          e.preventDefault();
          const transform = d3.zoomTransform(this.svg.node());
          const newTransform = transform.translate(-e.deltaX / transform.k, -e.deltaY / transform.k);
          this.svg.call(this.zoom.transform, newTransform);
        };
        this.handleClick = (e, d) => {
          let recursive = this.options.toggleRecursively;
          if (isMacintosh ? e.metaKey : e.ctrlKey) recursive = !recursive;
          this.toggleNode(d.data, recursive);
        };
        this.viewHooks = createViewHooks();
        this.svg = svg.datum ? svg : d3.select(svg);
        this.styleNode = this.svg.append('style');
        this.zoom = d3.zoom().filter(event => {
          if (this.options.scrollForPan) {
            // Pan with wheels, zoom with ctrl+wheels
            if (event.type === 'wheel') return event.ctrlKey && !event.button;
          }
          return (!event.ctrlKey || event.type === 'wheel') && !event.button;
        }).on('zoom', this.handleZoom);
        this.setOptions(opts);
        this.state = {
          id: this.options.id || this.svg.attr('id') || getId(),
          minX: 0,
          maxX: 0,
          minY: 0,
          maxY: 0
        };
        this.g = this.svg.append('g');
        this.revokers.push(refreshHook.tap(() => {
          this.setData();
        }));
      }
      getStyleContent() {
        const {
          style
        } = this.options;
        const {
          id
        } = this.state;
        const styleText = typeof style === 'function' ? style(id) : '';
        return [this.options.embedGlobalCSS && css_248z$1, styleText].filter(Boolean).join('\n');
      }
      updateStyle() {
        this.svg.attr('class', addClass(this.svg.attr('class'), 'markmap', this.state.id));
        const style = this.getStyleContent();
        this.styleNode.text(style);
      }
      toggleNode(data, recursive = false) {
        var _data$payload;
        const fold = (_data$payload = data.payload) != null && _data$payload.fold ? 0 : 1;
        if (recursive) {
          // recursively
          walkTree(data, (item, next) => {
            item.payload = _extends({}, item.payload, {
              fold
            });
            next();
          });
        } else {
          var _data$payload2;
          data.payload = _extends({}, data.payload, {
            fold: (_data$payload2 = data.payload) != null && _data$payload2.fold ? 0 : 1
          });
        }
        this.renderData(data);
      }
      initializeData(node) {
        let nodeId = 0;
        const {
          color,
          nodeMinHeight,
          maxWidth,
          initialExpandLevel
        } = this.options;
        const {
          id
        } = this.state;
        const container = mountDom(jsx("div", {
          className: `markmap-container markmap ${id}-g`
        }));
        const style = mountDom(jsx("style", {
          children: [this.getStyleContent(), css_248z].join('\n')
        }));
        document.body.append(container, style);
        const groupStyle = maxWidth ? `max-width: ${maxWidth}px` : '';
        let foldRecursively = 0;
        walkTree(node, (item, next, parent) => {
          var _item$children, _parent$state, _item$payload;
          item.children = (_item$children = item.children) == null ? void 0 : _item$children.map(child => _extends({}, child));
          nodeId += 1;
          const group = mountDom(jsx("div", {
            className: "markmap-foreign",
            style: groupStyle,
            children: jsx("div", {
              dangerouslySetInnerHTML: {
                __html: item.content
              }
            })
          }));
          container.append(group);
          item.state = _extends({}, item.state, {
            id: nodeId,
            el: group.firstChild
          });
          item.state.path = [parent == null || (_parent$state = parent.state) == null ? void 0 : _parent$state.path, item.state.id].filter(Boolean).join('.');
          color(item); // preload colors
    
          const isFoldRecursively = ((_item$payload = item.payload) == null ? void 0 : _item$payload.fold) === 2;
          if (isFoldRecursively) {
            foldRecursively += 1;
          } else if (foldRecursively || initialExpandLevel >= 0 && item.depth >= initialExpandLevel) {
            item.payload = _extends({}, item.payload, {
              fold: 1
            });
          }
          next();
          if (isFoldRecursively) foldRecursively -= 1;
        });
        const nodes = Array.from(container.childNodes).map(group => group.firstChild);
        this.viewHooks.transformHtml.call(this, nodes);
        // Clone the rendered HTML and set `white-space: nowrap` to it to detect its max-width.
        // The parent node will have a width of the max-width and the original content without
        // `white-space: nowrap` gets re-layouted, then we will get the expected layout, with
        // content in one line as much as possible, and subjecting to the given max-width.
        nodes.forEach(node => {
          var _node$parentNode;
          (_node$parentNode = node.parentNode) == null || _node$parentNode.append(node.cloneNode(true));
        });
        walkTree(node, (item, next, parent) => {
          var _parent$state2;
          const state = item.state;
          const rect = state.el.getBoundingClientRect();
          item.content = state.el.innerHTML;
          state.size = [Math.ceil(rect.width) + 1, Math.max(Math.ceil(rect.height), nodeMinHeight)];
          state.key = [parent == null || (_parent$state2 = parent.state) == null ? void 0 : _parent$state2.id, state.id].filter(Boolean).join('.') +
          // FIXME: find a way to check content hash
          item.content;
          next();
        });
        container.remove();
        style.remove();
      }
      setOptions(opts) {
        this.options = _extends({}, this.options, opts);
        if (this.options.zoom) {
          this.svg.call(this.zoom);
        } else {
          this.svg.on('.zoom', null);
        }
        if (this.options.pan) {
          this.svg.on('wheel', this.handlePan);
        } else {
          this.svg.on('wheel', null);
        }
      }
      setData(data, opts) {
        if (opts) this.setOptions(opts);
        if (data) this.state.data = data;
        if (!this.state.data) return;
        this.initializeData(this.state.data);
        this.updateStyle();
        this.renderData();
      }
      renderData(originData) {
        var _origin$data$state$x, _origin$data$state$y;
        if (!this.state.data) return;
        const {
          spacingHorizontal,
          paddingX,
          spacingVertical,
          autoFit,
          color
        } = this.options;
        const layout = d3.flextree({}).children(d => {
          var _d$payload;
          if (!((_d$payload = d.payload) != null && _d$payload.fold)) return d.children;
        }).nodeSize(node => {
          const [width, height] = node.data.state.size;
          return [height, width + (width ? paddingX * 2 : 0) + spacingHorizontal];
        }).spacing((a, b) => {
          return a.parent === b.parent ? spacingVertical : spacingVertical * 2;
        });
        const tree = layout.hierarchy(this.state.data);
        layout(tree);
        const descendants = tree.descendants().reverse();
        const links = tree.links();
        const linkShape = d3.linkHorizontal();
        const minX = d3.min(descendants, d => d.x - d.xSize / 2);
        const maxX = d3.max(descendants, d => d.x + d.xSize / 2);
        const minY = d3.min(descendants, d => d.y);
        const maxY = d3.max(descendants, d => d.y + d.ySize - spacingHorizontal);
        Object.assign(this.state, {
          minX,
          maxX,
          minY,
          maxY
        });
        if (autoFit) this.fit();
        const origin = originData && descendants.find(item => item.data === originData) || tree;
        const x0 = (_origin$data$state$x = origin.data.state.x0) != null ? _origin$data$state$x : origin.x;
        const y0 = (_origin$data$state$y = origin.data.state.y0) != null ? _origin$data$state$y : origin.y;
    
        // Update the nodes
        const node = this.g.selectAll(childSelector('g')).data(descendants, d => d.data.state.key);
        const nodeEnter = node.enter().append('g').attr('data-depth', d => d.data.depth).attr('data-path', d => d.data.state.path).attr('transform', d => `translate(${y0 + origin.ySize - d.ySize},${x0 + origin.xSize / 2 - d.xSize})`);
        const nodeExit = this.transition(node.exit());
        nodeExit.select('line').attr('x1', d => d.ySize - spacingHorizontal).attr('x2', d => d.ySize - spacingHorizontal);
        nodeExit.select('foreignObject').style('opacity', 0);
        nodeExit.attr('transform', d => `translate(${origin.y + origin.ySize - d.ySize},${origin.x + origin.xSize / 2 - d.xSize})`).remove();
        const nodeMerge = node.merge(nodeEnter).attr('class', d => {
          var _d$data$payload;
          return ['markmap-node', ((_d$data$payload = d.data.payload) == null ? void 0 : _d$data$payload.fold) && 'markmap-fold'].filter(Boolean).join(' ');
        });
        this.transition(nodeMerge).attr('transform', d => `translate(${d.y},${d.x - d.xSize / 2})`);
    
        // Update lines under the content
        const line = nodeMerge.selectAll(childSelector('line')).data(d => [d], d => d.data.state.key).join(enter => {
          return enter.append('line').attr('x1', d => d.ySize - spacingHorizontal).attr('x2', d => d.ySize - spacingHorizontal);
        }, update => update, exit => exit.remove());
        this.transition(line).attr('x1', -1).attr('x2', d => d.ySize - spacingHorizontal + 2).attr('y1', d => d.xSize).attr('y2', d => d.xSize).attr('stroke', d => color(d.data)).attr('stroke-width', linkWidth);
    
        // Circle to link to children of the node
        const circle = nodeMerge.selectAll(childSelector('circle')).data(d => {
          var _d$data$children;
          return (_d$data$children = d.data.children) != null && _d$data$children.length ? [d] : [];
        }, d => d.data.state.key).join(enter => {
          return enter.append('circle').attr('stroke-width', '1.5').attr('cx', d => d.ySize - spacingHorizontal).attr('cy', d => d.xSize).attr('r', 0).on('click', (e, d) => this.handleClick(e, d)).on('mousedown', stopPropagation);
        }, update => update, exit => exit.remove());
        this.transition(circle).attr('r', 6).attr('cx', d => d.ySize - spacingHorizontal).attr('cy', d => d.xSize).attr('stroke', d => color(d.data)).attr('fill', d => {
          var _d$data$payload2;
          return (_d$data$payload2 = d.data.payload) != null && _d$data$payload2.fold && d.data.children ? color(d.data) : '#fff';
        });
        const foreignObject = nodeMerge.selectAll(childSelector('foreignObject')).data(d => [d], d => d.data.state.key).join(enter => {
          const fo = enter.append('foreignObject').attr('class', 'markmap-foreign').attr('x', paddingX).attr('y', 0).style('opacity', 0).on('mousedown', stopPropagation).on('dblclick', stopPropagation);
          fo.append('xhtml:div').select(function select(d) {
            const clone = d.data.state.el.cloneNode(true);
            this.replaceWith(clone);
            return clone;
          }).attr('xmlns', 'http://www.w3.org/1999/xhtml');
          return fo;
        }, update => update, exit => exit.remove()).attr('width', d => Math.max(0, d.ySize - spacingHorizontal - paddingX * 2)).attr('height', d => d.xSize);
        this.transition(foreignObject).style('opacity', 1);
    
        // Update the links
        const path = this.g.selectAll(childSelector('path')).data(links, d => d.target.data.state.key).join(enter => {
          const source = [y0 + origin.ySize - spacingHorizontal, x0 + origin.xSize / 2];
          return enter.insert('path', 'g').attr('class', 'markmap-link').attr('data-depth', d => d.target.data.depth).attr('data-path', d => d.target.data.state.path).attr('d', linkShape({
            source,
            target: source
          }));
        }, update => update, exit => {
          const source = [origin.y + origin.ySize - spacingHorizontal, origin.x + origin.xSize / 2];
          return this.transition(exit).attr('d', linkShape({
            source,
            target: source
          })).remove();
        });
        this.transition(path).attr('stroke', d => color(d.target.data)).attr('stroke-width', d => linkWidth(d.target)).attr('d', d => {
          const origSource = d.source;
          const origTarget = d.target;
          const source = [origSource.y + origSource.ySize - spacingHorizontal, origSource.x + origSource.xSize / 2];
          const target = [origTarget.y, origTarget.x + origTarget.xSize / 2];
          return linkShape({
            source,
            target
          });
        });
        descendants.forEach(d => {
          d.data.state.x0 = d.x;
          d.data.state.y0 = d.y;
        });
      }
      transition(sel) {
        const {
          duration
        } = this.options;
        return sel.transition().duration(duration);
      }
    
      /**
       * Fit the content to the viewport.
       */
      async fit() {
        const svgNode = this.svg.node();
        const {
          width: offsetWidth,
          height: offsetHeight
        } = svgNode.getBoundingClientRect();
        const {
          fitRatio
        } = this.options;
        const {
          minX,
          maxX,
          minY,
          maxY
        } = this.state;
        const naturalWidth = maxY - minY;
        const naturalHeight = maxX - minX;
        const scale = Math.min(offsetWidth / naturalWidth * fitRatio, offsetHeight / naturalHeight * fitRatio, 2);
        const initialZoom = d3.zoomIdentity.translate((offsetWidth - naturalWidth * scale) / 2 - minY * scale, (offsetHeight - naturalHeight * scale) / 2 - minX * scale).scale(scale);
        return this.transition(this.svg).call(this.zoom.transform, initialZoom).end().catch(noop);
      }
    
      /**
       * Pan the content to make the provided node visible in the viewport.
       */
      async ensureView(node, padding) {
        let itemData;
        this.g.selectAll(childSelector('g')).each(function walk(d) {
          if (d.data === node) {
            itemData = d;
          }
        });
        if (!itemData) return;
        const svgNode = this.svg.node();
        const {
          spacingHorizontal
        } = this.options;
        const relRect = svgNode.getBoundingClientRect();
        const transform = d3.zoomTransform(svgNode);
        const [left, right] = [itemData.y, itemData.y + itemData.ySize - spacingHorizontal + 2].map(x => x * transform.k + transform.x);
        const [top, bottom] = [itemData.x - itemData.xSize / 2, itemData.x + itemData.xSize / 2].map(y => y * transform.k + transform.y);
        // Skip if the node includes or is included in the container.
        const pd = _extends({
          left: 0,
          right: 0,
          top: 0,
          bottom: 0
        }, padding);
        const dxs = [pd.left - left, relRect.width - pd.right - right];
        const dys = [pd.top - top, relRect.height - pd.bottom - bottom];
        const dx = dxs[0] * dxs[1] > 0 ? minBy(dxs, Math.abs) / transform.k : 0;
        const dy = dys[0] * dys[1] > 0 ? minBy(dys, Math.abs) / transform.k : 0;
        if (dx || dy) {
          const newTransform = transform.translate(dx, dy);
          return this.transition(this.svg).call(this.zoom.transform, newTransform).end().catch(noop);
        }
      }
    
      /**
       * Scale content with it pinned at the center of the viewport.
       */
      async rescale(scale) {
        const svgNode = this.svg.node();
        const {
          width: offsetWidth,
          height: offsetHeight
        } = svgNode.getBoundingClientRect();
        const halfWidth = offsetWidth / 2;
        const halfHeight = offsetHeight / 2;
        const transform = d3.zoomTransform(svgNode);
        const newTransform = transform.translate((halfWidth - transform.x) * (1 - scale) / transform.k, (halfHeight - transform.y) * (1 - scale) / transform.k).scale(scale);
        return this.transition(this.svg).call(this.zoom.transform, newTransform).end().catch(noop);
      }
      destroy() {
        this.svg.on('.zoom', null);
        this.svg.html(null);
        this.revokers.forEach(fn => {
          fn();
        });
      }
      static create(svg, opts, data = null) {
        const mm = new Markmap(svg, opts);
        if (data) {
          mm.setData(data);
          mm.fit(); // always fit for the first render
        }
    
        return mm;
      }
    }
    Markmap.defaultOptions = {
      autoFit: false,
      color: node => {
        var _node$state;
        return defaultColorFn(`${((_node$state = node.state) == null ? void 0 : _node$state.path) || ''}`);
      },
      duration: 500,
      embedGlobalCSS: true,
      fitRatio: 0.95,
      maxWidth: 0,
      nodeMinHeight: 16,
      paddingX: 8,
      scrollForPan: isMacintosh,
      spacingHorizontal: 80,
      spacingVertical: 5,
      initialExpandLevel: -1,
      zoom: true,
      pan: true,
      toggleRecursively: false
    };
    function deriveOptions(jsonOptions) {
      const derivedOptions = {};
      const options = _extends({}, jsonOptions);
      const {
        color,
        colorFreezeLevel
      } = options;
      if ((color == null ? void 0 : color.length) === 1) {
        const solidColor = color[0];
        derivedOptions.color = () => solidColor;
      } else if (color != null && color.length) {
        const colorFn = d3.scaleOrdinal(color);
        derivedOptions.color = node => colorFn(`${node.state.path}`);
      }
      if (colorFreezeLevel) {
        const color = derivedOptions.color || Markmap.defaultOptions.color;
        derivedOptions.color = node => {
          node = _extends({}, node, {
            state: _extends({}, node.state, {
              path: node.state.path.split('.').slice(0, colorFreezeLevel).join('.')
            })
          });
          return color(node);
        };
      }
      const numberKeys = ['duration', 'maxWidth', 'initialExpandLevel'];
      numberKeys.forEach(key => {
        const value = options[key];
        if (typeof value === 'number') derivedOptions[key] = value;
      });
      const booleanKeys = ['zoom', 'pan'];
      booleanKeys.forEach(key => {
        const value = options[key];
        if (value != null) derivedOptions[key] = !!value;
      });
      return derivedOptions;
    }
    
    exports.Markmap = Markmap;
    exports.defaultColorFn = defaultColorFn;
    exports.deriveOptions = deriveOptions;
    exports.globalCSS = globalCSS;
    exports.loadCSS = loadCSS;
    exports.loadJS = loadJS;
    exports.refreshHook = refreshHook;
    
    })(this.markmap = this.markmap || {}, null, d3);
    