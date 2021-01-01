
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.24.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /////////////////TO DO//////////////////////////////////

    /////////////////IDEAS//////////////////////////////////
    // simple gui to accept or reject nested sheets
    // potentially flag sheets with low score
    // click sheet shuffle columns

    // new technique-- class panel widths by +- %
    // if none next is +- 1/2 of width

    // idea 2
    // start width columns of all the similar widths
    // that join columns

    // import { toDECIMAL } from "./methods"

    let NEST_TYPE = 'widest',
      FROM_BOTTOM = true,
      CUTTER = 0.375, // end mill diameter used to space panels
      GAP = 0, // gap + bit size = total space
      ERRORS = [], // catch all panels that don't fit
      MATERIAL = {
        // sheet size and options
        width: 49,
        height: 97,
        margins: 0.25,
        max_width: () => MATERIAL.width - MATERIAL.margins * 2 - CUTTER,
        max_height: () => MATERIAL.height - MATERIAL.margins * 2 - CUTTER,
      };

    function Nest(
      panels,
      firstPanelRow = 1,
      nestType = NEST_TYPE,
      metricUnits = false,
      fromBottom = FROM_BOTTOM,
      cutter = CUTTER,
      gap = GAP,
      material = MATERIAL
    ) {
      function panelArrayCreator() {
        // console.log(CSVToArray( panels ));
        return new List(
          panels.slice(firstPanelRow).flatMap((i) => {
            return quantityIDs(i).map((i) => new Panel(i))
          })
        ).flat()
      }

      function quantityIDs([id, quantity, width, height]) {
        if (width > MATERIAL.max_width() || height > MATERIAL.max_height()) {
          ERRORS.push(`Panneau ${id} est trop gros`);
          // ERRORS.push(`Panel ${id} is too big`)
          return []
        } else if (!width || !height || !quantity) return []
        let n = 1,
          uniqueIDs = [];
        while (quantity >= n) {
          let q = '';
          if (quantity > 1) q = `${n} sur ${quantity}`;
          // if ( quantity > 1 ) q = `${n} of ${quantity}`
          uniqueIDs.push([q, id, parseFloat(width), parseFloat(height)]);
          n++;
        }
        return uniqueIDs
      }

      ERRORS = [];
      const PANELS = panelArrayCreator(); // raw csv panel input converted
      // const METRIC_UNITS = metricUnits  // default false
      // const TARGET_FIT = 0.8                      // ratio of a good fit per sheet
      NEST_TYPE = nestType;
      FROM_BOTTOM = fromBottom;
      CUTTER = cutter;
      GAP = gap;
      MATERIAL.width = material.width;
      MATERIAL.height = material.height;
      MATERIAL.margins = material.margins;

      function fillColumn(panels) {
        let column = new List(panels.widest().place());
        let maxWidth = column[0].width;
        // add rows of panels to column until
        // no space remains or no more panels
        while (panels.fitsColumn(column)) {
          let row = new List(panels.fitsColumn(column).place());
          // add more panels to row if space remains
          while (panels.fitsRow(row, maxWidth)) {
            row.push(panels.fitsRow(row, maxWidth).place());
          }
          // return nested array only if
          // more than one panel in row
          if (row.length === 1) column.push(row[0]);
          else column.push(row);
        }
        // smallest pieces to center of column
        // return column.shuffle()
        return column.ascendingWidth()
      }

      function makeColumns(panels) {
        let columns = new List();
        while (panels.notPlaced().length > 0) {
          let column = fillColumn(panels);
          columns.push(
            new Column(
              column.columnWidth(), //width
              column.columnHeight(), // height
              column.columnArea(), // area
              column // group
            )
          );
        }
        return columns
      }

      function fillSheet(columns) {
        let sheet = new List(columns.placementBy().place());
        while (columns.fitsSheet(sheet)) {
          sheet.push(columns.fitsSheet(sheet).place());
        }
        // smallest pieces to center of sheet
        // return sheet.shuffle()
        return sheet.ascendingHeight()
      }

      function makeSheets(panels) {
        let columns = makeColumns(panels);
        let sheets = new List();
        while (columns.notPlaced().length > 0) {
          let sheet = fillSheet(columns);
          addCoordinates(sheet);
          sheets.push(
            new Sheet(
              sheet.filledWidth(), // width
              sheet.filledHeight(), // height
              sheet.filledArea(), // area
              sheet.map((list) => list.group).flatten(2), // group
              sheet, // columns
              sheets.length + 1 // id
            )
          );
        }
        return sheets
      }

      function addCoordinates(columns) {
        let margin = MATERIAL.margins - CUTTER / 2;

        let xPos = new List();
        let startX = margin;
        columns.forEach((column, i) => {
          // xPos map of columns, first index === start
          if (i === 0) {
            xPos.push(startX);
          }
          // everything after calculated += prev. width
          else {
            xPos.push(xPos.last() + columns[i - 1].width);
          }

          let yPos = new List();
          let startY = FROM_BOTTOM ? margin : MATERIAL.height - margin;

          // iterate each row in column
          column.group.forEach((row, j, rows) => {
            // yPos map of rows, first index === start
            if (firstIndex(j)) {
              FROM_BOTTOM
                ? yPos.push(startY)
                : yPos.push(startY - row.filledHeight());
            } else {
              FROM_BOTTOM
                ? yPos.push(yPos.last() + rows[j - 1].filledHeight())
                : yPos.push(yPos.last() - row.filledHeight());
            }

            // add x0 and y0 prop to each row in column
            if (row instanceof Panel) {
              firstIndex(i) && columns.length > 1
                ? (row.x0 = xPos[i] + columns[i].width - row.width)
                : (row.x0 = xPos[i]);
              row.y0 = yPos[j];
            } else {
              row.forEach((rowCol, k) => {
                firstIndex(k)
                  ? firstIndex(i) && columns.length > 1
                    ? (rowCol.x0 = xPos[i] + columns[i].width - rowCol.width)
                    : (rowCol.x0 = xPos[i])
                  : firstIndex(i) && columns.length > 1
                  ? (rowCol.x0 = row[k - 1].x0 - rowCol.width)
                  : (rowCol.x0 = row[k - 1].x0 + row[k - 1].width);
                FROM_BOTTOM
                  ? (rowCol.y0 = yPos[j])
                  : (rowCol.y0 = yPos[j - 1] - rowCol.height);
              });
            }
          });
        });
      }

      let sheets = makeSheets(PANELS);
      return [PANELS, sheets, ERRORS]
    }

    function firstIndex(index) {
      return index === 0
    }

    class Placement {
      constructor() {
        this.placed = false;
      }
      place() {
        this.placed = true;
        return this
      }
    }

    class Panel extends Placement {
      constructor([uniqueID, id, width, height]) {
        super();
        this.uniqueID = uniqueID;
        this.id = id;
        this.width = width + CUTTER + GAP;
        this.height = height + CUTTER + GAP;
        this.area = this.height * this.width;
        this.x0 = 0;
        this.y0 = 0;
      }

      filledWidth() {
        return this.width
      }
      filledHeight() {
        return this.height
      }
    }

    class Column extends Placement {
      constructor(width, height, area, group) {
        super();
        this.width = width;
        this.height = height;
        this.area = area;
        this.group = group;
      }
    }

    class Sheet extends Column {
      constructor(width, height, area, group, columns, id) {
        super(width, height, area, group);
        this.columns = columns;
        this.sheet_width = MATERIAL.width;
        this.sheet_height = MATERIAL.height;
        this.sheet_area = MATERIAL.width * MATERIAL.height;
        this.waste_area = this.sheet_area - this.area;
        this.waste_ratio = 1 - this.area / this.sheet_area;
        this.id = 'Feuille ' + id;
        // this.id = "Sheet " + id
        delete this.placed;
      }
    }

    class List extends Array {
      //  methods for arrays of Panel or group objects
      // extending array methods
      first() {
        return this[0]
      }
      last() {
        return this[this.length - 1]
      }
      flatten(dimensions = 1) {
        let flattened = this;
        while (dimensions--) {
          flattened = flattened.flat();
          // dimensions--
        }
        return flattened
      }
      // removeIndex( index ) {
      //     let list = [...this]
      //     this = [...list.slice(0, index), ...list.slice(index + 1)]
      // }
      // removeValue( value ) {
      //     this.removeIndex( array.indexOf( value ) )
      // }
      shuffle() {
        if (this.length < 3) return this
        return new List(...this.slice(1), this.first())
      }
      // sorting methods
      ascendingWidth() {
        return new List(...this).sort((a, b) =>
          b.width != a.width ? b.width - a.width : b.height - a.height
        )
      }
      ascendingHeight() {
        return new List(...this).sort((a, b) =>
          b.height != a.height ? b.height - a.height : b.width - a.width
        )
      }
      // methods to find unplaced panels
      notPlaced() {
        return this.filter((panel) => !panel.placed)
      }
      widest() {
        return this.notPlaced().ascendingWidth().first()
      }
      narrowest() {
        return this.notPlaced().ascendingWidth().last()
      }
      tallest() {
        return this.notPlaced().ascendingHeight().first()
      }
      shortest() {
        return this.notPlaced().ascendingHeight().last()
      }
      biggest() {
        return this.sort((a, b) => b.area - a.area)
          .notPlaced()
          .first()
      }
      smallest() {
        return this.sort((a, b) => a.area - b.area)
          .notPlaced()
          .first()
      }
      // placementBy = { "widest": widest(), "tallest": tallest() }
      placementBy() {
        switch (NEST_TYPE) {
          case 'widest':
            return this.widest()
          case 'narrowest':
            return this.narrowest()
          case 'tallest':
            return this.tallest()
          case 'shortest':
            return this.shortest()
          case 'biggest':
            return this.biggest()
          case 'smallest':
            return this.smallest()
        }
      }
      // group measurement methods
      totalWidth() {
        return this.reduce((total, panel) => {
          if (panel instanceof List) {
            return total + panel.ascendingWidth().first().width
          }
          return total + panel.width
        }, 0)
      }
      totalHeight() {
        return this.reduce((total, panel) => {
          if (panel instanceof List) {
            return total + panel.ascendingHeight().first().height
          }
          return total + panel.height
        }, 0)
      }
      totalArea() {
        return this.reduce((total, panel) => total + panel.area, 0)
      }
      columnWidth() {
        return this.flat().ascendingWidth().first().width
      }
      columnHeight() {
        return this.totalHeight()
      }
      columnArea() {
        return this.flat().totalArea()
      }
      filledHeight() {
        return this.ascendingHeight().first().height
      }
      filledWidth() {
        return this.totalWidth()
      }
      filledArea() {
        return this.flat().totalArea()
      }
      remainingWidth(maxWidth) {
        return maxWidth - this.totalWidth()
      }
      remainingHeight(maxHeight) {
        return maxHeight - this.totalHeight()
      }
      fitsColumn(group, maxHeight = MATERIAL.height) {
        return this.notPlaced()
          .filter((panel) => panel.width <= group[0].width)
          .filter((panel) => panel.height < group.remainingHeight(maxHeight))
          .placementBy()
      }
      fitsRow(group, maxWidth) {
        return this.notPlaced()
          .filter((panel) => panel.height <= group[0].height)
          .filter((panel) => panel.width < group.remainingWidth(maxWidth))
          .placementBy()
      }
      fitsSheet(group, maxWidth = MATERIAL.width) {
        return this.notPlaced()
          .filter((panel) => panel.width < group.remainingWidth(maxWidth))
          .placementBy()
      }
    }

    function toFloat(str) {
      const float4 = (str) => parseFloat(parseFloat(str).toFixed(4));
      if (!isNaN(str)) return float4(str) // if number return float
      if (str.includes('/') && !str.includes('.')) {
        return str
          .split(' ') // covert rational string into array
          .filter((item) => item !== '') // removes multiple spaces
          .reduce((total, item) => {
            // get array total of whole # + fraction
            if (item.includes('/')) {
              let frac = item.split('/').filter((item) => item !== '');
              return total + float4(frac[0] / frac[1])
            }
            return total + float4(item)
          }, 0)
      }
      return str
    }

    function hasNumber(str) {
      return /\d/.test(str)
    }

    function trunc(number, places) {
      return parseInt(number * 10 ** places) / 10 ** places
    }

    function formatDate(date, format) {
      const map = {
        mm: date.getMonth() + 1,
        dd: date.getDate(),
        yy: date.getFullYear().toString().slice(-2),
        yyyy: date.getFullYear(),
        H: date.getHours(),
        M: date.getMinutes(),
        S: date.getSeconds(),
      };

      return format.replace(/mm|dd|yy|yyyy|H|M|S/gi, (matched) => map[matched])
    }

    ///////////////////////////////////////////////////////

    let TOOL_NUMBER = 9;
    let SPINDLE_SPEED = 18000;
    let FEED_RATE = 400;
    let PLUNGE_RATE = 50;
    let X_HOME = 30.0;
    let Y_HOME = 120.0;
    // let Z_HOME = 0
    let SAFE_HEIGHT = 1;
    let CUT_TO_DEPTH = 0;

    function HEADER(tool, speed, fileName, sheets) {
      return [
        `( ${fileName} )`,
        // `( ${sheets} sheets to cut )`,
        `( ${sheets} feuilles a couper )`,
        `( ${formatDate(new Date(), 'dd/mm/yyyy H:M')} )`,
        `G40 G80 G70`,
        // `G91 G28 Z0`,
        `M06 T${tool}`,
        `G43 H${tool}`,
        `S${speed} M03`,
        `G54 G90`,
      ]
    }
    function SHEET_CHANGE(x, y) {
      return [
        `M05 M104`,
        `G90 X${addPoint(x)} Y${addPoint(y)}`,
        `M00`,
        // `( Load next sheet and )`,
        `( changez la feuille et )`,
        `( cycle start :)`,
        `M103 M03`,
      ]
    }
    function FOOTER() {
      return [
        `G40 G80 G91 G28 Z0 M5`,
        `G00 G90 X${addPoint(X_HOME)} Y${addPoint(Y_HOME)}`,
        `M30`,
      ]
    }
    function RAPID_MOVE(x, y, z) {
      return `G00 X${addPoint(x)} Y${addPoint(y)} Z${addPoint(z)}`
    }
    function RETRACT_MOVE(z) {
      return `G00 Z${addPoint(z)}`
    }
    function PLUNGE_MOVE(x, y, z, f) {
      return `G01 X${addPoint(x)} Y${addPoint(y)} Z${addPoint(z)} F${f}`
    }
    function FEED_MOVE(x, y, z, f) {
      return `G01 X${addPoint(x)} Y${addPoint(y)} Z${addPoint(z)} F${f}`
    }
    function MOVE_X(x) {
      return `X${addPoint(x)}`
    }
    function MOVE_Y(y) {
      return `Y${addPoint(y)}`
    }

    function addPoint(num) {
      if (/\./.test(num) || num === 0) return num
      return num.toFixed(1)
    }

    function Gcode(sheets, material, fileName) {
      X_HOME = material.width / 2;
      Y_HOME = material.height + 10; // add limit to 122"
      let output = [...HEADER(TOOL_NUMBER, SPINDLE_SPEED, fileName, sheets.length)];
      sheets.forEach((sheet) => {
        output.push(`( ${sheet.id} )`);
        sheet.columns.forEach((column, index) => {
          column.group
            .flat()
            .sort((a, b) =>
              index % 2 === 0
                ? b.y0 !== a.y0
                  ? b.y0 - a.y0
                  : a.x0 - b.x0
                : a.y0 !== b.y0
                ? a.y0 - b.y0
                : b.x0 - a.x0
            )
            .forEach((panel) => output.push(profileCut(panel, material)));
        });
        output.push(SHEET_CHANGE(X_HOME, Y_HOME));
      });
      output.pop(); // get rid of last sheet change
      output.push(FOOTER());
      return output.flat().join('\n')
    }

    function profileCut(panel, material) {
      SAFE_HEIGHT = material.thickness + 0.25;

      const { x0, y0, width, height } = panel;
      let x_ = x0 + width;
      let y_ = y0 + height;
      let yStart = y0 + height / 5;
      let yEnd = yStart + SAFE_HEIGHT;

      return [
        // `( cutting panel ${panel.id} )`,
        `( coupe panneau ${panel.id} )`,
        `( ${panel.uniqueID} )`,
        RAPID_MOVE(x0, yStart, SAFE_HEIGHT),
        PLUNGE_MOVE(x0, yEnd, CUT_TO_DEPTH, PLUNGE_RATE),
        FEED_MOVE(x0, y_, CUT_TO_DEPTH, FEED_RATE),
        MOVE_X(x_),
        MOVE_Y(y0),
        MOVE_X(x0),
        MOVE_Y(yEnd),
        RETRACT_MOVE(SAFE_HEIGHT),
        // `( finished panel ${panel.id} )`,
        `( fin panneau ${panel.id} )`,
      ]
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    // import YAML from 'yaml';

    const localStore = (key, initial) => {
      // receives the key of the local storage and an initial value

      // helper function
      const toString = (value) => JSON.stringify(value, null, 2);
      // helper function
      const toObj = JSON.parse;

      // item not present in local storage
      if (localStorage.getItem(key) === null) {
        // initialize local storage with initial value
        localStorage.setItem(key, toString(initial));
      }

      // convert to object
      const saved = toObj(localStorage.getItem(key));

      // create the underlying writable store
      const { subscribe, set, update } = writable(saved);

      return {
        subscribe,
        set: (value) => {
          // save also to local storage as a string
          localStorage.setItem(key, toString(value));
          return set(value)
        },
        update,
      }
    };

    // import YAML from 'yaml';

    const sessionStore = (key, initial) => {
      // receives the key of the local storage and an initial value

      // helper function
      const toString = (value) => JSON.stringify(value, null, 2);
      // helper function
      const toObj = JSON.parse;

      // item not present in local storage
      if (sessionStorage.getItem(key) === null) {
        // initialize local storage with initial value
        sessionStorage.setItem(key, toString(initial));
      }

      // convert to object
      const saved = toObj(sessionStorage.getItem(key));

      // create the underlying writable store
      const { subscribe, set, update } = writable(saved);

      return {
        subscribe,
        set: (value) => {
          // save also to local storage as a string
          sessionStorage.setItem(key, toString(value));
          return set(value)
        },
        update,
      }
    };

    // stores.js

    let placementSettings = {
      material: {
        type: '',
        colour: '',
        width: 49,
        height: 97,
        thickness: 0.75,
        margins: 0.3,
      },
      tool: 9,
      // gap: 0,
      placementType: 'widest',
      units: false,
      direction: true,
      show: true,
      cnc: {
        1: {
          type: 'Endmill',
          diameter: 0.1875,
          spindle: 18000,
          feed: 75,
          plunge: 75,
          ramp: 1,
          max_depth: 0.125,
        },
        2: {
          type: 'Endmill',
          diameter: 0.25,
          spindle: 18000,
          feed: 150,
          plunge: 40,
          ramp: 1,
          max_depth: 0.125,
        },
        3: {
          type: 'Ballnose',
          diameter: 0.125,
          spindle: 18000,
          feed: 150,
          plunge: 40,
          ramp: 1,
          max_depth: 0.125,
        },
        4: {
          type: 'Endmill',
          diameter: 0.125,
          spindle: 18000,
          feed: 150,
          plunge: 40,
          ramp: 1,
          max_depth: 0.125,
        },
        5: {
          type: 'Endmill',
          diameter: 0.125,
          spindle: 18000,
          feed: 150,
          plunge: 40,
          ramp: 1,
          max_depth: 0.125,
        },
        6: {
          type: 'Endmill',
          diameter: 0.25,
          spindle: 18000,
          feed: 150,
          plunge: 40,
          ramp: 1,
          max_depth: 0.125,
        },
        7: {
          type: 'drill',
          diameter: 0.125,
          spindle: 18000,
          feed: 0,
          plunge: 70,
          ramp: 0,
          max_depth: 0.125,
        },
        9: {
          type: 'Endmill',
          diameter: 0.375,
          spindle: 18000,
          feed: 400,
          plunge: 70,
          ramp: 1,
          max_depth: 0.875,
        },
      },
    };
    // const fallback = [
    //   { sheet_width: 49, sheet_height: 97 }
    // ]

    const blancCSV = {
      name: formatDate(new Date(), 'yymmdd-HM'),
      // name: formatDate( new Date(), 'yymmdd-HM' ),
      errors: [],
      contents: [
        ['Project name:', 'New'],
        ['Border (+ or -)', 0],
        ['Metric units', false],
        [, , ,],
        ['Panel', 'Q', 'W', 'H'],
        [1, , ,],
      ],
    };

    // export const cabinets = localStore('cabinets', [])

    // export const inputState = localStore('input-state', "cabinet")
    // export const cabinetType = localStore('cabinet-type', "bathroom")

    const settings = localStore('settings', placementSettings);
    const panels = sessionStore('panels', []);
    const sheets = sessionStore('sheets', []);
    const csvFile = sessionStore('csv-file', blancCSV);
    const svg = sessionStore('svg', '');
    const activePanel = sessionStore('activePanel', '');

    // export const inputTemplate = localStore('template', template)

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    	  path: basedir,
    	  exports: {},
    	  require: function (path, base) {
          return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
        }
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var FileSaver_min = createCommonjsModule(function (module, exports) {
    (function(a,b){b();})(commonjsGlobal,function(){function b(a,b){return "undefined"==typeof b?b={autoBom:!1}:"object"!=typeof b&&(console.warn("Deprecated: Expected third argument to be a object"),b={autoBom:!b}),b.autoBom&&/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(a.type)?new Blob(["\uFEFF",a],{type:a.type}):a}function c(a,b,c){var d=new XMLHttpRequest;d.open("GET",a),d.responseType="blob",d.onload=function(){g(d.response,b,c);},d.onerror=function(){console.error("could not download file");},d.send();}function d(a){var b=new XMLHttpRequest;b.open("HEAD",a,!1);try{b.send();}catch(a){}return 200<=b.status&&299>=b.status}function e(a){try{a.dispatchEvent(new MouseEvent("click"));}catch(c){var b=document.createEvent("MouseEvents");b.initMouseEvent("click",!0,!0,window,0,0,0,80,20,!1,!1,!1,!1,0,null),a.dispatchEvent(b);}}var f="object"==typeof window&&window.window===window?window:"object"==typeof self&&self.self===self?self:"object"==typeof commonjsGlobal&&commonjsGlobal.global===commonjsGlobal?commonjsGlobal:void 0,a=f.navigator&&/Macintosh/.test(navigator.userAgent)&&/AppleWebKit/.test(navigator.userAgent)&&!/Safari/.test(navigator.userAgent),g=f.saveAs||("object"!=typeof window||window!==f?function(){}:"download"in HTMLAnchorElement.prototype&&!a?function(b,g,h){var i=f.URL||f.webkitURL,j=document.createElement("a");g=g||b.name||"download",j.download=g,j.rel="noopener","string"==typeof b?(j.href=b,j.origin===location.origin?e(j):d(j.href)?c(b,g,h):e(j,j.target="_blank")):(j.href=i.createObjectURL(b),setTimeout(function(){i.revokeObjectURL(j.href);},4E4),setTimeout(function(){e(j);},0));}:"msSaveOrOpenBlob"in navigator?function(f,g,h){if(g=g||f.name||"download","string"!=typeof f)navigator.msSaveOrOpenBlob(b(f,h),g);else if(d(f))c(f,g,h);else {var i=document.createElement("a");i.href=f,i.target="_blank",setTimeout(function(){e(i);});}}:function(b,d,e,g){if(g=g||open("","_blank"),g&&(g.document.title=g.document.body.innerText="downloading..."),"string"==typeof b)return c(b,d,e);var h="application/octet-stream"===b.type,i=/constructor/i.test(f.HTMLElement)||f.safari,j=/CriOS\/[\d]+/.test(navigator.userAgent);if((j||h&&i||a)&&"undefined"!=typeof FileReader){var k=new FileReader;k.onloadend=function(){var a=k.result;a=j?a:a.replace(/^data:[^;]*;/,"data:attachment/file;"),g?g.location.href=a:location=a,g=null;},k.readAsDataURL(b);}else {var l=f.URL||f.webkitURL,m=l.createObjectURL(b);g?g.location=m:location.href=m,g=null,setTimeout(function(){l.revokeObjectURL(m);},4E4);}});f.saveAs=g.saveAs=g,(module.exports=g);});


    });

    function CSVToArray(strData, headerRows = 1, strDelimiter = ',') {
      // Create a regular expression to parse the CSV values.
      var regexPattern = new RegExp(
        '(\\' +
          strDelimiter +
          '|\\r?\\n|\\r|^)' + // Delimiters.
          '(?:"([^"]*(?:""[^"]*)*)"|' + // Quoted fields.
          '([^"\\' +
          strDelimiter +
          '\\r\\n]*))', // Standard fields.
        'gi'
      );

      // Create an array of arrays to hold csv data.
      var arrData = [[]];

      // Create an array to hold our individual pattern
      // matching groups.
      var arrMatches = null;

      // Keep looping over the regular expression matches
      // until we can no longer find a match.
      while ((arrMatches = regexPattern.exec(strData))) {
        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[1];

        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (strMatchedDelimiter.length && strMatchedDelimiter != strDelimiter) {
          // Since we have reached a new row of data,
          // add an empty row to our data array.
          arrData.push([]);
        }

        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[2]) {
          // We found a quoted value. When we capture
          // this value, unescape any double quotes.
          var strMatchedValue = arrMatches[2].replace(new RegExp('""', 'g'), '"');
        } else {
          // We found a non-quoted value.
          var strMatchedValue = arrMatches[3];
        }

        if (hasNumber(strMatchedValue)) {
          strMatchedValue = toFloat(strMatchedValue);
        }

        // Now that we have our value string, let's add
        // it to the data array.
        arrData[arrData.length - 1].push(strMatchedValue);
      }

      // Return the parsed data.
      return arrData.filter((item, index) => {
        // keep all header rows
        if (index < headerRows) return true
        // removes blanc rows thereafter
        return item.filter((inner) => inner !== '').length
      })
    }

    /* src/components/Import.svelte generated by Svelte v3.24.1 */
    const file_1 = "src/components/Import.svelte";

    // (262:2) {:else}
    function create_else_block(ctx) {
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			div2 = element("div");
    			attr_dev(div0, "class", "file-icon dl-csv-block blocked svelte-eyl72a");
    			add_location(div0, file_1, 262, 4, 5939);
    			attr_dev(div1, "class", "file-icon dl-svg-block blocked svelte-eyl72a");
    			add_location(div1, file_1, 263, 4, 5994);
    			attr_dev(div2, "class", "file-icon dl-cnc-block blocked svelte-eyl72a");
    			add_location(div2, file_1, 264, 4, 6049);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(262:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (230:2) {#if $sheets.length}
    function create_if_block(ctx) {
    	let a0;
    	let span0;
    	let a0_href_value;
    	let a0_download_value;
    	let t1;
    	let a1;
    	let span1;
    	let a1_href_value;
    	let a1_download_value;
    	let t3;
    	let a2;
    	let span2;
    	let a2_href_value;
    	let a2_download_value;

    	const block = {
    		c: function create() {
    			a0 = element("a");
    			span0 = element("span");
    			span0.textContent = "download .csv file";
    			t1 = space();
    			a1 = element("a");
    			span1 = element("span");
    			span1.textContent = "download .svg file";
    			t3 = space();
    			a2 = element("a");
    			span2 = element("span");
    			span2.textContent = "download .cnc file";
    			attr_dev(span0, "class", "svelte-eyl72a");
    			add_location(span0, file_1, 238, 6, 5213);
    			attr_dev(a0, "href", a0_href_value = "data:text/plain;charset=utf-8," + encodeURIComponent(/*csv*/ ctx[11]));
    			attr_dev(a0, "download", a0_download_value = "" + (/*$csvFile*/ ctx[5].name + /*today*/ ctx[12] + ".csv"));
    			attr_dev(a0, "role", "button");
    			attr_dev(a0, "data-lang", /*userLang*/ ctx[10]);
    			attr_dev(a0, "data-fr", "téléchargez le fichier .csv");
    			attr_dev(a0, "class", "file-icon dl-csv svelte-eyl72a");
    			add_location(a0, file_1, 230, 4, 4939);
    			attr_dev(span1, "class", "svelte-eyl72a");
    			add_location(span1, file_1, 249, 6, 5563);
    			attr_dev(a1, "href", a1_href_value = "data:text/plain;charset=utf-8," + encodeURIComponent(/*$svg*/ ctx[9]));
    			attr_dev(a1, "download", a1_download_value = "" + (/*$csvFile*/ ctx[5].name + /*today*/ ctx[12] + ".svg"));
    			attr_dev(a1, "alt", "download svg file");
    			attr_dev(a1, "role", "button");
    			attr_dev(a1, "data-lang", /*userLang*/ ctx[10]);
    			attr_dev(a1, "data-fr", "telechargez le fichier .svg");
    			attr_dev(a1, "class", "file-icon dl-svg svelte-eyl72a");
    			add_location(a1, file_1, 240, 4, 5258);
    			attr_dev(span2, "class", "svelte-eyl72a");
    			add_location(span2, file_1, 259, 6, 5884);
    			attr_dev(a2, "href", a2_href_value = "data:text/plain;charset=utf-8," + encodeURIComponent(/*cnc*/ ctx[6]()));
    			attr_dev(a2, "download", a2_download_value = "" + (/*$csvFile*/ ctx[5].name + /*today*/ ctx[12] + ".cnc"));
    			attr_dev(a2, "role", "button");
    			attr_dev(a2, "data-lang", /*userLang*/ ctx[10]);
    			attr_dev(a2, "data-fr", "telechargez le fichier .cnc");
    			attr_dev(a2, "class", "file-icon dl-cnc svelte-eyl72a");
    			add_location(a2, file_1, 251, 4, 5608);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a0, anchor);
    			append_dev(a0, span0);
    			/*a0_binding*/ ctx[19](a0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, a1, anchor);
    			append_dev(a1, span1);
    			/*a1_binding*/ ctx[20](a1);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, a2, anchor);
    			append_dev(a2, span2);
    			/*a2_binding*/ ctx[21](a2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$csvFile*/ 32 && a0_download_value !== (a0_download_value = "" + (/*$csvFile*/ ctx[5].name + /*today*/ ctx[12] + ".csv"))) {
    				attr_dev(a0, "download", a0_download_value);
    			}

    			if (dirty & /*$svg*/ 512 && a1_href_value !== (a1_href_value = "data:text/plain;charset=utf-8," + encodeURIComponent(/*$svg*/ ctx[9]))) {
    				attr_dev(a1, "href", a1_href_value);
    			}

    			if (dirty & /*$csvFile*/ 32 && a1_download_value !== (a1_download_value = "" + (/*$csvFile*/ ctx[5].name + /*today*/ ctx[12] + ".svg"))) {
    				attr_dev(a1, "download", a1_download_value);
    			}

    			if (dirty & /*cnc*/ 64 && a2_href_value !== (a2_href_value = "data:text/plain;charset=utf-8," + encodeURIComponent(/*cnc*/ ctx[6]()))) {
    				attr_dev(a2, "href", a2_href_value);
    			}

    			if (dirty & /*$csvFile*/ 32 && a2_download_value !== (a2_download_value = "" + (/*$csvFile*/ ctx[5].name + /*today*/ ctx[12] + ".cnc"))) {
    				attr_dev(a2, "download", a2_download_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a0);
    			/*a0_binding*/ ctx[19](null);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(a1);
    			/*a1_binding*/ ctx[20](null);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(a2);
    			/*a2_binding*/ ctx[21](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(230:2) {#if $sheets.length}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let title_value;
    	let t0;
    	let div2;
    	let input;
    	let t1;
    	let label;
    	let span0;
    	let label_class_value;
    	let t3;
    	let div0;
    	let span1;
    	let t5;
    	let t6;
    	let div1;
    	let span2;
    	let mounted;
    	let dispose;
    	document.title = title_value = "Project: " + /*$csvFile*/ ctx[5].name || "Nest";

    	function select_block_type(ctx, dirty) {
    		if (/*$sheets*/ ctx[7].length) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			t0 = space();
    			div2 = element("div");
    			input = element("input");
    			t1 = space();
    			label = element("label");
    			span0 = element("span");
    			span0.textContent = "upload a .csv file";
    			t3 = space();
    			div0 = element("div");
    			span1 = element("span");
    			span1.textContent = "new file";
    			t5 = space();
    			if_block.c();
    			t6 = space();
    			div1 = element("div");
    			span2 = element("span");
    			span2.textContent = "cnc + project settings";
    			attr_dev(input, "class", "inputfile svelte-eyl72a");
    			attr_dev(input, "name", "file");
    			attr_dev(input, "id", "file");
    			attr_dev(input, "type", "file");
    			add_location(input, file_1, 205, 2, 4358);
    			attr_dev(span0, "class", "svelte-eyl72a");
    			add_location(span0, file_1, 218, 4, 4683);
    			attr_dev(label, "for", "file");
    			attr_dev(label, "data-lang", /*userLang*/ ctx[10]);
    			attr_dev(label, "data-fr", "téléversez un fichier .csv");
    			attr_dev(label, "class", label_class_value = "file-icon " + (/*badFile*/ ctx[0] ? "badfile" : "upload") + " svelte-eyl72a");
    			add_location(label, file_1, 212, 2, 4488);
    			attr_dev(span1, "class", "svelte-eyl72a");
    			add_location(span1, file_1, 227, 4, 4881);
    			attr_dev(div0, "tabindex", "0");
    			attr_dev(div0, "role", "button");
    			attr_dev(div0, "data-lang", /*userLang*/ ctx[10]);
    			attr_dev(div0, "data-fr", "nouveau fichier");
    			attr_dev(div0, "class", "file-icon new svelte-eyl72a");
    			add_location(div0, file_1, 220, 2, 4728);
    			attr_dev(span2, "class", "svelte-eyl72a");
    			add_location(span2, file_1, 274, 4, 6348);
    			attr_dev(div1, "tabindex", "0");
    			attr_dev(div1, "role", "button");
    			attr_dev(div1, "data-lang", /*userLang*/ ctx[10]);
    			attr_dev(div1, "data-fr", "cnc + projet parametre");
    			attr_dev(div1, "class", "file-icon setting-icon svelte-eyl72a");
    			toggle_class(div1, "active", /*$settings*/ ctx[8].show);
    			add_location(div1, file_1, 266, 2, 6110);
    			attr_dev(div2, "class", "file-mgmt svelte-eyl72a");
    			add_location(div2, file_1, 204, 0, 4332);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, input);
    			/*input_binding*/ ctx[17](input);
    			append_dev(div2, t1);
    			append_dev(div2, label);
    			append_dev(label, span0);
    			append_dev(div2, t3);
    			append_dev(div2, div0);
    			append_dev(div0, span1);
    			append_dev(div2, t5);
    			if_block.m(div2, null);
    			append_dev(div2, t6);
    			append_dev(div2, div1);
    			append_dev(div1, span2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "keydown", /*handleKeyDown*/ ctx[15], false, false, false),
    					listen_dev(window, "keyup", /*handleKeyUp*/ ctx[16], false, false, false),
    					listen_dev(input, "change", /*loadFile*/ ctx[14], false, false, false),
    					listen_dev(label, "mouseover", /*mouseover_handler*/ ctx[18], false, false, false),
    					listen_dev(div0, "click", /*newFile*/ ctx[13], false, false, false),
    					listen_dev(div1, "click", /*click_handler*/ ctx[22], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$csvFile*/ 32 && title_value !== (title_value = "Project: " + /*$csvFile*/ ctx[5].name || "Nest")) {
    				document.title = title_value;
    			}

    			if (dirty & /*badFile*/ 1 && label_class_value !== (label_class_value = "file-icon " + (/*badFile*/ ctx[0] ? "badfile" : "upload") + " svelte-eyl72a")) {
    				attr_dev(label, "class", label_class_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div2, t6);
    				}
    			}

    			if (dirty & /*$settings*/ 256) {
    				toggle_class(div1, "active", /*$settings*/ ctx[8].show);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			/*input_binding*/ ctx[17](null);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const csvHeaderRows = 5;

    function instance($$self, $$props, $$invalidate) {
    	let $csvFile;
    	let $sheets;
    	let $settings;
    	let $svg;
    	validate_store(csvFile, "csvFile");
    	component_subscribe($$self, csvFile, $$value => $$invalidate(5, $csvFile = $$value));
    	validate_store(sheets, "sheets");
    	component_subscribe($$self, sheets, $$value => $$invalidate(7, $sheets = $$value));
    	validate_store(settings, "settings");
    	component_subscribe($$self, settings, $$value => $$invalidate(8, $settings = $$value));
    	validate_store(svg, "svg");
    	component_subscribe($$self, svg, $$value => $$invalidate(9, $svg = $$value));
    	let userLang = navigator.language || navigator.userLanguage;
    	let badFile = false, file, csv = $csvFile.contents.join("\n");
    	const today = formatDate(new Date(), "_yymmdd");

    	function newFile() {
    		set_store_value(csvFile, $csvFile = { ...blancCSV });
    	}

    	function loadFile() {
    		if (!file.files) return;

    		if (file.files[0].name.includes(".csv")) {
    			set_store_value(csvFile, $csvFile.name = file.files[0].name.replace(".csv", ""), $csvFile);
    			let reader = new FileReader();
    			reader.readAsText(file.files[0]);

    			reader.onload = function (event) {
    				set_store_value(csvFile, $csvFile.contents = CSVToArray(event.target.result, csvHeaderRows), $csvFile); // csv file
    				$$invalidate(0, badFile = false);
    			};
    		} else {
    			$$invalidate(0, badFile = true);
    		}
    	}

    	let dlCSV, dlSVG, dlCNC, keys = {};

    	function handleKeyDown(e) {
    		keys[e.code] = true;
    		const key = code => (keys["AltLeft"] || keys["AltRight"]) && keys[code];
    		if (key("KeyO")) setTimeout(() => file.click(), 140);
    		if (key("KeyN")) newFile();
    		if (key("KeyV")) dlCSV.click();
    		if (key("KeyG")) dlSVG.click();
    		if (key("KeyC")) dlCNC.click();
    		if (key("KeyS")) set_store_value(settings, $settings.show = !$settings.show, $settings);
    	}

    	function handleKeyUp(e) {
    		delete keys[e.code];
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Import> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Import", $$slots, []);

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			file = $$value;
    			$$invalidate(1, file);
    		});
    	}

    	const mouseover_handler = () => $$invalidate(0, badFile = false);

    	function a0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			dlCSV = $$value;
    			$$invalidate(2, dlCSV);
    		});
    	}

    	function a1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			dlSVG = $$value;
    			$$invalidate(3, dlSVG);
    		});
    	}

    	function a2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			dlCNC = $$value;
    			$$invalidate(4, dlCNC);
    		});
    	}

    	const click_handler = () => set_store_value(settings, $settings.show = !$settings.show, $settings);

    	$$self.$capture_state = () => ({
    		Nest,
    		Gcode,
    		settings,
    		panels,
    		sheets,
    		csvFile,
    		blancCSV,
    		svg,
    		saveAs: FileSaver_min.saveAs,
    		formatDate,
    		CSVToArray,
    		beforeUpdate,
    		userLang,
    		badFile,
    		file,
    		csv,
    		csvHeaderRows,
    		today,
    		newFile,
    		loadFile,
    		dlCSV,
    		dlSVG,
    		dlCNC,
    		keys,
    		handleKeyDown,
    		handleKeyUp,
    		$csvFile,
    		cnc,
    		$sheets,
    		$settings,
    		$svg
    	});

    	$$self.$inject_state = $$props => {
    		if ("userLang" in $$props) $$invalidate(10, userLang = $$props.userLang);
    		if ("badFile" in $$props) $$invalidate(0, badFile = $$props.badFile);
    		if ("file" in $$props) $$invalidate(1, file = $$props.file);
    		if ("csv" in $$props) $$invalidate(11, csv = $$props.csv);
    		if ("dlCSV" in $$props) $$invalidate(2, dlCSV = $$props.dlCSV);
    		if ("dlSVG" in $$props) $$invalidate(3, dlSVG = $$props.dlSVG);
    		if ("dlCNC" in $$props) $$invalidate(4, dlCNC = $$props.dlCNC);
    		if ("keys" in $$props) keys = $$props.keys;
    		if ("cnc" in $$props) $$invalidate(6, cnc = $$props.cnc);
    	};

    	let cnc;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$sheets, $settings, $csvFile*/ 416) {
    			 $$invalidate(6, cnc = () => Gcode($sheets, $settings.material, $csvFile.name));
    		}
    	};

    	return [
    		badFile,
    		file,
    		dlCSV,
    		dlSVG,
    		dlCNC,
    		$csvFile,
    		cnc,
    		$sheets,
    		$settings,
    		$svg,
    		userLang,
    		csv,
    		today,
    		newFile,
    		loadFile,
    		handleKeyDown,
    		handleKeyUp,
    		input_binding,
    		mouseover_handler,
    		a0_binding,
    		a1_binding,
    		a2_binding,
    		click_handler
    	];
    }

    class Import extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Import",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/components/CSV.svelte generated by Svelte v3.24.1 */
    const file = "src/components/CSV.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	child_ctx[19] = list;
    	child_ctx[20] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	return child_ctx;
    }

    // (77:4) {#if $csvFile.name}
    function create_if_block$1(ctx) {
    	let t0;
    	let ul0;
    	let li0;
    	let t2;
    	let li1;
    	let t3;
    	let li2;
    	let input;
    	let t4;
    	let ul1;
    	let li3;
    	let t6;
    	let li4;
    	let t8;
    	let li5;
    	let t10;
    	let li6;
    	let t12;
    	let each_1_anchor;
    	let mounted;
    	let dispose;
    	let if_block = /*$csvFile*/ ctx[1].errors.length && create_if_block_1(ctx);
    	let each_value = /*lines*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			ul0 = element("ul");
    			li0 = element("li");
    			li0.textContent = "PROJECT:";
    			t2 = space();
    			li1 = element("li");
    			t3 = space();
    			li2 = element("li");
    			input = element("input");
    			t4 = space();
    			ul1 = element("ul");
    			li3 = element("li");
    			li3.textContent = "Panel";
    			t6 = space();
    			li4 = element("li");
    			li4.textContent = "Q";
    			t8 = space();
    			li5 = element("li");
    			li5.textContent = "W";
    			t10 = space();
    			li6 = element("li");
    			li6.textContent = "H";
    			t12 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			attr_dev(li0, "class", "svelte-5c540f");
    			add_location(li0, file, 85, 8, 1563);
    			attr_dev(li1, "class", "svelte-5c540f");
    			add_location(li1, file, 86, 8, 1589);
    			attr_dev(input, "class", "title svelte-5c540f");
    			attr_dev(input, "type", "text");
    			add_location(input, file, 88, 10, 1622);
    			attr_dev(li2, "class", "svelte-5c540f");
    			add_location(li2, file, 87, 8, 1607);
    			attr_dev(ul0, "class", "svelte-5c540f");
    			add_location(ul0, file, 84, 6, 1550);
    			attr_dev(li3, "class", "svelte-5c540f");
    			add_location(li3, file, 96, 8, 1779);
    			attr_dev(li4, "class", "svelte-5c540f");
    			add_location(li4, file, 97, 8, 1838);
    			attr_dev(li5, "class", "svelte-5c540f");
    			add_location(li5, file, 98, 8, 1894);
    			attr_dev(li6, "class", "svelte-5c540f");
    			add_location(li6, file, 99, 8, 1950);
    			attr_dev(ul1, "class", "svelte-5c540f");
    			add_location(ul1, file, 95, 6, 1766);
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, ul0, anchor);
    			append_dev(ul0, li0);
    			append_dev(ul0, t2);
    			append_dev(ul0, li1);
    			append_dev(ul0, t3);
    			append_dev(ul0, li2);
    			append_dev(li2, input);
    			set_input_value(input, /*$csvFile*/ ctx[1].contents[0][1]);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, ul1, anchor);
    			append_dev(ul1, li3);
    			append_dev(ul1, t6);
    			append_dev(ul1, li4);
    			append_dev(ul1, t8);
    			append_dev(ul1, li5);
    			append_dev(ul1, t10);
    			append_dev(ul1, li6);
    			insert_dev(target, t12, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[7]),
    					listen_dev(li3, "click", /*click_handler*/ ctx[8], false, false, false),
    					listen_dev(li4, "click", /*click_handler_1*/ ctx[9], false, false, false),
    					listen_dev(li5, "click", /*click_handler_2*/ ctx[10], false, false, false),
    					listen_dev(li6, "click", /*click_handler_3*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*$csvFile*/ ctx[1].errors.length) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(t0.parentNode, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*$csvFile*/ 2 && input.value !== /*$csvFile*/ ctx[1].contents[0][1]) {
    				set_input_value(input, /*$csvFile*/ ctx[1].contents[0][1]);
    			}

    			if (dirty & /*$activePanel, lines, $settings, highlight*/ 13) {
    				each_value = /*lines*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(ul0);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(ul1);
    			if (detaching) detach_dev(t12);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(77:4) {#if $csvFile.name}",
    		ctx
    	});

    	return block;
    }

    // (78:6) {#if $csvFile.errors.length}
    function create_if_block_1(ctx) {
    	let h5;
    	let t0;
    	let t1_value = (/*$csvFile*/ ctx[1].errors.length > 1 ? "S" : "") + "";
    	let t1;
    	let t2;
    	let t3;
    	let each_1_anchor;
    	let each_value_1 = /*$csvFile*/ ctx[1].errors;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			h5 = element("h5");
    			t0 = text("ERROR");
    			t1 = text(t1_value);
    			t2 = text(":");
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			add_location(h5, file, 78, 8, 1394);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h5, anchor);
    			append_dev(h5, t0);
    			append_dev(h5, t1);
    			append_dev(h5, t2);
    			insert_dev(target, t3, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$csvFile*/ 2 && t1_value !== (t1_value = (/*$csvFile*/ ctx[1].errors.length > 1 ? "S" : "") + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*$csvFile*/ 2) {
    				each_value_1 = /*$csvFile*/ ctx[1].errors;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h5);
    			if (detaching) detach_dev(t3);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(78:6) {#if $csvFile.errors.length}",
    		ctx
    	});

    	return block;
    }

    // (80:8) {#each $csvFile.errors as error}
    function create_each_block_1(ctx) {
    	let p;
    	let t_value = /*error*/ ctx[21] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file, 80, 10, 1500);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$csvFile*/ 2 && t_value !== (t_value = /*error*/ ctx[21] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(80:8) {#each $csvFile.errors as error}",
    		ctx
    	});

    	return block;
    }

    // (102:6) {#each lines as line}
    function create_each_block(ctx) {
    	let ul;
    	let li0;
    	let input0;
    	let t0;
    	let li1;
    	let input1;
    	let t1;
    	let li2;
    	let input2;
    	let input2_max_value;
    	let t2;
    	let li3;
    	let input3;
    	let input3_max_value;
    	let t3;
    	let ul_class_value;
    	let mounted;
    	let dispose;

    	function input0_input_handler() {
    		/*input0_input_handler*/ ctx[12].call(input0, /*each_value*/ ctx[19], /*line_index*/ ctx[20]);
    	}

    	function input1_input_handler() {
    		/*input1_input_handler*/ ctx[13].call(input1, /*each_value*/ ctx[19], /*line_index*/ ctx[20]);
    	}

    	function input2_input_handler() {
    		/*input2_input_handler*/ ctx[14].call(input2, /*each_value*/ ctx[19], /*line_index*/ ctx[20]);
    	}

    	function input3_input_handler() {
    		/*input3_input_handler*/ ctx[15].call(input3, /*each_value*/ ctx[19], /*line_index*/ ctx[20]);
    	}

    	function mouseenter_handler(...args) {
    		return /*mouseenter_handler*/ ctx[16](/*line*/ ctx[18], ...args);
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			li0 = element("li");
    			input0 = element("input");
    			t0 = space();
    			li1 = element("li");
    			input1 = element("input");
    			t1 = space();
    			li2 = element("li");
    			input2 = element("input");
    			t2 = space();
    			li3 = element("li");
    			input3 = element("input");
    			t3 = space();
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "svelte-5c540f");
    			add_location(input0, file, 107, 12, 2251);
    			attr_dev(li0, "class", "svelte-5c540f");
    			add_location(li0, file, 106, 10, 2234);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "min", "0");
    			attr_dev(input1, "max", "100");
    			attr_dev(input1, "class", "svelte-5c540f");
    			add_location(input1, file, 110, 12, 2362);
    			attr_dev(li1, "class", "svelte-5c540f");
    			add_location(li1, file, 109, 10, 2345);
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "min", "0");
    			attr_dev(input2, "max", input2_max_value = /*$settings*/ ctx[3].material.width - /*$settings*/ ctx[3].material.margins * 2);
    			attr_dev(input2, "step", "0.03125");
    			attr_dev(input2, "class", "svelte-5c540f");
    			add_location(input2, file, 118, 12, 2563);
    			attr_dev(li2, "class", "svelte-5c540f");
    			add_location(li2, file, 117, 10, 2546);
    			attr_dev(input3, "type", "number");
    			attr_dev(input3, "min", "0");
    			attr_dev(input3, "max", input3_max_value = /*$settings*/ ctx[3].material.height - /*$settings*/ ctx[3].material.margins * 2);
    			attr_dev(input3, "step", "0.03125");
    			attr_dev(input3, "class", "svelte-5c540f");
    			add_location(input3, file, 127, 12, 2849);
    			attr_dev(li3, "class", "svelte-5c540f");
    			add_location(li3, file, 126, 10, 2832);

    			attr_dev(ul, "class", ul_class_value = "" + (null_to_empty(/*$activePanel*/ ctx[2] == /*line*/ ctx[18][0]
    			? "active"
    			: "") + " svelte-5c540f"));

    			add_location(ul, file, 102, 8, 2046);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li0);
    			append_dev(li0, input0);
    			set_input_value(input0, /*line*/ ctx[18][0]);
    			append_dev(ul, t0);
    			append_dev(ul, li1);
    			append_dev(li1, input1);
    			set_input_value(input1, /*line*/ ctx[18][1]);
    			append_dev(ul, t1);
    			append_dev(ul, li2);
    			append_dev(li2, input2);
    			set_input_value(input2, /*line*/ ctx[18][2]);
    			append_dev(ul, t2);
    			append_dev(ul, li3);
    			append_dev(li3, input3);
    			set_input_value(input3, /*line*/ ctx[18][3]);
    			append_dev(ul, t3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", input0_input_handler),
    					listen_dev(input0, "focus", highlight, false, false, false),
    					listen_dev(input1, "input", input1_input_handler),
    					listen_dev(input1, "focus", highlight, false, false, false),
    					listen_dev(input2, "input", input2_input_handler),
    					listen_dev(input2, "focus", highlight, false, false, false),
    					listen_dev(input3, "input", input3_input_handler),
    					listen_dev(input3, "focus", highlight, false, false, false),
    					listen_dev(ul, "mouseenter", mouseenter_handler, false, false, false),
    					listen_dev(ul, "mouseleave", /*mouseleave_handler*/ ctx[17], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*lines*/ 1 && input0.value !== /*line*/ ctx[18][0]) {
    				set_input_value(input0, /*line*/ ctx[18][0]);
    			}

    			if (dirty & /*lines*/ 1 && to_number(input1.value) !== /*line*/ ctx[18][1]) {
    				set_input_value(input1, /*line*/ ctx[18][1]);
    			}

    			if (dirty & /*$settings*/ 8 && input2_max_value !== (input2_max_value = /*$settings*/ ctx[3].material.width - /*$settings*/ ctx[3].material.margins * 2)) {
    				attr_dev(input2, "max", input2_max_value);
    			}

    			if (dirty & /*lines*/ 1 && to_number(input2.value) !== /*line*/ ctx[18][2]) {
    				set_input_value(input2, /*line*/ ctx[18][2]);
    			}

    			if (dirty & /*$settings*/ 8 && input3_max_value !== (input3_max_value = /*$settings*/ ctx[3].material.height - /*$settings*/ ctx[3].material.margins * 2)) {
    				attr_dev(input3, "max", input3_max_value);
    			}

    			if (dirty & /*lines*/ 1 && to_number(input3.value) !== /*line*/ ctx[18][3]) {
    				set_input_value(input3, /*line*/ ctx[18][3]);
    			}

    			if (dirty & /*$activePanel, lines*/ 5 && ul_class_value !== (ul_class_value = "" + (null_to_empty(/*$activePanel*/ ctx[2] == /*line*/ ctx[18][0]
    			? "active"
    			: "") + " svelte-5c540f"))) {
    				attr_dev(ul, "class", ul_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(102:6) {#each lines as line}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let ul;
    	let mounted;
    	let dispose;
    	let if_block = /*$csvFile*/ ctx[1].name && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			ul = element("ul");
    			ul.textContent = "+";
    			attr_dev(ul, "class", "new-row svelte-5c540f");
    			add_location(ul, file, 138, 4, 3151);
    			attr_dev(div0, "class", "svelte-5c540f");
    			add_location(div0, file, 75, 2, 1321);
    			attr_dev(div1, "class", "wrapper svelte-5c540f");
    			add_location(div1, file, 74, 0, 1297);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div0, t0);
    			append_dev(div0, ul);

    			if (!mounted) {
    				dispose = listen_dev(ul, "click", /*addRow*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$csvFile*/ ctx[1].name) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div0, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const csvHeaderRows$1 = 5;

    function highlight() {
    	this.select();
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $csvFile;
    	let $activePanel;
    	let $settings;
    	validate_store(csvFile, "csvFile");
    	component_subscribe($$self, csvFile, $$value => $$invalidate(1, $csvFile = $$value));
    	validate_store(activePanel, "activePanel");
    	component_subscribe($$self, activePanel, $$value => $$invalidate(2, $activePanel = $$value));
    	validate_store(settings, "settings");
    	component_subscribe($$self, settings, $$value => $$invalidate(3, $settings = $$value));

    	function addRow() {
    		let row = [lines.length + 1,,];
    		set_store_value(csvFile, $csvFile.contents = [...$csvFile.contents, row], $csvFile);
    	}

    	function sortAscending(index) {
    		//add support for alpha numberic
    		$$invalidate(0, lines = lines.sort((a, b) => a[index] - b[index]));
    	}

    	function sortDescending(index) {
    		$$invalidate(0, lines = lines.sort((a, b) => b[index] - a[index]));
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CSV> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("CSV", $$slots, []);

    	function input_input_handler() {
    		$csvFile.contents[0][1] = this.value;
    		csvFile.set($csvFile);
    	}

    	const click_handler = () => sortAscending(0);
    	const click_handler_1 = () => sortDescending(1);
    	const click_handler_2 = () => sortDescending(2);
    	const click_handler_3 = () => sortDescending(3);

    	function input0_input_handler(each_value, line_index) {
    		each_value[line_index][0] = this.value;
    		($$invalidate(0, lines), $$invalidate(1, $csvFile));
    	}

    	function input1_input_handler(each_value, line_index) {
    		each_value[line_index][1] = to_number(this.value);
    		($$invalidate(0, lines), $$invalidate(1, $csvFile));
    	}

    	function input2_input_handler(each_value, line_index) {
    		each_value[line_index][2] = to_number(this.value);
    		($$invalidate(0, lines), $$invalidate(1, $csvFile));
    	}

    	function input3_input_handler(each_value, line_index) {
    		each_value[line_index][3] = to_number(this.value);
    		($$invalidate(0, lines), $$invalidate(1, $csvFile));
    	}

    	const mouseenter_handler = line => set_store_value(activePanel, $activePanel = line[0]);
    	const mouseleave_handler = () => set_store_value(activePanel, $activePanel = "");

    	$$self.$capture_state = () => ({
    		sheets,
    		csvFile,
    		settings,
    		panels,
    		activePanel,
    		trunc,
    		csvHeaderRows: csvHeaderRows$1,
    		highlight,
    		addRow,
    		sortAscending,
    		sortDescending,
    		lines,
    		$csvFile,
    		$activePanel,
    		$settings
    	});

    	$$self.$inject_state = $$props => {
    		if ("lines" in $$props) $$invalidate(0, lines = $$props.lines);
    	};

    	let lines;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$csvFile*/ 2) {
    			 $$invalidate(0, lines = $csvFile.contents.slice(csvHeaderRows$1));
    		}
    	};

    	return [
    		lines,
    		$csvFile,
    		$activePanel,
    		$settings,
    		addRow,
    		sortAscending,
    		sortDescending,
    		input_input_handler,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		mouseenter_handler,
    		mouseleave_handler
    	];
    }

    class CSV extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CSV",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/components/Viewer.svelte generated by Svelte v3.24.1 */

    const file$1 = "src/components/Viewer.svelte";

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	return child_ctx;
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	child_ctx[18] = i;
    	return child_ctx;
    }

    // (123:0) {#if displayInfo}
    function create_if_block$2(ctx) {
    	let div;
    	let h4;
    	let t0_value = /*$sheets*/ ctx[7][/*id*/ ctx[0]].id + "";
    	let t0;
    	let t1;
    	let p0;
    	let t2;
    	let t3_value = trunc(/*$sheets*/ ctx[7][/*id*/ ctx[0]].area / 144, 2) + "";
    	let t3;
    	let t4;
    	let sup0;
    	let t6;
    	let p1;
    	let t7;
    	let t8_value = trunc(/*$sheets*/ ctx[7][/*id*/ ctx[0]].waste_area / 144, 2) + "";
    	let t8;
    	let t9;
    	let sup1;
    	let t11;
    	let p2;
    	let t12;
    	let t13_value = trunc(/*$sheets*/ ctx[7][/*id*/ ctx[0]].waste_ratio * 100, 2) + "";
    	let t13;
    	let t14;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			t0 = text(t0_value);
    			t1 = space();
    			p0 = element("p");
    			t2 = text("area des panneaux: ");
    			t3 = text(t3_value);
    			t4 = text(" pi");
    			sup0 = element("sup");
    			sup0.textContent = "2";
    			t6 = space();
    			p1 = element("p");
    			t7 = text("area de perte:\n      ");
    			t8 = text(t8_value);
    			t9 = text("\n      pi");
    			sup1 = element("sup");
    			sup1.textContent = "2";
    			t11 = space();
    			p2 = element("p");
    			t12 = text("% de perte: ");
    			t13 = text(t13_value);
    			t14 = text("%");
    			add_location(h4, file$1, 124, 4, 2366);
    			attr_dev(sup0, "class", "svelte-1nnwdec");
    			add_location(sup0, file$1, 125, 63, 2455);
    			add_location(p0, file$1, 125, 4, 2396);
    			attr_dev(sup1, "class", "svelte-1nnwdec");
    			add_location(sup1, file$1, 129, 8, 2556);
    			add_location(p1, file$1, 126, 4, 2476);
    			add_location(p2, file$1, 131, 4, 2582);
    			attr_dev(div, "class", "infocard svelte-1nnwdec");
    			set_style(div, "left", /*left*/ ctx[3] + "px");
    			set_style(div, "top", /*top*/ ctx[2] + "px");
    			add_location(div, file$1, 123, 2, 2301);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);
    			append_dev(h4, t0);
    			append_dev(div, t1);
    			append_dev(div, p0);
    			append_dev(p0, t2);
    			append_dev(p0, t3);
    			append_dev(p0, t4);
    			append_dev(p0, sup0);
    			append_dev(div, t6);
    			append_dev(div, p1);
    			append_dev(p1, t7);
    			append_dev(p1, t8);
    			append_dev(p1, t9);
    			append_dev(p1, sup1);
    			append_dev(div, t11);
    			append_dev(div, p2);
    			append_dev(p2, t12);
    			append_dev(p2, t13);
    			append_dev(p2, t14);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$sheets, id*/ 129 && t0_value !== (t0_value = /*$sheets*/ ctx[7][/*id*/ ctx[0]].id + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*$sheets, id*/ 129 && t3_value !== (t3_value = trunc(/*$sheets*/ ctx[7][/*id*/ ctx[0]].area / 144, 2) + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*$sheets, id*/ 129 && t8_value !== (t8_value = trunc(/*$sheets*/ ctx[7][/*id*/ ctx[0]].waste_area / 144, 2) + "")) set_data_dev(t8, t8_value);
    			if (dirty & /*$sheets, id*/ 129 && t13_value !== (t13_value = trunc(/*$sheets*/ ctx[7][/*id*/ ctx[0]].waste_ratio * 100, 2) + "")) set_data_dev(t13, t13_value);

    			if (dirty & /*left*/ 8) {
    				set_style(div, "left", /*left*/ ctx[3] + "px");
    			}

    			if (dirty & /*top*/ 4) {
    				set_style(div, "top", /*top*/ ctx[2] + "px");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(123:0) {#if displayInfo}",
    		ctx
    	});

    	return block;
    }

    // (163:8) {#each sheet.group as panel}
    function create_each_block_1$1(ctx) {
    	let rect;
    	let rect_class_value;
    	let rect_id_value;
    	let rect_x_value;
    	let rect_y_value;
    	let rect_width_value;
    	let rect_height_value;
    	let text_1;
    	let t_value = /*panel*/ ctx[19].id + "";
    	let t;
    	let text_1_class_value;
    	let text_1_x_value;
    	let text_1_y_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			rect = svg_element("rect");
    			text_1 = svg_element("text");
    			t = text(t_value);
    			set_style(rect, "stroke-width", /*$settings*/ ctx[6].cnc[/*$settings*/ ctx[6].tool].diameter * /*scale*/ ctx[8] + "px");

    			attr_dev(rect, "class", rect_class_value = "panel " + (/*$activePanel*/ ctx[5] == /*panel*/ ctx[19].id
    			? "active"
    			: "") + " print" + " svelte-1nnwdec");

    			attr_dev(rect, "id", rect_id_value = /*panel*/ ctx[19].id);
    			attr_dev(rect, "x", rect_x_value = (/*panel*/ ctx[19].x0 + /*shift*/ ctx[14](/*index*/ ctx[18]).x) * /*scale*/ ctx[8]);
    			attr_dev(rect, "y", rect_y_value = (/*flipY*/ ctx[13](/*panel*/ ctx[19].y0, /*panel*/ ctx[19].height) + /*shift*/ ctx[14](/*index*/ ctx[18]).y) * /*scale*/ ctx[8]);
    			attr_dev(rect, "width", rect_width_value = /*panel*/ ctx[19].width * /*scale*/ ctx[8]);
    			attr_dev(rect, "height", rect_height_value = /*panel*/ ctx[19].height * /*scale*/ ctx[8]);
    			add_location(rect, file$1, 163, 10, 3972);
    			set_style(text_1, "font-size", Math.min(/*panel*/ ctx[19].height * 0.8, 5) * /*scale*/ ctx[8] + "px");

    			attr_dev(text_1, "class", text_1_class_value = "id " + (/*$activePanel*/ ctx[5] == /*panel*/ ctx[19].id
    			? "active"
    			: "") + " print" + " svelte-1nnwdec");

    			attr_dev(text_1, "x", text_1_x_value = (/*panel*/ ctx[19].x0 + /*shift*/ ctx[14](/*index*/ ctx[18]).x + /*panel*/ ctx[19].width / 2) * /*scale*/ ctx[8]);
    			attr_dev(text_1, "y", text_1_y_value = (/*flipY*/ ctx[13](/*panel*/ ctx[19].y0, /*panel*/ ctx[19].height) + /*shift*/ ctx[14](/*index*/ ctx[18]).y + Math.min(/*panel*/ ctx[19].height * 0.8, 5) / 3 + /*panel*/ ctx[19].height / 2) * /*scale*/ ctx[8]);
    			add_location(text_1, file$1, 174, 10, 4487);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, rect, anchor);
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t);

    			if (!mounted) {
    				dispose = [
    					listen_dev(rect, "mouseover", /*panelHoverOn*/ ctx[9], false, false, false),
    					listen_dev(rect, "mouseleave", /*panelHoverOff*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$settings*/ 64) {
    				set_style(rect, "stroke-width", /*$settings*/ ctx[6].cnc[/*$settings*/ ctx[6].tool].diameter * /*scale*/ ctx[8] + "px");
    			}

    			if (dirty & /*$activePanel, $sheets*/ 160 && rect_class_value !== (rect_class_value = "panel " + (/*$activePanel*/ ctx[5] == /*panel*/ ctx[19].id
    			? "active"
    			: "") + " print" + " svelte-1nnwdec")) {
    				attr_dev(rect, "class", rect_class_value);
    			}

    			if (dirty & /*$sheets*/ 128 && rect_id_value !== (rect_id_value = /*panel*/ ctx[19].id)) {
    				attr_dev(rect, "id", rect_id_value);
    			}

    			if (dirty & /*$sheets*/ 128 && rect_x_value !== (rect_x_value = (/*panel*/ ctx[19].x0 + /*shift*/ ctx[14](/*index*/ ctx[18]).x) * /*scale*/ ctx[8])) {
    				attr_dev(rect, "x", rect_x_value);
    			}

    			if (dirty & /*$sheets*/ 128 && rect_y_value !== (rect_y_value = (/*flipY*/ ctx[13](/*panel*/ ctx[19].y0, /*panel*/ ctx[19].height) + /*shift*/ ctx[14](/*index*/ ctx[18]).y) * /*scale*/ ctx[8])) {
    				attr_dev(rect, "y", rect_y_value);
    			}

    			if (dirty & /*$sheets*/ 128 && rect_width_value !== (rect_width_value = /*panel*/ ctx[19].width * /*scale*/ ctx[8])) {
    				attr_dev(rect, "width", rect_width_value);
    			}

    			if (dirty & /*$sheets*/ 128 && rect_height_value !== (rect_height_value = /*panel*/ ctx[19].height * /*scale*/ ctx[8])) {
    				attr_dev(rect, "height", rect_height_value);
    			}

    			if (dirty & /*$sheets*/ 128 && t_value !== (t_value = /*panel*/ ctx[19].id + "")) set_data_dev(t, t_value);

    			if (dirty & /*$sheets*/ 128) {
    				set_style(text_1, "font-size", Math.min(/*panel*/ ctx[19].height * 0.8, 5) * /*scale*/ ctx[8] + "px");
    			}

    			if (dirty & /*$activePanel, $sheets*/ 160 && text_1_class_value !== (text_1_class_value = "id " + (/*$activePanel*/ ctx[5] == /*panel*/ ctx[19].id
    			? "active"
    			: "") + " print" + " svelte-1nnwdec")) {
    				attr_dev(text_1, "class", text_1_class_value);
    			}

    			if (dirty & /*$sheets*/ 128 && text_1_x_value !== (text_1_x_value = (/*panel*/ ctx[19].x0 + /*shift*/ ctx[14](/*index*/ ctx[18]).x + /*panel*/ ctx[19].width / 2) * /*scale*/ ctx[8])) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty & /*$sheets*/ 128 && text_1_y_value !== (text_1_y_value = (/*flipY*/ ctx[13](/*panel*/ ctx[19].y0, /*panel*/ ctx[19].height) + /*shift*/ ctx[14](/*index*/ ctx[18]).y + Math.min(/*panel*/ ctx[19].height * 0.8, 5) / 3 + /*panel*/ ctx[19].height / 2) * /*scale*/ ctx[8])) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(rect);
    			if (detaching) detach_dev(text_1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(163:8) {#each sheet.group as panel}",
    		ctx
    	});

    	return block;
    }

    // (149:4) {#each $sheets as sheet, index}
    function create_each_block$1(ctx) {
    	let g0;
    	let rect;
    	let rect_id_value;
    	let rect_x_value;
    	let rect_y_value;
    	let rect_width_value;
    	let rect_height_value;
    	let g1;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*sheet*/ ctx[16].group;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			g0 = svg_element("g");
    			rect = svg_element("rect");
    			g1 = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			set_style(rect, "stroke-width", /*$settings*/ ctx[6].material.margins * /*scale*/ ctx[8] + "px");
    			attr_dev(rect, "class", "sheet print svelte-1nnwdec");
    			attr_dev(rect, "id", rect_id_value = /*index*/ ctx[18]);
    			attr_dev(rect, "x", rect_x_value = (/*shift*/ ctx[14](/*index*/ ctx[18]).x + /*$settings*/ ctx[6].material.margins / 2) * /*scale*/ ctx[8]);
    			attr_dev(rect, "y", rect_y_value = (/*shift*/ ctx[14](/*index*/ ctx[18]).y + /*$settings*/ ctx[6].material.margins / 2) * /*scale*/ ctx[8]);
    			attr_dev(rect, "width", rect_width_value = (/*sheet*/ ctx[16].sheet_width - /*$settings*/ ctx[6].material.margins) * /*scale*/ ctx[8]);
    			attr_dev(rect, "height", rect_height_value = (/*sheet*/ ctx[16].sheet_height - /*$settings*/ ctx[6].material.margins) * /*scale*/ ctx[8]);
    			add_location(rect, file$1, 150, 8, 3376);
    			attr_dev(g0, "id", "sheets");
    			add_location(g0, file$1, 149, 6, 3352);
    			attr_dev(g1, "id", "panels");
    			add_location(g1, file$1, 161, 6, 3909);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g0, anchor);
    			append_dev(g0, rect);
    			insert_dev(target, g1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g1, null);
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(rect, "mouseover", /*showInfo*/ ctx[11], false, false, false),
    					listen_dev(rect, "mouseleave", /*hideInfo*/ ctx[12], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$settings*/ 64) {
    				set_style(rect, "stroke-width", /*$settings*/ ctx[6].material.margins * /*scale*/ ctx[8] + "px");
    			}

    			if (dirty & /*$settings*/ 64 && rect_x_value !== (rect_x_value = (/*shift*/ ctx[14](/*index*/ ctx[18]).x + /*$settings*/ ctx[6].material.margins / 2) * /*scale*/ ctx[8])) {
    				attr_dev(rect, "x", rect_x_value);
    			}

    			if (dirty & /*$settings*/ 64 && rect_y_value !== (rect_y_value = (/*shift*/ ctx[14](/*index*/ ctx[18]).y + /*$settings*/ ctx[6].material.margins / 2) * /*scale*/ ctx[8])) {
    				attr_dev(rect, "y", rect_y_value);
    			}

    			if (dirty & /*$sheets, $settings*/ 192 && rect_width_value !== (rect_width_value = (/*sheet*/ ctx[16].sheet_width - /*$settings*/ ctx[6].material.margins) * /*scale*/ ctx[8])) {
    				attr_dev(rect, "width", rect_width_value);
    			}

    			if (dirty & /*$sheets, $settings*/ 192 && rect_height_value !== (rect_height_value = (/*sheet*/ ctx[16].sheet_height - /*$settings*/ ctx[6].material.margins) * /*scale*/ ctx[8])) {
    				attr_dev(rect, "height", rect_height_value);
    			}

    			if (dirty & /*Math, $sheets, scale, $activePanel, shift, flipY, $settings, panelHoverOn, panelHoverOff*/ 26592) {
    				each_value_1 = /*sheet*/ ctx[16].group;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g0);
    			if (detaching) detach_dev(g1);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(149:4) {#each $sheets as sheet, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let t0;
    	let div;
    	let svg_1;
    	let t1;
    	let svg_1_width_value;
    	let svg_1_height_value;
    	let svg_1_viewBox_value;
    	let if_block = /*displayInfo*/ ctx[1] && create_if_block$2(ctx);
    	let each_value = /*$sheets*/ ctx[7];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			div = element("div");
    			svg_1 = svg_element("svg");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = text(">");
    			attr_dev(svg_1, "class", "print svelte-1nnwdec");
    			attr_dev(svg_1, "version", "1.1");
    			attr_dev(svg_1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg_1, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg_1, "width", svg_1_width_value = /*shift*/ ctx[14](/*$sheets*/ ctx[7].length - 1).w * /*scale*/ ctx[8] || 0);
    			attr_dev(svg_1, "height", svg_1_height_value = /*shift*/ ctx[14](/*$sheets*/ ctx[7].length - 1).h * /*scale*/ ctx[8] || 0);
    			attr_dev(svg_1, "viewBox", svg_1_viewBox_value = "0 0 " + (/*shift*/ ctx[14](/*$sheets*/ ctx[7].length - 1).w * /*scale*/ ctx[8] || 0) + " " + (/*shift*/ ctx[14](/*$sheets*/ ctx[7].length - 1).h * /*scale*/ ctx[8] || 0));
    			attr_dev(svg_1, "preserveAspectRatio", "xMidYMid meet");
    			add_location(svg_1, file$1, 139, 2, 2927);
    			attr_dev(div, "class", "viewer svelte-1nnwdec");
    			add_location(div, file$1, 138, 0, 2882);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, svg_1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(svg_1, null);
    			}

    			append_dev(svg_1, t1);
    			/*div_binding*/ ctx[15](div);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*displayInfo*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(t0.parentNode, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*$sheets, Math, scale, $activePanel, shift, flipY, $settings, panelHoverOn, panelHoverOff, showInfo, hideInfo*/ 32736) {
    				each_value = /*$sheets*/ ctx[7];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(svg_1, t1);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*$sheets*/ 128 && svg_1_width_value !== (svg_1_width_value = /*shift*/ ctx[14](/*$sheets*/ ctx[7].length - 1).w * /*scale*/ ctx[8] || 0)) {
    				attr_dev(svg_1, "width", svg_1_width_value);
    			}

    			if (dirty & /*$sheets*/ 128 && svg_1_height_value !== (svg_1_height_value = /*shift*/ ctx[14](/*$sheets*/ ctx[7].length - 1).h * /*scale*/ ctx[8] || 0)) {
    				attr_dev(svg_1, "height", svg_1_height_value);
    			}

    			if (dirty & /*$sheets*/ 128 && svg_1_viewBox_value !== (svg_1_viewBox_value = "0 0 " + (/*shift*/ ctx[14](/*$sheets*/ ctx[7].length - 1).w * /*scale*/ ctx[8] || 0) + " " + (/*shift*/ ctx[14](/*$sheets*/ ctx[7].length - 1).h * /*scale*/ ctx[8] || 0))) {
    				attr_dev(svg_1, "viewBox", svg_1_viewBox_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			/*div_binding*/ ctx[15](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $activePanel;
    	let $settings;
    	let $sheets;
    	validate_store(activePanel, "activePanel");
    	component_subscribe($$self, activePanel, $$value => $$invalidate(5, $activePanel = $$value));
    	validate_store(settings, "settings");
    	component_subscribe($$self, settings, $$value => $$invalidate(6, $settings = $$value));
    	validate_store(sheets, "sheets");
    	component_subscribe($$self, sheets, $$value => $$invalidate(7, $sheets = $$value));
    	let id, displayInfo = false, top = 0, left = 0, scale = 90, svgFile; // inches to pixels

    	// afterUpdate(() => {
    	//   if ($sheets.length) {
    	//     $svg = svgFile.innerHTML.toString()
    	//   }
    	// })
    	function panelHoverOn() {
    		set_store_value(activePanel, $activePanel = this.id);
    	}

    	function panelHoverOff() {
    		set_store_value(activePanel, $activePanel = "");
    	}

    	function showInfo() {
    		$$invalidate(1, displayInfo = true);
    		let rect = this.getBoundingClientRect();
    		$$invalidate(2, top = (rect.bottom - rect.top) / 2 + rect.top);
    		$$invalidate(3, left = (rect.right - rect.left) / 2 + rect.left);
    		$$invalidate(0, id = this.id);
    	}

    	function hideInfo() {
    		$$invalidate(1, displayInfo = false);
    	}

    	function flipY(y, height) {
    		// return y
    		return $settings.material.height - height - y;
    	}

    	function shift(index) {
    		let maxColumns = 5,
    			rows = Math.ceil($sheets.length / maxColumns),
    			columns = Math.ceil($sheets.length / rows),
    			row = Math.ceil((index + 1) / columns) - 1,
    			column = index % columns,
    			x = column * $settings.material.width,
    			y = row * $settings.material.height,
    			w = columns * $settings.material.width,
    			h = rows * $settings.material.height;

    		return { x, y, w, h };
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Viewer> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Viewer", $$slots, []);

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			svgFile = $$value;
    			$$invalidate(4, svgFile);
    		});
    	}

    	$$self.$capture_state = () => ({
    		panels,
    		sheets,
    		settings,
    		svg,
    		activePanel,
    		trunc,
    		id,
    		displayInfo,
    		top,
    		left,
    		scale,
    		svgFile,
    		panelHoverOn,
    		panelHoverOff,
    		showInfo,
    		hideInfo,
    		flipY,
    		shift,
    		$activePanel,
    		$settings,
    		$sheets
    	});

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("displayInfo" in $$props) $$invalidate(1, displayInfo = $$props.displayInfo);
    		if ("top" in $$props) $$invalidate(2, top = $$props.top);
    		if ("left" in $$props) $$invalidate(3, left = $$props.left);
    		if ("scale" in $$props) $$invalidate(8, scale = $$props.scale);
    		if ("svgFile" in $$props) $$invalidate(4, svgFile = $$props.svgFile);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		id,
    		displayInfo,
    		top,
    		left,
    		svgFile,
    		$activePanel,
    		$settings,
    		$sheets,
    		scale,
    		panelHoverOn,
    		panelHoverOff,
    		showInfo,
    		hideInfo,
    		flipY,
    		shift,
    		div_binding
    	];
    }

    class Viewer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Viewer",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/Settings.svelte generated by Svelte v3.24.1 */
    const file$2 = "src/components/Settings.svelte";

    function create_fragment$3(ctx) {
    	let div17;
    	let div7;
    	let div1;
    	let h30;
    	let span0;
    	let t1;
    	let label0;
    	let input0;
    	let t2;
    	let div0;
    	let t3;
    	let div3;
    	let h31;
    	let span1;
    	let t5;
    	let label1;
    	let input1;
    	let t6;
    	let div2;
    	let t7;
    	let div4;
    	let h32;
    	let span2;
    	let t9;
    	let select;
    	let option0;
    	let span3;
    	let t11;
    	let option1;
    	let span4;
    	let t13;
    	let option2;
    	let span5;
    	let t15;
    	let option3;
    	let span6;
    	let t17;
    	let option4;
    	let span7;
    	let t19;
    	let option5;
    	let span8;
    	let t21;
    	let div5;
    	let h33;
    	let span9;
    	let t23;
    	let h50;
    	let span10;
    	let t25;
    	let input2;
    	let t26;
    	let h51;
    	let span11;
    	let t28;
    	let input3;
    	let t29;
    	let h52;
    	let span12;
    	let t31;
    	let input4;
    	let t32;
    	let div6;
    	let h53;
    	let span13;
    	let t34;
    	let input5;
    	let t35;
    	let div16;
    	let div8;
    	let h34;
    	let span14;
    	let t37;
    	let h54;
    	let span15;
    	let t39;
    	let input6;
    	let t40;
    	let div9;
    	let h55;
    	let span16;
    	let t42;
    	let input7;
    	let t43;
    	let div10;
    	let h56;
    	let span17;
    	let t45;
    	let input8;
    	let t46;
    	let div11;
    	let h57;
    	let span18;
    	let t48;
    	let input9;
    	let t49;
    	let span19;
    	let t51;
    	let div12;
    	let h58;
    	let span20;
    	let t53;
    	let input10;
    	let t54;
    	let span21;
    	let t56;
    	let div13;
    	let h59;
    	let span22;
    	let t58;
    	let input11;
    	let t59;
    	let span23;
    	let t61;
    	let div14;
    	let h510;
    	let span24;
    	let t63;
    	let input12;
    	let t64;
    	let span25;
    	let t66;
    	let div15;
    	let h511;
    	let span26;
    	let t68;
    	let input13;
    	let t69;
    	let span27;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div17 = element("div");
    			div7 = element("div");
    			div1 = element("div");
    			h30 = element("h3");
    			span0 = element("span");
    			span0.textContent = "Units:";
    			t1 = space();
    			label0 = element("label");
    			input0 = element("input");
    			t2 = space();
    			div0 = element("div");
    			t3 = space();
    			div3 = element("div");
    			h31 = element("h3");
    			span1 = element("span");
    			span1.textContent = "Nest from:";
    			t5 = space();
    			label1 = element("label");
    			input1 = element("input");
    			t6 = space();
    			div2 = element("div");
    			t7 = space();
    			div4 = element("div");
    			h32 = element("h3");
    			span2 = element("span");
    			span2.textContent = "Nest by:";
    			t9 = space();
    			select = element("select");
    			option0 = element("option");
    			span3 = element("span");
    			span3.textContent = "widest";
    			t11 = space();
    			option1 = element("option");
    			span4 = element("span");
    			span4.textContent = "narrowest";
    			t13 = space();
    			option2 = element("option");
    			span5 = element("span");
    			span5.textContent = "tallest";
    			t15 = space();
    			option3 = element("option");
    			span6 = element("span");
    			span6.textContent = "shortest";
    			t17 = space();
    			option4 = element("option");
    			span7 = element("span");
    			span7.textContent = "biggest";
    			t19 = space();
    			option5 = element("option");
    			span8 = element("span");
    			span8.textContent = "smallest";
    			t21 = space();
    			div5 = element("div");
    			h33 = element("h3");
    			span9 = element("span");
    			span9.textContent = "Sheet info:";
    			t23 = space();
    			h50 = element("h5");
    			span10 = element("span");
    			span10.textContent = "Width:";
    			t25 = space();
    			input2 = element("input");
    			t26 = space();
    			h51 = element("h5");
    			span11 = element("span");
    			span11.textContent = "Height:";
    			t28 = space();
    			input3 = element("input");
    			t29 = space();
    			h52 = element("h5");
    			span12 = element("span");
    			span12.textContent = "Thickness:";
    			t31 = space();
    			input4 = element("input");
    			t32 = space();
    			div6 = element("div");
    			h53 = element("h5");
    			span13 = element("span");
    			span13.textContent = "Margins:";
    			t34 = space();
    			input5 = element("input");
    			t35 = space();
    			div16 = element("div");
    			div8 = element("div");
    			h34 = element("h3");
    			span14 = element("span");
    			span14.textContent = "Profile cutting tool:";
    			t37 = space();
    			h54 = element("h5");
    			span15 = element("span");
    			span15.textContent = "Tool #:";
    			t39 = space();
    			input6 = element("input");
    			t40 = space();
    			div9 = element("div");
    			h55 = element("h5");
    			span16 = element("span");
    			span16.textContent = "Type:";
    			t42 = space();
    			input7 = element("input");
    			t43 = space();
    			div10 = element("div");
    			h56 = element("h5");
    			span17 = element("span");
    			span17.textContent = "Diameter:";
    			t45 = space();
    			input8 = element("input");
    			t46 = space();
    			div11 = element("div");
    			h57 = element("h5");
    			span18 = element("span");
    			span18.textContent = "Spindle speed:";
    			t48 = space();
    			input9 = element("input");
    			t49 = space();
    			span19 = element("span");
    			span19.textContent = "RPM";
    			t51 = space();
    			div12 = element("div");
    			h58 = element("h5");
    			span20 = element("span");
    			span20.textContent = "Feed rate:";
    			t53 = space();
    			input10 = element("input");
    			t54 = space();
    			span21 = element("span");
    			span21.textContent = "in/min";
    			t56 = space();
    			div13 = element("div");
    			h59 = element("h5");
    			span22 = element("span");
    			span22.textContent = "Plunge rate:";
    			t58 = space();
    			input11 = element("input");
    			t59 = space();
    			span23 = element("span");
    			span23.textContent = "in/min";
    			t61 = space();
    			div14 = element("div");
    			h510 = element("h5");
    			span24 = element("span");
    			span24.textContent = "Plunge ramp:";
    			t63 = space();
    			input12 = element("input");
    			t64 = space();
    			span25 = element("span");
    			span25.textContent = "in";
    			t66 = space();
    			div15 = element("div");
    			h511 = element("h5");
    			span26 = element("span");
    			span26.textContent = "Max depth/pass:";
    			t68 = space();
    			input13 = element("input");
    			t69 = space();
    			span27 = element("span");
    			span27.textContent = "in";
    			add_location(span0, file$2, 262, 52, 5052);
    			attr_dev(h30, "data-lang", /*userLang*/ ctx[1]);
    			attr_dev(h30, "data-fr", "Unités: ");
    			attr_dev(h30, "class", "svelte-izdltf");
    			add_location(h30, file$2, 262, 6, 5006);
    			attr_dev(input0, "type", "checkbox");
    			attr_dev(input0, "class", "svelte-izdltf");
    			add_location(input0, file$2, 263, 28, 5106);
    			attr_dev(div0, "class", "slider units svelte-izdltf");
    			attr_dev(div0, "data-lang", /*userLang*/ ctx[1]);
    			add_location(div0, file$2, 266, 8, 5193);
    			attr_dev(label0, "class", "switch svelte-izdltf");
    			add_location(label0, file$2, 263, 6, 5084);
    			attr_dev(div1, "class", "input-wrapper");
    			add_location(div1, file$2, 261, 4, 4972);
    			add_location(span1, file$2, 270, 8, 5370);
    			attr_dev(h31, "data-lang", /*userLang*/ ctx[1]);
    			attr_dev(h31, "data-fr", "Nest apartir de: ");
    			attr_dev(h31, "class", "svelte-izdltf");
    			add_location(h31, file$2, 269, 6, 5306);
    			attr_dev(input1, "type", "checkbox");
    			attr_dev(input1, "class", "svelte-izdltf");
    			add_location(input1, file$2, 272, 28, 5435);
    			attr_dev(div2, "class", "slider direction svelte-izdltf");
    			attr_dev(div2, "data-lang", /*userLang*/ ctx[1]);
    			add_location(div2, file$2, 275, 8, 5526);
    			attr_dev(label1, "class", "switch svelte-izdltf");
    			add_location(label1, file$2, 272, 6, 5413);
    			attr_dev(div3, "class", "input-wrapper");
    			add_location(div3, file$2, 268, 4, 5272);
    			add_location(span2, file$2, 279, 8, 5703);
    			attr_dev(h32, "data-lang", /*userLang*/ ctx[1]);
    			attr_dev(h32, "data-fr", "Nest par le: ");
    			attr_dev(h32, "class", "svelte-izdltf");
    			add_location(h32, file$2, 278, 6, 5643);
    			add_location(span3, file$2, 283, 10, 5878);
    			attr_dev(option0, "data-lang", /*userLang*/ ctx[1]);
    			attr_dev(option0, "data-fr", "plus large");
    			option0.__value = "widest";
    			option0.value = option0.__value;
    			add_location(option0, file$2, 282, 8, 5800);
    			add_location(span4, file$2, 286, 10, 6006);
    			attr_dev(option1, "data-lang", /*userLang*/ ctx[1]);
    			attr_dev(option1, "data-fr", "moins large");
    			option1.__value = "narrowest";
    			option1.value = option1.__value;
    			add_location(option1, file$2, 285, 8, 5924);
    			add_location(span5, file$2, 289, 10, 6133);
    			attr_dev(option2, "data-lang", /*userLang*/ ctx[1]);
    			attr_dev(option2, "data-fr", "plus haut");
    			option2.__value = "tallest";
    			option2.value = option2.__value;
    			add_location(option2, file$2, 288, 8, 6055);
    			add_location(span6, file$2, 292, 10, 6260);
    			attr_dev(option3, "data-lang", /*userLang*/ ctx[1]);
    			attr_dev(option3, "data-fr", "moins haut");
    			option3.__value = "shortest";
    			option3.value = option3.__value;
    			add_location(option3, file$2, 291, 8, 6180);
    			add_location(span7, file$2, 295, 10, 6387);
    			attr_dev(option4, "data-lang", /*userLang*/ ctx[1]);
    			attr_dev(option4, "data-fr", "plus grand");
    			option4.__value = "biggest";
    			option4.value = option4.__value;
    			add_location(option4, file$2, 294, 8, 6308);
    			add_location(span8, file$2, 298, 10, 6515);
    			attr_dev(option5, "data-lang", /*userLang*/ ctx[1]);
    			attr_dev(option5, "data-fr", "moins grand");
    			option5.__value = "smallest";
    			option5.value = option5.__value;
    			add_location(option5, file$2, 297, 8, 6434);
    			attr_dev(select, "class", "svelte-izdltf");
    			if (/*$settings*/ ctx[0].placementType === void 0) add_render_callback(() => /*select_change_handler*/ ctx[4].call(select));
    			add_location(select, file$2, 281, 6, 5744);
    			attr_dev(div4, "class", "input-wrapper");
    			add_location(div4, file$2, 277, 4, 5609);
    			add_location(span9, file$2, 304, 8, 6690);
    			attr_dev(h33, "data-lang", /*userLang*/ ctx[1]);
    			attr_dev(h33, "data-fr", "Info sur les feuilles: ");
    			attr_dev(h33, "class", "svelte-izdltf");
    			add_location(h33, file$2, 303, 6, 6620);
    			add_location(span10, file$2, 307, 8, 6790);
    			attr_dev(input2, "class", "input svelte-izdltf");
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "step", "0.0625");
    			add_location(input2, file$2, 308, 8, 6819);
    			attr_dev(h50, "data-lang", /*userLang*/ ctx[1]);
    			attr_dev(h50, "data-fr", "Largeur: ");
    			attr_dev(h50, "class", "svelte-izdltf");
    			add_location(h50, file$2, 306, 6, 6734);
    			add_location(span11, file$2, 315, 8, 7025);
    			attr_dev(input3, "class", "input svelte-izdltf");
    			attr_dev(input3, "type", "number");
    			attr_dev(input3, "step", "0.0625");
    			add_location(input3, file$2, 316, 8, 7055);
    			attr_dev(h51, "data-lang", /*userLang*/ ctx[1]);
    			attr_dev(h51, "data-fr", "Hauteur: ");
    			attr_dev(h51, "class", "svelte-izdltf");
    			add_location(h51, file$2, 314, 6, 6969);
    			add_location(span12, file$2, 323, 8, 7264);
    			attr_dev(input4, "class", "input svelte-izdltf");
    			attr_dev(input4, "type", "number");
    			attr_dev(input4, "step", "0.005");
    			add_location(input4, file$2, 324, 8, 7297);
    			attr_dev(h52, "data-lang", /*userLang*/ ctx[1]);
    			attr_dev(h52, "data-fr", "Épaisseur: ");
    			attr_dev(h52, "class", "svelte-izdltf");
    			add_location(h52, file$2, 322, 6, 7206);
    			attr_dev(div5, "class", "input-wrapper");
    			add_location(div5, file$2, 302, 4, 6586);
    			add_location(span13, file$2, 333, 8, 7547);
    			attr_dev(input5, "class", "input svelte-izdltf");
    			attr_dev(input5, "type", "number");
    			attr_dev(input5, "step", "0.05");
    			add_location(input5, file$2, 334, 8, 7578);
    			attr_dev(h53, "data-lang", /*userLang*/ ctx[1]);
    			attr_dev(h53, "data-fr", "Marge: ");
    			attr_dev(h53, "class", "svelte-izdltf");
    			add_location(h53, file$2, 332, 6, 7493);
    			attr_dev(div6, "class", "input-wrapper");
    			add_location(div6, file$2, 331, 4, 7459);
    			attr_dev(div7, "class", "general svelte-izdltf");
    			add_location(div7, file$2, 258, 2, 4860);
    			add_location(span14, file$2, 347, 8, 7948);
    			attr_dev(h34, "data-lang", /*userLang*/ ctx[1]);
    			attr_dev(h34, "data-fr", "Outil pour la decoupe: ");
    			attr_dev(h34, "class", "svelte-izdltf");
    			add_location(h34, file$2, 346, 6, 7878);
    			add_location(span15, file$2, 350, 8, 8058);
    			attr_dev(input6, "class", "input svelte-izdltf");
    			attr_dev(input6, "type", "number");
    			attr_dev(input6, "step", "1");
    			add_location(input6, file$2, 351, 8, 8088);
    			attr_dev(h54, "data-lang", /*userLang*/ ctx[1]);
    			attr_dev(h54, "data-fr", "Outil #: ");
    			attr_dev(h54, "class", "svelte-izdltf");
    			add_location(h54, file$2, 349, 6, 8002);
    			attr_dev(div8, "class", "input-wrapper");
    			add_location(div8, file$2, 345, 4, 7844);
    			add_location(span16, file$2, 360, 8, 8319);
    			attr_dev(input7, "class", "input svelte-izdltf");
    			attr_dev(input7, "type", "text");
    			add_location(input7, file$2, 361, 8, 8347);
    			attr_dev(h55, "data-lang", /*userLang*/ ctx[1]);
    			attr_dev(h55, "data-fr", "Type: ");
    			attr_dev(h55, "class", "svelte-izdltf");
    			add_location(h55, file$2, 359, 6, 8266);
    			attr_dev(div9, "class", "input-wrapper");
    			add_location(div9, file$2, 358, 4, 8232);
    			add_location(span17, file$2, 369, 8, 8581);
    			attr_dev(input8, "class", "input svelte-izdltf");
    			attr_dev(input8, "type", "number");
    			attr_dev(input8, "step", "0.03125");
    			add_location(input8, file$2, 370, 8, 8613);
    			attr_dev(h56, "data-lang", /*userLang*/ ctx[1]);
    			attr_dev(h56, "data-fr", "Diametre: ");
    			attr_dev(h56, "class", "svelte-izdltf");
    			add_location(h56, file$2, 368, 6, 8524);
    			attr_dev(div10, "class", "input-wrapper");
    			add_location(div10, file$2, 367, 4, 8490);
    			add_location(span18, file$2, 379, 8, 8878);
    			attr_dev(input9, "class", "input svelte-izdltf");
    			attr_dev(input9, "type", "number");
    			attr_dev(input9, "step", "10");
    			add_location(input9, file$2, 380, 8, 8915);
    			add_location(span19, file$2, 385, 8, 9064);
    			attr_dev(h57, "data-lang", /*userLang*/ ctx[1]);
    			attr_dev(h57, "data-fr", "Diametre: ");
    			attr_dev(h57, "class", "svelte-izdltf");
    			add_location(h57, file$2, 378, 6, 8821);
    			attr_dev(div11, "class", "input-wrapper");
    			add_location(div11, file$2, 377, 4, 8787);
    			add_location(span20, file$2, 390, 8, 9208);
    			attr_dev(input10, "class", "input svelte-izdltf");
    			attr_dev(input10, "type", "number");
    			attr_dev(input10, "step", "10");
    			add_location(input10, file$2, 391, 8, 9241);
    			add_location(span21, file$2, 396, 8, 9387);
    			attr_dev(h58, "data-lang", /*userLang*/ ctx[1]);
    			attr_dev(h58, "data-fr", "vitesse de coupe: ");
    			attr_dev(h58, "class", "svelte-izdltf");
    			add_location(h58, file$2, 389, 6, 9143);
    			attr_dev(div12, "class", "input-wrapper");
    			add_location(div12, file$2, 388, 4, 9109);
    			add_location(span22, file$2, 401, 8, 9535);
    			attr_dev(input11, "class", "input svelte-izdltf");
    			attr_dev(input11, "type", "number");
    			attr_dev(input11, "step", "10");
    			add_location(input11, file$2, 402, 8, 9570);
    			add_location(span23, file$2, 407, 8, 9718);
    			attr_dev(h59, "data-lang", /*userLang*/ ctx[1]);
    			attr_dev(h59, "data-fr", "vitesse de plonge: ");
    			attr_dev(h59, "class", "svelte-izdltf");
    			add_location(h59, file$2, 400, 6, 9469);
    			attr_dev(div13, "class", "input-wrapper");
    			add_location(div13, file$2, 399, 4, 9435);
    			add_location(span24, file$2, 412, 8, 9866);
    			attr_dev(input12, "class", "input svelte-izdltf");
    			attr_dev(input12, "type", "number");
    			attr_dev(input12, "step", "10");
    			add_location(input12, file$2, 413, 8, 9901);
    			add_location(span25, file$2, 418, 8, 10047);
    			attr_dev(h510, "data-lang", /*userLang*/ ctx[1]);
    			attr_dev(h510, "data-fr", "Longeur de plonge: ");
    			attr_dev(h510, "class", "svelte-izdltf");
    			add_location(h510, file$2, 411, 6, 9800);
    			attr_dev(div14, "class", "input-wrapper");
    			add_location(div14, file$2, 410, 4, 9766);
    			add_location(span26, file$2, 423, 8, 10194);
    			attr_dev(input13, "class", "input svelte-izdltf");
    			attr_dev(input13, "type", "number");
    			attr_dev(input13, "step", "10");
    			add_location(input13, file$2, 424, 8, 10232);
    			add_location(span27, file$2, 429, 8, 10383);
    			attr_dev(h511, "data-lang", /*userLang*/ ctx[1]);
    			attr_dev(h511, "data-fr", "Max profondeur/passe: ");
    			attr_dev(h511, "class", "svelte-izdltf");
    			add_location(h511, file$2, 422, 6, 10125);
    			attr_dev(div15, "class", "input-wrapper");
    			add_location(div15, file$2, 421, 4, 10091);
    			attr_dev(div16, "class", "cnc svelte-izdltf");
    			add_location(div16, file$2, 343, 2, 7745);
    			attr_dev(div17, "class", "settings svelte-izdltf");
    			toggle_class(div17, "active", /*$settings*/ ctx[0].show);
    			add_location(div17, file$2, 253, 0, 4646);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div17, anchor);
    			append_dev(div17, div7);
    			append_dev(div7, div1);
    			append_dev(div1, h30);
    			append_dev(h30, span0);
    			append_dev(div1, t1);
    			append_dev(div1, label0);
    			append_dev(label0, input0);
    			input0.checked = /*$settings*/ ctx[0].units;
    			append_dev(label0, t2);
    			append_dev(label0, div0);
    			append_dev(div7, t3);
    			append_dev(div7, div3);
    			append_dev(div3, h31);
    			append_dev(h31, span1);
    			append_dev(div3, t5);
    			append_dev(div3, label1);
    			append_dev(label1, input1);
    			input1.checked = /*$settings*/ ctx[0].direction;
    			append_dev(label1, t6);
    			append_dev(label1, div2);
    			append_dev(div7, t7);
    			append_dev(div7, div4);
    			append_dev(div4, h32);
    			append_dev(h32, span2);
    			append_dev(div4, t9);
    			append_dev(div4, select);
    			append_dev(select, option0);
    			append_dev(option0, span3);
    			append_dev(option0, t11);
    			append_dev(select, option1);
    			append_dev(option1, span4);
    			append_dev(option1, t13);
    			append_dev(select, option2);
    			append_dev(option2, span5);
    			append_dev(option2, t15);
    			append_dev(select, option3);
    			append_dev(option3, span6);
    			append_dev(option3, t17);
    			append_dev(select, option4);
    			append_dev(option4, span7);
    			append_dev(option4, t19);
    			append_dev(select, option5);
    			append_dev(option5, span8);
    			select_option(select, /*$settings*/ ctx[0].placementType);
    			append_dev(div7, t21);
    			append_dev(div7, div5);
    			append_dev(div5, h33);
    			append_dev(h33, span9);
    			append_dev(div5, t23);
    			append_dev(div5, h50);
    			append_dev(h50, span10);
    			append_dev(h50, t25);
    			append_dev(h50, input2);
    			set_input_value(input2, /*$settings*/ ctx[0].material.width);
    			append_dev(div5, t26);
    			append_dev(div5, h51);
    			append_dev(h51, span11);
    			append_dev(h51, t28);
    			append_dev(h51, input3);
    			set_input_value(input3, /*$settings*/ ctx[0].material.height);
    			append_dev(div5, t29);
    			append_dev(div5, h52);
    			append_dev(h52, span12);
    			append_dev(h52, t31);
    			append_dev(h52, input4);
    			set_input_value(input4, /*$settings*/ ctx[0].material.thickness);
    			append_dev(div7, t32);
    			append_dev(div7, div6);
    			append_dev(div6, h53);
    			append_dev(h53, span13);
    			append_dev(h53, t34);
    			append_dev(h53, input5);
    			set_input_value(input5, /*$settings*/ ctx[0].material.margins);
    			append_dev(div17, t35);
    			append_dev(div17, div16);
    			append_dev(div16, div8);
    			append_dev(div8, h34);
    			append_dev(h34, span14);
    			append_dev(div8, t37);
    			append_dev(div8, h54);
    			append_dev(h54, span15);
    			append_dev(h54, t39);
    			append_dev(h54, input6);
    			set_input_value(input6, /*$settings*/ ctx[0].tool);
    			append_dev(div16, t40);
    			append_dev(div16, div9);
    			append_dev(div9, h55);
    			append_dev(h55, span16);
    			append_dev(h55, t42);
    			append_dev(h55, input7);
    			set_input_value(input7, /*$settings*/ ctx[0].cnc[/*$settings*/ ctx[0].tool].type);
    			append_dev(div16, t43);
    			append_dev(div16, div10);
    			append_dev(div10, h56);
    			append_dev(h56, span17);
    			append_dev(h56, t45);
    			append_dev(h56, input8);
    			set_input_value(input8, /*$settings*/ ctx[0].cnc[/*$settings*/ ctx[0].tool].diameter);
    			append_dev(div16, t46);
    			append_dev(div16, div11);
    			append_dev(div11, h57);
    			append_dev(h57, span18);
    			append_dev(h57, t48);
    			append_dev(h57, input9);
    			set_input_value(input9, /*$settings*/ ctx[0].cnc[/*$settings*/ ctx[0].tool].spindle);
    			append_dev(h57, t49);
    			append_dev(h57, span19);
    			append_dev(div16, t51);
    			append_dev(div16, div12);
    			append_dev(div12, h58);
    			append_dev(h58, span20);
    			append_dev(h58, t53);
    			append_dev(h58, input10);
    			set_input_value(input10, /*$settings*/ ctx[0].cnc[/*$settings*/ ctx[0].tool].feed);
    			append_dev(h58, t54);
    			append_dev(h58, span21);
    			append_dev(div16, t56);
    			append_dev(div16, div13);
    			append_dev(div13, h59);
    			append_dev(h59, span22);
    			append_dev(h59, t58);
    			append_dev(h59, input11);
    			set_input_value(input11, /*$settings*/ ctx[0].cnc[/*$settings*/ ctx[0].tool].plunge);
    			append_dev(h59, t59);
    			append_dev(h59, span23);
    			append_dev(div16, t61);
    			append_dev(div16, div14);
    			append_dev(div14, h510);
    			append_dev(h510, span24);
    			append_dev(h510, t63);
    			append_dev(h510, input12);
    			set_input_value(input12, /*$settings*/ ctx[0].cnc[/*$settings*/ ctx[0].tool].ramp);
    			append_dev(h510, t64);
    			append_dev(h510, span25);
    			append_dev(div16, t66);
    			append_dev(div16, div15);
    			append_dev(div15, h511);
    			append_dev(h511, span26);
    			append_dev(h511, t68);
    			append_dev(h511, input13);
    			set_input_value(input13, /*$settings*/ ctx[0].cnc[/*$settings*/ ctx[0].tool].max_depth);
    			append_dev(h511, t69);
    			append_dev(h511, span27);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*input0_change_handler*/ ctx[2]),
    					listen_dev(input1, "change", /*input1_change_handler*/ ctx[3]),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[4]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[5]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[6]),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[7]),
    					listen_dev(input5, "input", /*input5_input_handler*/ ctx[8]),
    					listen_dev(input6, "input", /*input6_input_handler*/ ctx[9]),
    					listen_dev(input7, "input", /*input7_input_handler*/ ctx[10]),
    					listen_dev(input8, "input", /*input8_input_handler*/ ctx[11]),
    					listen_dev(input9, "input", /*input9_input_handler*/ ctx[12]),
    					listen_dev(input10, "input", /*input10_input_handler*/ ctx[13]),
    					listen_dev(input11, "input", /*input11_input_handler*/ ctx[14]),
    					listen_dev(input12, "input", /*input12_input_handler*/ ctx[15]),
    					listen_dev(input13, "input", /*input13_input_handler*/ ctx[16])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$settings*/ 1) {
    				input0.checked = /*$settings*/ ctx[0].units;
    			}

    			if (dirty & /*$settings*/ 1) {
    				input1.checked = /*$settings*/ ctx[0].direction;
    			}

    			if (dirty & /*$settings*/ 1) {
    				select_option(select, /*$settings*/ ctx[0].placementType);
    			}

    			if (dirty & /*$settings*/ 1 && to_number(input2.value) !== /*$settings*/ ctx[0].material.width) {
    				set_input_value(input2, /*$settings*/ ctx[0].material.width);
    			}

    			if (dirty & /*$settings*/ 1 && to_number(input3.value) !== /*$settings*/ ctx[0].material.height) {
    				set_input_value(input3, /*$settings*/ ctx[0].material.height);
    			}

    			if (dirty & /*$settings*/ 1 && to_number(input4.value) !== /*$settings*/ ctx[0].material.thickness) {
    				set_input_value(input4, /*$settings*/ ctx[0].material.thickness);
    			}

    			if (dirty & /*$settings*/ 1 && to_number(input5.value) !== /*$settings*/ ctx[0].material.margins) {
    				set_input_value(input5, /*$settings*/ ctx[0].material.margins);
    			}

    			if (dirty & /*$settings*/ 1 && to_number(input6.value) !== /*$settings*/ ctx[0].tool) {
    				set_input_value(input6, /*$settings*/ ctx[0].tool);
    			}

    			if (dirty & /*$settings*/ 1 && input7.value !== /*$settings*/ ctx[0].cnc[/*$settings*/ ctx[0].tool].type) {
    				set_input_value(input7, /*$settings*/ ctx[0].cnc[/*$settings*/ ctx[0].tool].type);
    			}

    			if (dirty & /*$settings*/ 1 && to_number(input8.value) !== /*$settings*/ ctx[0].cnc[/*$settings*/ ctx[0].tool].diameter) {
    				set_input_value(input8, /*$settings*/ ctx[0].cnc[/*$settings*/ ctx[0].tool].diameter);
    			}

    			if (dirty & /*$settings*/ 1 && to_number(input9.value) !== /*$settings*/ ctx[0].cnc[/*$settings*/ ctx[0].tool].spindle) {
    				set_input_value(input9, /*$settings*/ ctx[0].cnc[/*$settings*/ ctx[0].tool].spindle);
    			}

    			if (dirty & /*$settings*/ 1 && to_number(input10.value) !== /*$settings*/ ctx[0].cnc[/*$settings*/ ctx[0].tool].feed) {
    				set_input_value(input10, /*$settings*/ ctx[0].cnc[/*$settings*/ ctx[0].tool].feed);
    			}

    			if (dirty & /*$settings*/ 1 && to_number(input11.value) !== /*$settings*/ ctx[0].cnc[/*$settings*/ ctx[0].tool].plunge) {
    				set_input_value(input11, /*$settings*/ ctx[0].cnc[/*$settings*/ ctx[0].tool].plunge);
    			}

    			if (dirty & /*$settings*/ 1 && to_number(input12.value) !== /*$settings*/ ctx[0].cnc[/*$settings*/ ctx[0].tool].ramp) {
    				set_input_value(input12, /*$settings*/ ctx[0].cnc[/*$settings*/ ctx[0].tool].ramp);
    			}

    			if (dirty & /*$settings*/ 1 && to_number(input13.value) !== /*$settings*/ ctx[0].cnc[/*$settings*/ ctx[0].tool].max_depth) {
    				set_input_value(input13, /*$settings*/ ctx[0].cnc[/*$settings*/ ctx[0].tool].max_depth);
    			}

    			if (dirty & /*$settings*/ 1) {
    				toggle_class(div17, "active", /*$settings*/ ctx[0].show);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div17);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function highlight$1() {
    	this.select();
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $settings;
    	validate_store(settings, "settings");
    	component_subscribe($$self, settings, $$value => $$invalidate(0, $settings = $$value));
    	let userLang = navigator.language || navigator.userLanguage;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Settings> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Settings", $$slots, []);

    	function input0_change_handler() {
    		$settings.units = this.checked;
    		settings.set($settings);
    	}

    	function input1_change_handler() {
    		$settings.direction = this.checked;
    		settings.set($settings);
    	}

    	function select_change_handler() {
    		$settings.placementType = select_value(this);
    		settings.set($settings);
    	}

    	function input2_input_handler() {
    		$settings.material.width = to_number(this.value);
    		settings.set($settings);
    	}

    	function input3_input_handler() {
    		$settings.material.height = to_number(this.value);
    		settings.set($settings);
    	}

    	function input4_input_handler() {
    		$settings.material.thickness = to_number(this.value);
    		settings.set($settings);
    	}

    	function input5_input_handler() {
    		$settings.material.margins = to_number(this.value);
    		settings.set($settings);
    	}

    	function input6_input_handler() {
    		$settings.tool = to_number(this.value);
    		settings.set($settings);
    	}

    	function input7_input_handler() {
    		$settings.cnc[$settings.tool].type = this.value;
    		settings.set($settings);
    	}

    	function input8_input_handler() {
    		$settings.cnc[$settings.tool].diameter = to_number(this.value);
    		settings.set($settings);
    	}

    	function input9_input_handler() {
    		$settings.cnc[$settings.tool].spindle = to_number(this.value);
    		settings.set($settings);
    	}

    	function input10_input_handler() {
    		$settings.cnc[$settings.tool].feed = to_number(this.value);
    		settings.set($settings);
    	}

    	function input11_input_handler() {
    		$settings.cnc[$settings.tool].plunge = to_number(this.value);
    		settings.set($settings);
    	}

    	function input12_input_handler() {
    		$settings.cnc[$settings.tool].ramp = to_number(this.value);
    		settings.set($settings);
    	}

    	function input13_input_handler() {
    		$settings.cnc[$settings.tool].max_depth = to_number(this.value);
    		settings.set($settings);
    	}

    	$$self.$capture_state = () => ({ settings, userLang, highlight: highlight$1, $settings });

    	$$self.$inject_state = $$props => {
    		if ("userLang" in $$props) $$invalidate(1, userLang = $$props.userLang);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		$settings,
    		userLang,
    		input0_change_handler,
    		input1_change_handler,
    		select_change_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		input5_input_handler,
    		input6_input_handler,
    		input7_input_handler,
    		input8_input_handler,
    		input9_input_handler,
    		input10_input_handler,
    		input11_input_handler,
    		input12_input_handler,
    		input13_input_handler
    	];
    }

    class Settings extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Settings",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.24.1 */
    const file$3 = "src/App.svelte";

    function create_fragment$4(ctx) {
    	let t0;
    	let div2;
    	let div0;
    	let import_1;
    	let t1;
    	let csv;
    	let t2;
    	let settings_1;
    	let t3;
    	let div1;
    	let viewer;
    	let current;
    	let mounted;
    	let dispose;
    	import_1 = new Import({ $$inline: true });
    	csv = new CSV({ $$inline: true });
    	settings_1 = new Settings({ $$inline: true });
    	viewer = new Viewer({ $$inline: true });

    	const block = {
    		c: function create() {
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			create_component(import_1.$$.fragment);
    			t1 = space();
    			create_component(csv.$$.fragment);
    			t2 = space();
    			create_component(settings_1.$$.fragment);
    			t3 = space();
    			div1 = element("div");
    			create_component(viewer.$$.fragment);
    			attr_dev(div0, "class", "import svelte-ubfav0");
    			add_location(div0, file$3, 54, 2, 1132);
    			attr_dev(div1, "class", "main");
    			add_location(div1, file$3, 59, 2, 1208);
    			attr_dev(div2, "class", "container svelte-ubfav0");
    			add_location(div2, file$3, 53, 0, 1106);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			mount_component(import_1, div0, null);
    			append_dev(div0, t1);
    			mount_component(csv, div0, null);
    			append_dev(div0, t2);
    			mount_component(settings_1, div0, null);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			mount_component(viewer, div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(document.body, "change", /*calculateNest*/ ctx[1], false, false, false),
    					listen_dev(div1, "click", /*click_handler*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(import_1.$$.fragment, local);
    			transition_in(csv.$$.fragment, local);
    			transition_in(settings_1.$$.fragment, local);
    			transition_in(viewer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(import_1.$$.fragment, local);
    			transition_out(csv.$$.fragment, local);
    			transition_out(settings_1.$$.fragment, local);
    			transition_out(viewer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			destroy_component(import_1);
    			destroy_component(csv);
    			destroy_component(settings_1);
    			destroy_component(viewer);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const csvHeaderRows$2 = 5;

    function instance$4($$self, $$props, $$invalidate) {
    	let $csvFile;
    	let $settings;
    	let $panels;
    	let $sheets;
    	validate_store(csvFile, "csvFile");
    	component_subscribe($$self, csvFile, $$value => $$invalidate(3, $csvFile = $$value));
    	validate_store(settings, "settings");
    	component_subscribe($$self, settings, $$value => $$invalidate(0, $settings = $$value));
    	validate_store(panels, "panels");
    	component_subscribe($$self, panels, $$value => $$invalidate(4, $panels = $$value));
    	validate_store(sheets, "sheets");
    	component_subscribe($$self, sheets, $$value => $$invalidate(5, $sheets = $$value));

    	beforeUpdate(() => {
    		calculateNest();
    	});

    	function calculateNest() {
    		let nest = Nest($csvFile.contents, csvHeaderRows$2, $settings.placementType, $settings.units, $settings.direction, $settings.cnc[$settings.tool].diameter, $settings.gap, $settings.material); // panel starting row csv
    		set_store_value(panels, $panels = nest[0]);
    		set_store_value(sheets, $sheets = nest[1]);
    		set_store_value(csvFile, $csvFile.errors = nest[2], $csvFile);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	const click_handler = () => set_store_value(settings, $settings.show = false, $settings);

    	$$self.$capture_state = () => ({
    		Import,
    		CSV,
    		Viewer,
    		Settings,
    		Nest,
    		settings,
    		panels,
    		sheets,
    		csvFile,
    		blancCSV,
    		beforeUpdate,
    		csvHeaderRows: csvHeaderRows$2,
    		calculateNest,
    		$csvFile,
    		$settings,
    		$panels,
    		$sheets
    	});

    	return [$settings, calculateNest, click_handler];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
    });

    return app;

}());
//# sourceMappingURL=app.js.map
