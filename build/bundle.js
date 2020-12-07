
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
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
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
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
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

    function CSVToArray( strData, strDelimiter = "," ) {

        // Create a regular expression to parse the CSV values.
        var regexPattern = new RegExp( (
                "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +  // Delimiters.
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +         // Quoted fields.
                "([^\"\\" + strDelimiter + "\\r\\n]*))"     // Standard fields.
            ), "gi" );

        // Create an array of arrays to hold csv data.
        var arrData = [[]];

        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;

        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = regexPattern.exec( strData )){

            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[ 1 ];

            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if ( strMatchedDelimiter.length &&
                (strMatchedDelimiter != strDelimiter)
                ) {

                // Since we have reached a new row of data,
                // add an empty row to our data array.
                arrData.push( [] );
            }

            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if ( arrMatches[ 2 ] ){

                // We found a quoted value. When we capture
                // this value, unescape any double quotes.
                var strMatchedValue = arrMatches[ 2 ].replace(
                        new RegExp( "\"\"", "g" ), "\"" );

            } else {
                // We found a non-quoted value.
                var strMatchedValue = arrMatches[ 3 ];
            }

            if ( hasNumber( strMatchedValue ) ) {
                strMatchedValue = toFloat( strMatchedValue );
            }

            // Now that we have our value string, let's add
            // it to the data array.
            arrData[ arrData.length - 1 ].push( strMatchedValue );
        }

        // Return the parsed data.
        return arrData.filter( item =>
                    item.filter( inner => inner !== "" ).length )
    }
    function hasNumber( str ) {
        return /\d/.test( str );
    }

    function toFloat( str ) {
        if (!isNaN( str )) return parseFloat( str ) // if number return float
        if (str.includes("/") && !str.includes(".")) {
            return str
                .split( " " )
                .filter( item => item !== "" ) // for multiple spaces
                .reduce( ( total, item ) => {
                    if ( item.includes( "/" ) ) {
                        let frac = item
                            .split( "/" )
                            .filter( item => item !== "" );
                        return total + parseFloat( frac[0] / frac[1] )}
                    return total + parseFloat( item )
                    }, 0 )
        }
        return str
    }

    /////////////////TO DO//////////////////////////////////

    let CUTTER = 0.375;         // end mill diameter used to space panels
    let GAP = 0;                // gap + bit size = total space
    let ERRORS = [];            // catch all panels that don't fit
    let MATERIAL = {           // sheet size and options
            width: 49,
            height: 97,
            margins: 0.25,
            max_width: () => MATERIAL.width - MATERIAL.margins * 2 + CUTTER,
            max_height: () => MATERIAL.height - MATERIAL.margins * 2 + CUTTER
        };

    function Nest( panels,
            firstPanelRow = 1,
            metricUnits = false,
            cutter = CUTTER,
            gap = GAP,
            material = MATERIAL
    ) {

        function panelArrayCreator() {
            // console.log(CSVToArray( panels ));
            return new List( CSVToArray( panels )
                    .slice( firstPanelRow )
                    .flatMap( i => {
                        return quantityIDs( i ).map( i => new Panel( i ) ) } )
                )
                .flat()
                .filterTooBig()
        }

        function quantityIDs( [ id, quantity, width, height ] ) {
            let n = 1, uniqueIDs = [];
            while ( quantity >= n ) {
                uniqueIDs.push( [ `${id} (${n}/${quantity})`, parseFloat(width), parseFloat(height) ] );
                n++;
            }
            // console.log(uniqueIDs);
            return uniqueIDs
        }

        ERRORS = [];
        const PANELS = panelArrayCreator();          // raw csv panel input converted
        // const METRIC_UNITS = metricUnits  // default false
        // const TARGET_FIT = 0.8                      // ratio of a good fit per sheet
        CUTTER = cutter;
        GAP = gap;
        MATERIAL.width = material.width;
        MATERIAL.height = material.height;
        MATERIAL.margins = material.margins;



        function fillColumn( panels ) {
            let column = new List( panels.widest().place() );
            let maxWidth = column[0].width;
            // add rows of panels to column until
            // no space remains or no more panels
            while ( panels.fitsColumn( column ) ) {
                let row = new List(
                    panels.fitsColumn( column ).place()
                );
                // add more panels to row if space remains
                while ( panels.fitsRow( row, maxWidth ) ) {
                    row.push( panels.fitsRow( row, maxWidth ).place() );
                }
                // return nested array only if
                // more than one panel in row
                if ( row.length === 1 ) column.push( row[0] );
                else column.push( row );
            }
            // smallest pieces to center of column
            // return column.shuffle()
            return column.ascendingWidth()
        }


        function makeColumns ( panels ) {
            let columns = new List();
            while ( panels.notPlaced().length > 0 ) {
                let column = fillColumn( panels );
                columns.push( new Column (
                    column.columnWidth(),       //width
                    column.columnHeight(),      // height
                    column.columnArea(),        // area
                    column                      // group
                ));
            }
            return columns
        }

        function fillSheet( columns ) {
            let sheet = new List( columns.widest().place() );
            while ( columns.fitsSheet( sheet ) ) {
                sheet.push( columns.fitsSheet( sheet ).place() );
            }
            // smallest pieces to center of sheet
            // return sheet.shuffle()
            return sheet
        }

        function makeSheets( panels ) {
            let columns = makeColumns( panels );
            let sheets =  new List();
            while ( columns.notPlaced().length > 0 ) {
                let sheet = fillSheet( columns );
                addCoordinates( sheet, sheets.length );
                sheets.push( new Sheet(
                    sheet.filledWidth(),                        // width
                    sheet.filledHeight(),                       // height
                    sheet.filledArea(),                         // area
                    sheet.map(list => list.group).flatten(2),   // group
                    sheet,                                      // columns
                    sheets.length + 1                           // id
                ));
            }
            return sheets
        }

        function addCoordinates( columns, multiplier ) {
            let startX = MATERIAL.margins + MATERIAL.width * multiplier;
            let startY = MATERIAL.margins;
            // start X and Y for svg output with multiple sheets

            let xPos = new List();

            columns.forEach( ( column, i ) => {
                // xPos map of columns, first index === start
                if ( i === 0 ) { xPos.push( startX ); }
                // everything after calculated += prev. width
                else { xPos.push(xPos.last() + columns[i - 1].width); }

                let yPos = new List();

                // iterate each row in column
                column.group.forEach( ( row, j, rows ) => {
                    // yPos map of rows, first index === start
                    if ( j === 0 ) { yPos.push( startY ); }
                    // everything after calculated += prev. height
                    // with appropriate method for row type
                    else if ( rows[j - 1] instanceof List ) {
                        yPos.push(yPos.last() + rows[j - 1].filledHeight());
                    }
                    else { yPos.push(yPos.last() + rows[j - 1].height); }

                    // add x0 and y0 prop to each row in column
                    if ( row instanceof Panel ) {
                        row.x0 = xPos[i];
                        row.y0 = yPos[j];
                    }
                    else {
                        row.forEach(( rowCol, k ) => {
                            if ( k === 0 ) { rowCol.x0 = xPos[i]; }
                            else { rowCol.x0 = row[k-1].x0 + row[k-1].width; }
                            rowCol.y0 = yPos[j];
                        });
                    }
                });
            });
        }
        let sheets = makeSheets( PANELS );
        return [ PANELS, sheets, ERRORS ]
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
        constructor( [ id, width, height ] ) {
            super();
            this.id = id;
            this.width = width + CUTTER + GAP;
            this.height = height + CUTTER + GAP;
            this.area = this.height * this.width;
            this.x0 = 0;
            this.y0 = 0;
        }
    }

    class Column extends Placement {
       constructor( width, height, area, group ){
            super();
            this.width = width;
            this.height = height;
            this.area = area;
            this.group = group;
        }
    }

    class Sheet extends Column {
       constructor( width, height, area, group, columns, id ){
            super( width, height, area, group  );
            this.columns = columns;
            this.sheet_width = MATERIAL.width;
            this.sheet_height = MATERIAL.height;
            this.sheet_area = MATERIAL.width * MATERIAL.height;
            this.waste_area = this.sheet_area - this.area;
            this.waste_ratio = 1 - this.area / this.sheet_area;
            this.id = "Sheet " + id;
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
            return this[this.length-1]
        }
        flatten( dimensions = 1 ) {
            let flattened = this;
            while ( dimensions-- ) {
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
            if ( this.length < 3 ) return this
            return new List( ...this.slice(1), this.first() )
        }
        // sorting methods
        ascendingWidth() {
            return new List( ...this )
                .sort(( a, b ) => b.width != a.width ?
                    b.width - a.width :
                    b.height - a.height)
        }
        ascendingHeight() {
            return new List( ...this )
                .sort(( a, b ) => b.height != a.height ?
                    b.height - a.height :
                    b.width - a.width)
        }
        filterTooBig() {
            return this.map(panel => {
                    if ( panel.width > MATERIAL.max_width() ||
                         panel.height > MATERIAL.max_height() ) {
                        ERRORS.push(`Panel ${panel.id} is too big`);
                        return false
                    }
                    return panel
                })
                .filter(panel => panel) // removes empty entry
        }
        // methods to find unplaced panels
        notPlaced() {
            return this.filter(panel => !panel.placed)
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
            return this
                .sort(( a, b ) => b.area - a.area )
                .notPlaced()
                .first()
        }
        // group measurement methods
        totalWidth() {
            return this.reduce(( total, panel ) => {
                if ( panel instanceof List ) {
                    return total + panel.ascendingWidth().first().width
                }
                return total + panel.width
            }, 0)
        }
        totalHeight() {
            return this.reduce( ( total, panel ) => {
                if ( panel instanceof List ) {
                    return total + panel.ascendingHeight().first().height
                }
                return total + panel.height
            }, 0 )
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
        remainingWidth( maxWidth ) {
            return maxWidth - this.totalWidth()
        }
        remainingHeight( maxHeight ) {
            return maxHeight - this.totalHeight()
        }
        fitsColumn( group, maxHeight = MATERIAL.height ) {
            return this.notPlaced()
                .filter(panel => panel.width <= group[0].width)
                .filter(panel => panel.height < group.remainingHeight( maxHeight ))
                // .biggest()
                .widest()
        }
        fitsRow( group, maxWidth ) {
            return this.notPlaced()
                .filter(panel => panel.height <= group[0].height)
                .filter(panel => panel.width < group.remainingWidth( maxWidth ))
                // .biggest()
                .widest()
        }
        fitsSheet( group, maxWidth = MATERIAL.width ) {
            return this.notPlaced()
                // .filter(panel => panel.height <= group[0].height)
                .filter(panel => panel.width < group.remainingWidth( maxWidth ))
                .widest()
        }
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

    // localStore.js
    // import YAML from 'yaml';

    const localStore = (key, initial) => {
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
        update
      }
    };

    // stores.js

    // export const cabinets = localStore('cabinets', [])

    // export const inputState = localStore('input-state', "cabinet")
    // export const cabinetType = localStore('cabinet-type', "bathroom")

    const panels = localStore('panels', []);
    const sheets = localStore('sheets', []);
    const fileInfo = localStore('file-info', {});
    const svg = localStore('svg', '');

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

    /* src/components/Import.svelte generated by Svelte v3.24.1 */
    const file = "src/components/Import.svelte";

    // (136:6) {:else}
    function create_else_block(ctx) {
    	let h1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "💩";
    			attr_dev(h1, "class", "svelte-118u7vq");
    			add_location(h1, file, 136, 9, 2721);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);

    			if (!mounted) {
    				dispose = listen_dev(h1, "mouseover", /*mouseover_handler*/ ctx[10], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(136:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (134:6) {#if !badFile}
    function create_if_block(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = "./favicon.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "open csv file");
    			attr_dev(img, "class", "svelte-118u7vq");
    			add_location(img, file, 134, 9, 2652);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(134:6) {#if !badFile}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div0;
    	let input0;
    	let t0;
    	let label;
    	let t1;
    	let div1;
    	let h4;
    	let t3;
    	let div2;
    	let a;
    	let t4;
    	let a_href_value;
    	let a_download_value;
    	let t5;
    	let div3;
    	let h50;
    	let t7;
    	let input1;
    	let t8;
    	let span;
    	let t10;
    	let input2;
    	let t11;
    	let div4;
    	let h51;
    	let t13;
    	let input3;
    	let t14;
    	let div5;
    	let h52;
    	let t16;
    	let input4;
    	let t17;
    	let div6;
    	let h53;
    	let t19;
    	let input5;
    	let t20;
    	let div7;
    	let h54;
    	let t22;
    	let input6;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (!/*badFile*/ ctx[1]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			input0 = element("input");
    			t0 = space();
    			label = element("label");
    			if_block.c();
    			t1 = space();
    			div1 = element("div");
    			h4 = element("h4");
    			h4.textContent = "recalculate";
    			t3 = space();
    			div2 = element("div");
    			a = element("a");
    			t4 = text("save");
    			t5 = space();
    			div3 = element("div");
    			h50 = element("h5");
    			h50.textContent = "Material W x H";
    			t7 = space();
    			input1 = element("input");
    			t8 = space();
    			span = element("span");
    			span.textContent = "x";
    			t10 = space();
    			input2 = element("input");
    			t11 = space();
    			div4 = element("div");
    			h51 = element("h5");
    			h51.textContent = "Margins";
    			t13 = space();
    			input3 = element("input");
    			t14 = space();
    			div5 = element("div");
    			h52 = element("h5");
    			h52.textContent = "Kerf";
    			t16 = space();
    			input4 = element("input");
    			t17 = space();
    			div6 = element("div");
    			h53 = element("h5");
    			h53.textContent = "Gap";
    			t19 = space();
    			input5 = element("input");
    			t20 = space();
    			div7 = element("div");
    			h54 = element("h5");
    			h54.textContent = "Metric";
    			t22 = space();
    			input6 = element("input");
    			attr_dev(input0, "class", "inputfile svelte-118u7vq");
    			attr_dev(input0, "name", "file");
    			attr_dev(input0, "id", "file");
    			attr_dev(input0, "type", "file");
    			add_location(input0, file, 131, 3, 2499);
    			attr_dev(label, "for", "file");
    			attr_dev(label, "class", "svelte-118u7vq");
    			add_location(label, file, 132, 3, 2603);
    			attr_dev(div0, "class", "upload-wrapper svelte-118u7vq");
    			add_location(div0, file, 130, 0, 2467);
    			attr_dev(h4, "class", "svelte-118u7vq");
    			add_location(h4, file, 141, 3, 2810);
    			attr_dev(div1, "class", "svelte-118u7vq");
    			add_location(div1, file, 140, 0, 2801);
    			attr_dev(a, "href", a_href_value = "data:text/plain;charset=utf-8," + encodeURIComponent(/*$svg*/ ctx[7]));
    			attr_dev(a, "download", a_download_value = "" + (/*$fileInfo*/ ctx[6].name + ".svg"));
    			attr_dev(a, "class", "svelte-118u7vq");
    			add_location(a, file, 144, 3, 2880);
    			attr_dev(div2, "class", "save svelte-118u7vq");
    			add_location(div2, file, 143, 0, 2858);
    			attr_dev(h50, "class", "svelte-118u7vq");
    			add_location(h50, file, 150, 3, 3172);
    			attr_dev(input1, "class", "input svelte-118u7vq");
    			attr_dev(input1, "type", "number");
    			add_location(input1, file, 151, 3, 3199);
    			attr_dev(span, "class", "svelte-118u7vq");
    			add_location(span, file, 152, 4, 3269);
    			attr_dev(input2, "class", "input svelte-118u7vq");
    			attr_dev(input2, "type", "number");
    			add_location(input2, file, 153, 3, 3287);
    			attr_dev(div3, "class", "input-wrapper svelte-118u7vq");
    			add_location(div3, file, 149, 0, 3141);
    			attr_dev(h51, "class", "svelte-118u7vq");
    			add_location(h51, file, 156, 3, 3392);
    			attr_dev(input3, "class", "input svelte-118u7vq");
    			attr_dev(input3, "type", "number");
    			attr_dev(input3, "step", "0.005");
    			add_location(input3, file, 157, 3, 3412);
    			attr_dev(div4, "class", "input-wrapper svelte-118u7vq");
    			add_location(div4, file, 155, 0, 3361);
    			attr_dev(h52, "class", "svelte-118u7vq");
    			add_location(h52, file, 160, 3, 3531);
    			attr_dev(input4, "class", "input svelte-118u7vq");
    			attr_dev(input4, "type", "number");
    			attr_dev(input4, "step", "0.005");
    			add_location(input4, file, 161, 3, 3548);
    			attr_dev(div5, "class", "input-wrapper svelte-118u7vq");
    			add_location(div5, file, 159, 0, 3500);
    			attr_dev(h53, "class", "svelte-118u7vq");
    			add_location(h53, file, 164, 3, 3657);
    			attr_dev(input5, "class", "input svelte-118u7vq");
    			attr_dev(input5, "type", "number");
    			attr_dev(input5, "step", "0.005");
    			add_location(input5, file, 165, 3, 3673);
    			attr_dev(div6, "class", "input-wrapper svelte-118u7vq");
    			add_location(div6, file, 163, 0, 3626);
    			attr_dev(h54, "class", "svelte-118u7vq");
    			add_location(h54, file, 168, 3, 3779);
    			attr_dev(input6, "class", "input svelte-118u7vq");
    			attr_dev(input6, "type", "checkbox");
    			add_location(input6, file, 169, 3, 3798);
    			attr_dev(div7, "class", "input-wrapper svelte-118u7vq");
    			add_location(div7, file, 167, 0, 3748);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, input0);
    			/*input0_binding*/ ctx[9](input0);
    			append_dev(div0, t0);
    			append_dev(div0, label);
    			if_block.m(label, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h4);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, a);
    			append_dev(a, t4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, h50);
    			append_dev(div3, t7);
    			append_dev(div3, input1);
    			set_input_value(input1, /*material*/ ctx[2].width);
    			append_dev(div3, t8);
    			append_dev(div3, span);
    			append_dev(div3, t10);
    			append_dev(div3, input2);
    			set_input_value(input2, /*material*/ ctx[2].height);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, h51);
    			append_dev(div4, t13);
    			append_dev(div4, input3);
    			set_input_value(input3, /*material*/ ctx[2].margins);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, h52);
    			append_dev(div5, t16);
    			append_dev(div5, input4);
    			set_input_value(input4, /*cutter*/ ctx[3]);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, div6, anchor);
    			append_dev(div6, h53);
    			append_dev(div6, t19);
    			append_dev(div6, input5);
    			set_input_value(input5, /*gap*/ ctx[4]);
    			insert_dev(target, t20, anchor);
    			insert_dev(target, div7, anchor);
    			append_dev(div7, h54);
    			append_dev(div7, t22);
    			append_dev(div7, input6);
    			input6.checked = /*units*/ ctx[5];

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*showFile*/ ctx[8], false, false, false),
    					listen_dev(h4, "click", /*showFile*/ ctx[8], false, false, false),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[11]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[12]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[13]),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[14]),
    					listen_dev(input5, "input", /*input5_input_handler*/ ctx[15]),
    					listen_dev(input6, "change", /*input6_change_handler*/ ctx[16])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(label, null);
    				}
    			}

    			if (dirty & /*$svg*/ 128 && a_href_value !== (a_href_value = "data:text/plain;charset=utf-8," + encodeURIComponent(/*$svg*/ ctx[7]))) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*$fileInfo*/ 64 && a_download_value !== (a_download_value = "" + (/*$fileInfo*/ ctx[6].name + ".svg"))) {
    				attr_dev(a, "download", a_download_value);
    			}

    			if (dirty & /*material*/ 4 && to_number(input1.value) !== /*material*/ ctx[2].width) {
    				set_input_value(input1, /*material*/ ctx[2].width);
    			}

    			if (dirty & /*material*/ 4 && to_number(input2.value) !== /*material*/ ctx[2].height) {
    				set_input_value(input2, /*material*/ ctx[2].height);
    			}

    			if (dirty & /*material*/ 4 && to_number(input3.value) !== /*material*/ ctx[2].margins) {
    				set_input_value(input3, /*material*/ ctx[2].margins);
    			}

    			if (dirty & /*cutter*/ 8 && to_number(input4.value) !== /*cutter*/ ctx[3]) {
    				set_input_value(input4, /*cutter*/ ctx[3]);
    			}

    			if (dirty & /*gap*/ 16 && to_number(input5.value) !== /*gap*/ ctx[4]) {
    				set_input_value(input5, /*gap*/ ctx[4]);
    			}

    			if (dirty & /*units*/ 32) {
    				input6.checked = /*units*/ ctx[5];
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			/*input0_binding*/ ctx[9](null);
    			if_block.d();
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(div6);
    			if (detaching) detach_dev(t20);
    			if (detaching) detach_dev(div7);
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

    function instance($$self, $$props, $$invalidate) {
    	let $fileInfo;
    	let $panels;
    	let $sheets;
    	let $svg;
    	validate_store(fileInfo, "fileInfo");
    	component_subscribe($$self, fileInfo, $$value => $$invalidate(6, $fileInfo = $$value));
    	validate_store(panels, "panels");
    	component_subscribe($$self, panels, $$value => $$invalidate(17, $panels = $$value));
    	validate_store(sheets, "sheets");
    	component_subscribe($$self, sheets, $$value => $$invalidate(18, $sheets = $$value));
    	validate_store(svg, "svg");
    	component_subscribe($$self, svg, $$value => $$invalidate(7, $svg = $$value));
    	let files;

    	function showFile() {
    		let file = files.files[0];
    		let reader = new FileReader();
    		set_store_value(fileInfo, $fileInfo.name = file.name.replace(".csv", ""), $fileInfo);
    		reader.readAsText(file);

    		if (file.name.includes(".csv")) {
    			// if ( file.type === 'text/csv' ) {
    			reader.onload = function (event) {
    				let nest = Nest(event.target.result, 4, units, cutter, gap, material); // csv file
    				// panel starting row csv

    				$$invalidate(1, badFile = false);
    				set_store_value(panels, $panels = nest[0]);
    				set_store_value(sheets, $sheets = nest[1]);
    				set_store_value(fileInfo, $fileInfo.errors = nest[2], $fileInfo);
    			};
    		} else {
    			$$invalidate(1, badFile = true);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Import> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Import", $$slots, []);

    	function input0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			files = $$value;
    			$$invalidate(0, files);
    		});
    	}

    	const mouseover_handler = () => $$invalidate(1, badFile = false);

    	function input1_input_handler() {
    		material.width = to_number(this.value);
    		$$invalidate(2, material);
    	}

    	function input2_input_handler() {
    		material.height = to_number(this.value);
    		$$invalidate(2, material);
    	}

    	function input3_input_handler() {
    		material.margins = to_number(this.value);
    		$$invalidate(2, material);
    	}

    	function input4_input_handler() {
    		cutter = to_number(this.value);
    		$$invalidate(3, cutter);
    	}

    	function input5_input_handler() {
    		gap = to_number(this.value);
    		$$invalidate(4, gap);
    	}

    	function input6_change_handler() {
    		units = this.checked;
    		$$invalidate(5, units);
    	}

    	$$self.$capture_state = () => ({
    		Nest,
    		panels,
    		sheets,
    		fileInfo,
    		svg,
    		saveAs: FileSaver_min.saveAs,
    		files,
    		showFile,
    		badFile,
    		material,
    		cutter,
    		gap,
    		units,
    		$fileInfo,
    		$panels,
    		$sheets,
    		$svg
    	});

    	$$self.$inject_state = $$props => {
    		if ("files" in $$props) $$invalidate(0, files = $$props.files);
    		if ("badFile" in $$props) $$invalidate(1, badFile = $$props.badFile);
    		if ("material" in $$props) $$invalidate(2, material = $$props.material);
    		if ("cutter" in $$props) $$invalidate(3, cutter = $$props.cutter);
    		if ("gap" in $$props) $$invalidate(4, gap = $$props.gap);
    		if ("units" in $$props) $$invalidate(5, units = $$props.units);
    	};

    	let badFile;
    	let material;
    	let cutter;
    	let gap;
    	let units;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	 $$invalidate(1, badFile = false);

    	// gCode = "g00 \ng20"
    	 $$invalidate(2, material = { width: 49, height: 97, margins: 0.25 });

    	 $$invalidate(3, cutter = 0.375);
    	 $$invalidate(4, gap = 0);
    	 $$invalidate(5, units = false);

    	return [
    		files,
    		badFile,
    		material,
    		cutter,
    		gap,
    		units,
    		$fileInfo,
    		$svg,
    		showFile,
    		input0_binding,
    		mouseover_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		input5_input_handler,
    		input6_change_handler
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

    /* src/components/Viewer.svelte generated by Svelte v3.24.1 */
    const file$1 = "src/components/Viewer.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	child_ctx[23] = i;
    	return child_ctx;
    }

    // (129:0) {#if checkSize}
    function create_if_block_1(ctx) {
    	let div;
    	let h40;
    	let t0;
    	let t1;
    	let t2;
    	let h41;
    	let t3;
    	let t4;
    	let t5;
    	let h42;
    	let t6;
    	let t7;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h40 = element("h4");
    			t0 = text("Panel: ");
    			t1 = text(/*id*/ ctx[0]);
    			t2 = space();
    			h41 = element("h4");
    			t3 = text("Width: ");
    			t4 = text(/*width*/ ctx[1]);
    			t5 = space();
    			h42 = element("h4");
    			t6 = text("Height: ");
    			t7 = text(/*height*/ ctx[2]);
    			attr_dev(h40, "class", "sizes");
    			add_location(h40, file$1, 130, 4, 2218);
    			attr_dev(h41, "class", "sizes");
    			add_location(h41, file$1, 131, 4, 2257);
    			attr_dev(h42, "class", "sizes");
    			add_location(h42, file$1, 132, 4, 2299);
    			attr_dev(div, "class", "infocard svelte-1f4wqfu");
    			set_style(div, "left", /*left*/ ctx[5] + "px");
    			set_style(div, "top", /*top*/ ctx[4] + "px");
    			add_location(div, file$1, 129, 0, 2153);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h40);
    			append_dev(h40, t0);
    			append_dev(h40, t1);
    			append_dev(div, t2);
    			append_dev(div, h41);
    			append_dev(h41, t3);
    			append_dev(h41, t4);
    			append_dev(div, t5);
    			append_dev(div, h42);
    			append_dev(h42, t6);
    			append_dev(h42, t7);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*id*/ 1) set_data_dev(t1, /*id*/ ctx[0]);
    			if (dirty & /*width*/ 2) set_data_dev(t4, /*width*/ ctx[1]);
    			if (dirty & /*height*/ 4) set_data_dev(t7, /*height*/ ctx[2]);

    			if (dirty & /*left*/ 32) {
    				set_style(div, "left", /*left*/ ctx[5] + "px");
    			}

    			if (dirty & /*top*/ 16) {
    				set_style(div, "top", /*top*/ ctx[4] + "px");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(129:0) {#if checkSize}",
    		ctx
    	});

    	return block;
    }

    // (148:4) {#each $sheets as sheet, index}
    function create_each_block_1(ctx) {
    	let rect;
    	let rect_id_value;
    	let rect_x_value;
    	let rect_width_value;
    	let rect_height_value;

    	const block = {
    		c: function create() {
    			rect = svg_element("rect");
    			attr_dev(rect, "class", "sheet print svelte-1f4wqfu");
    			attr_dev(rect, "id", rect_id_value = /*sheet*/ ctx[21].id);
    			attr_dev(rect, "x", rect_x_value = /*index*/ ctx[23] * /*sheet*/ ctx[21].sheet_width * /*scale*/ ctx[11]);
    			attr_dev(rect, "y", "0");
    			attr_dev(rect, "width", rect_width_value = /*sheet*/ ctx[21].sheet_width * /*scale*/ ctx[11]);
    			attr_dev(rect, "height", rect_height_value = /*sheet*/ ctx[21].sheet_height * /*scale*/ ctx[11]);
    			add_location(rect, file$1, 148, 8, 2745);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, rect, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$sheets*/ 256 && rect_id_value !== (rect_id_value = /*sheet*/ ctx[21].id)) {
    				attr_dev(rect, "id", rect_id_value);
    			}

    			if (dirty & /*$sheets*/ 256 && rect_x_value !== (rect_x_value = /*index*/ ctx[23] * /*sheet*/ ctx[21].sheet_width * /*scale*/ ctx[11])) {
    				attr_dev(rect, "x", rect_x_value);
    			}

    			if (dirty & /*$sheets*/ 256 && rect_width_value !== (rect_width_value = /*sheet*/ ctx[21].sheet_width * /*scale*/ ctx[11])) {
    				attr_dev(rect, "width", rect_width_value);
    			}

    			if (dirty & /*$sheets*/ 256 && rect_height_value !== (rect_height_value = /*sheet*/ ctx[21].sheet_height * /*scale*/ ctx[11])) {
    				attr_dev(rect, "height", rect_height_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(rect);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(148:4) {#each $sheets as sheet, index}",
    		ctx
    	});

    	return block;
    }

    // (180:8) {:else}
    function create_else_block$1(ctx) {
    	let text_1;
    	let t_value = /*panel*/ ctx[18].id + "";
    	let t;
    	let text_1_x_value;
    	let text_1_y_value;

    	const block = {
    		c: function create() {
    			text_1 = svg_element("text");
    			t = text(t_value);
    			attr_dev(text_1, "class", "idv print svelte-1f4wqfu");
    			attr_dev(text_1, "x", text_1_x_value = (/*panel*/ ctx[18].x0 - 0.25 + /*panel*/ ctx[18].width / 2) * /*scale*/ ctx[11]);
    			attr_dev(text_1, "y", text_1_y_value = (/*panel*/ ctx[18].y0 + 1 + /*panel*/ ctx[18].height / 2) * /*scale*/ ctx[11]);
    			add_location(text_1, file$1, 180, 12, 3682);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$panels*/ 1024 && t_value !== (t_value = /*panel*/ ctx[18].id + "")) set_data_dev(t, t_value);

    			if (dirty & /*$panels*/ 1024 && text_1_x_value !== (text_1_x_value = (/*panel*/ ctx[18].x0 - 0.25 + /*panel*/ ctx[18].width / 2) * /*scale*/ ctx[11])) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty & /*$panels*/ 1024 && text_1_y_value !== (text_1_y_value = (/*panel*/ ctx[18].y0 + 1 + /*panel*/ ctx[18].height / 2) * /*scale*/ ctx[11])) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(text_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(180:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (172:8) {#if panel.width > panel.height}
    function create_if_block$1(ctx) {
    	let text_1;
    	let t_value = /*panel*/ ctx[18].id + "";
    	let t;
    	let text_1_x_value;
    	let text_1_y_value;

    	const block = {
    		c: function create() {
    			text_1 = svg_element("text");
    			t = text(t_value);
    			attr_dev(text_1, "class", "idh print svelte-1f4wqfu");
    			attr_dev(text_1, "x", text_1_x_value = (/*panel*/ ctx[18].x0 + /*panel*/ ctx[18].width / 2) * /*scale*/ ctx[11]);
    			attr_dev(text_1, "y", text_1_y_value = (/*panel*/ ctx[18].y0 + 1 + /*panel*/ ctx[18].height / 2) * /*scale*/ ctx[11]);
    			add_location(text_1, file$1, 172, 12, 3430);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$panels*/ 1024 && t_value !== (t_value = /*panel*/ ctx[18].id + "")) set_data_dev(t, t_value);

    			if (dirty & /*$panels*/ 1024 && text_1_x_value !== (text_1_x_value = (/*panel*/ ctx[18].x0 + /*panel*/ ctx[18].width / 2) * /*scale*/ ctx[11])) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty & /*$panels*/ 1024 && text_1_y_value !== (text_1_y_value = (/*panel*/ ctx[18].y0 + 1 + /*panel*/ ctx[18].height / 2) * /*scale*/ ctx[11])) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(text_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(172:8) {#if panel.width > panel.height}",
    		ctx
    	});

    	return block;
    }

    // (160:4) {#each $panels as panel}
    function create_each_block(ctx) {
    	let rect;
    	let rect_id_value;
    	let rect_x_value;
    	let rect_y_value;
    	let rect_width_value;
    	let rect_height_value;
    	let if_block_anchor;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*panel*/ ctx[18].width > /*panel*/ ctx[18].height) return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			rect = svg_element("rect");
    			if_block.c();
    			if_block_anchor = empty();
    			attr_dev(rect, "class", "panel print svelte-1f4wqfu");
    			attr_dev(rect, "id", rect_id_value = /*panel*/ ctx[18].id);
    			attr_dev(rect, "x", rect_x_value = /*panel*/ ctx[18].x0 * /*scale*/ ctx[11]);
    			attr_dev(rect, "y", rect_y_value = /*panel*/ ctx[18].y0 * /*scale*/ ctx[11]);
    			attr_dev(rect, "width", rect_width_value = /*panel*/ ctx[18].width * /*scale*/ ctx[11]);
    			attr_dev(rect, "height", rect_height_value = /*panel*/ ctx[18].height * /*scale*/ ctx[11]);
    			add_location(rect, file$1, 160, 8, 3068);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, rect, anchor);
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(rect, "mouseover", /*showSizes*/ ctx[12], false, false, false),
    					listen_dev(rect, "mouseleave", /*hideSizes*/ ctx[13], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$panels*/ 1024 && rect_id_value !== (rect_id_value = /*panel*/ ctx[18].id)) {
    				attr_dev(rect, "id", rect_id_value);
    			}

    			if (dirty & /*$panels*/ 1024 && rect_x_value !== (rect_x_value = /*panel*/ ctx[18].x0 * /*scale*/ ctx[11])) {
    				attr_dev(rect, "x", rect_x_value);
    			}

    			if (dirty & /*$panels*/ 1024 && rect_y_value !== (rect_y_value = /*panel*/ ctx[18].y0 * /*scale*/ ctx[11])) {
    				attr_dev(rect, "y", rect_y_value);
    			}

    			if (dirty & /*$panels*/ 1024 && rect_width_value !== (rect_width_value = /*panel*/ ctx[18].width * /*scale*/ ctx[11])) {
    				attr_dev(rect, "width", rect_width_value);
    			}

    			if (dirty & /*$panels*/ 1024 && rect_height_value !== (rect_height_value = /*panel*/ ctx[18].height * /*scale*/ ctx[11])) {
    				attr_dev(rect, "height", rect_height_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(rect);
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(160:4) {#each $panels as panel}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let t;
    	let div;
    	let svg_1;
    	let g0;
    	let g1;
    	let svg_1_width_value;
    	let svg_1_height_value;
    	let svg_1_viewBox_value;
    	let if_block = /*checkSize*/ ctx[3] && create_if_block_1(ctx);
    	let each_value_1 = /*$sheets*/ ctx[8];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*$panels*/ ctx[10];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			div = element("div");
    			svg_1 = svg_element("svg");
    			g0 = svg_element("g");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			g1 = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(g0, "id", "sheets");
    			attr_dev(g0, "class", "svelte-1f4wqfu");
    			add_location(g0, file$1, 146, 4, 2685);
    			attr_dev(g1, "id", "panels");
    			attr_dev(g1, "class", "svelte-1f4wqfu");
    			add_location(g1, file$1, 158, 4, 3015);
    			attr_dev(svg_1, "class", "print svelte-1f4wqfu");
    			attr_dev(svg_1, "version", "1.1");
    			attr_dev(svg_1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg_1, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg_1, "width", svg_1_width_value = /*viewBoxW*/ ctx[7] * /*scale*/ ctx[11]);
    			attr_dev(svg_1, "height", svg_1_height_value = /*viewBoxH*/ ctx[9] * /*scale*/ ctx[11]);
    			attr_dev(svg_1, "viewBox", svg_1_viewBox_value = "0 0 " + /*viewBoxW*/ ctx[7] * /*scale*/ ctx[11] + " " + /*viewBoxH*/ ctx[9] * /*scale*/ ctx[11]);
    			attr_dev(svg_1, "preserveAspectRatio", "xMidYMid meet");
    			add_location(svg_1, file$1, 138, 0, 2398);
    			attr_dev(div, "class", "viewer svelte-1f4wqfu");
    			add_location(div, file$1, 137, 0, 2354);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, svg_1);
    			append_dev(svg_1, g0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(g0, null);
    			}

    			append_dev(svg_1, g1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g1, null);
    			}

    			/*div_binding*/ ctx[14](div);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*checkSize*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*$sheets, scale*/ 2304) {
    				each_value_1 = /*$sheets*/ ctx[8];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(g0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*$panels, scale, showSizes, hideSizes*/ 15360) {
    				each_value = /*$panels*/ ctx[10];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*viewBoxW*/ 128 && svg_1_width_value !== (svg_1_width_value = /*viewBoxW*/ ctx[7] * /*scale*/ ctx[11])) {
    				attr_dev(svg_1, "width", svg_1_width_value);
    			}

    			if (dirty & /*viewBoxH*/ 512 && svg_1_height_value !== (svg_1_height_value = /*viewBoxH*/ ctx[9] * /*scale*/ ctx[11])) {
    				attr_dev(svg_1, "height", svg_1_height_value);
    			}

    			if (dirty & /*viewBoxW, viewBoxH*/ 640 && svg_1_viewBox_value !== (svg_1_viewBox_value = "0 0 " + /*viewBoxW*/ ctx[7] * /*scale*/ ctx[11] + " " + /*viewBoxH*/ ctx[9] * /*scale*/ ctx[11])) {
    				attr_dev(svg_1, "viewBox", svg_1_viewBox_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			/*div_binding*/ ctx[14](null);
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

    function instance$1($$self, $$props, $$invalidate) {
    	let $sheets;
    	let $svg;
    	let $panels;
    	validate_store(sheets, "sheets");
    	component_subscribe($$self, sheets, $$value => $$invalidate(8, $sheets = $$value));
    	validate_store(svg, "svg");
    	component_subscribe($$self, svg, $$value => $$invalidate(15, $svg = $$value));
    	validate_store(panels, "panels");
    	component_subscribe($$self, panels, $$value => $$invalidate(10, $panels = $$value));

    	let id,
    		width,
    		height,
    		checkSize = false,
    		mx = 0,
    		my = 0,
    		top = 0,
    		left = 0,
    		scale = 90,
    		svgFile; // inches to pixels

    	afterUpdate(() => {
    		set_store_value(svg, $svg = svgFile.innerHTML.toString());
    	});

    	function showSizes() {
    		$$invalidate(3, checkSize = true);
    		let rect = this.getBoundingClientRect();
    		$$invalidate(4, top = rect.bottom + 12);
    		$$invalidate(5, left = rect.left + 12);
    		$$invalidate(0, id = this.id);
    		$$invalidate(1, width = this.width.baseVal.valueAsString);
    		$$invalidate(2, height = this.height.baseVal.valueAsString);
    	}

    	function hideSizes(event) {
    		$$invalidate(3, checkSize = false);
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
    			$$invalidate(6, svgFile);
    		});
    	}

    	$$self.$capture_state = () => ({
    		panels,
    		sheets,
    		svg,
    		afterUpdate,
    		id,
    		width,
    		height,
    		checkSize,
    		mx,
    		my,
    		top,
    		left,
    		scale,
    		svgFile,
    		showSizes,
    		hideSizes,
    		viewBoxW,
    		$sheets,
    		viewBoxH,
    		$svg,
    		$panels
    	});

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(0, id = $$props.id);
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("height" in $$props) $$invalidate(2, height = $$props.height);
    		if ("checkSize" in $$props) $$invalidate(3, checkSize = $$props.checkSize);
    		if ("mx" in $$props) mx = $$props.mx;
    		if ("my" in $$props) my = $$props.my;
    		if ("top" in $$props) $$invalidate(4, top = $$props.top);
    		if ("left" in $$props) $$invalidate(5, left = $$props.left);
    		if ("scale" in $$props) $$invalidate(11, scale = $$props.scale);
    		if ("svgFile" in $$props) $$invalidate(6, svgFile = $$props.svgFile);
    		if ("viewBoxW" in $$props) $$invalidate(7, viewBoxW = $$props.viewBoxW);
    		if ("viewBoxH" in $$props) $$invalidate(9, viewBoxH = $$props.viewBoxH);
    	};

    	let viewBoxW;
    	let viewBoxH;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$sheets*/ 256) {
    			 $$invalidate(7, viewBoxW = $sheets.length * $sheets[0].sheet_width || 61);
    		}

    		if ($$self.$$.dirty & /*$sheets*/ 256) {
    			 $$invalidate(9, viewBoxH = $sheets[0].sheet_height || 121);
    		}
    	};

    	return [
    		id,
    		width,
    		height,
    		checkSize,
    		top,
    		left,
    		svgFile,
    		viewBoxW,
    		$sheets,
    		viewBoxH,
    		$panels,
    		scale,
    		showSizes,
    		hideSizes,
    		div_binding
    	];
    }

    class Viewer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Viewer",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/components/Info.svelte generated by Svelte v3.24.1 */
    const file$2 = "src/components/Info.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (14:4) {#if $fileInfo.name}
    function create_if_block_1$1(ctx) {
    	let h2;
    	let t0_value = /*$fileInfo*/ ctx[0].name + "";
    	let t0;
    	let t1;
    	let if_block_anchor;
    	let if_block = /*$sheets*/ ctx[1].length > 1 && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			add_location(h2, file$2, 14, 8, 212);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t0);
    			insert_dev(target, t1, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$fileInfo*/ 1 && t0_value !== (t0_value = /*$fileInfo*/ ctx[0].name + "")) set_data_dev(t0, t0_value);

    			if (/*$sheets*/ ctx[1].length > 1) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(14:4) {#if $fileInfo.name}",
    		ctx
    	});

    	return block;
    }

    // (16:8) {#if $sheets.length > 1}
    function create_if_block_2(ctx) {
    	let p0;
    	let t1;
    	let p1;
    	let t2;
    	let t3_value = parseInt(/*$sheets*/ ctx[1].slice(0, -1).reduce(func, 0)) + "";
    	let t3;
    	let t4;

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			p0.textContent = "filled sheets";
    			t1 = space();
    			p1 = element("p");
    			t2 = text("waste: ");
    			t3 = text(t3_value);
    			t4 = text("%");
    			add_location(p0, file$2, 16, 12, 283);
    			add_location(p1, file$2, 17, 12, 316);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t2);
    			append_dev(p1, t3);
    			append_dev(p1, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$sheets*/ 2 && t3_value !== (t3_value = parseInt(/*$sheets*/ ctx[1].slice(0, -1).reduce(func, 0)) + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(16:8) {#if $sheets.length > 1}",
    		ctx
    	});

    	return block;
    }

    // (27:0) {#each $sheets as sheet, index}
    function create_each_block_1$1(ctx) {
    	let div;
    	let h4;
    	let t0_value = /*sheet*/ ctx[5].id + "";
    	let t0;
    	let t1;
    	let p0;
    	let t2;
    	let t3_value = parseInt(/*sheet*/ ctx[5].area) + "";
    	let t3;
    	let t4;
    	let p1;
    	let t5;
    	let t6_value = parseInt(/*sheet*/ ctx[5].waste_area) + "";
    	let t6;
    	let t7;
    	let p2;
    	let t8;
    	let t9_value = parseInt(/*sheet*/ ctx[5].waste_ratio * 100) + "";
    	let t9;
    	let t10;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			t0 = text(t0_value);
    			t1 = space();
    			p0 = element("p");
    			t2 = text("used area: ");
    			t3 = text(t3_value);
    			t4 = space();
    			p1 = element("p");
    			t5 = text("waste area: ");
    			t6 = text(t6_value);
    			t7 = space();
    			p2 = element("p");
    			t8 = text("waste: ");
    			t9 = text(t9_value);
    			t10 = text("%");
    			add_location(h4, file$2, 28, 8, 604);
    			add_location(p0, file$2, 29, 8, 632);
    			add_location(p1, file$2, 30, 8, 681);
    			add_location(p2, file$2, 31, 8, 737);
    			attr_dev(div, "class", "svelte-sf2keo");
    			add_location(div, file$2, 27, 4, 590);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);
    			append_dev(h4, t0);
    			append_dev(div, t1);
    			append_dev(div, p0);
    			append_dev(p0, t2);
    			append_dev(p0, t3);
    			append_dev(div, t4);
    			append_dev(div, p1);
    			append_dev(p1, t5);
    			append_dev(p1, t6);
    			append_dev(div, t7);
    			append_dev(div, p2);
    			append_dev(p2, t8);
    			append_dev(p2, t9);
    			append_dev(p2, t10);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$sheets*/ 2 && t0_value !== (t0_value = /*sheet*/ ctx[5].id + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*$sheets*/ 2 && t3_value !== (t3_value = parseInt(/*sheet*/ ctx[5].area) + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*$sheets*/ 2 && t6_value !== (t6_value = parseInt(/*sheet*/ ctx[5].waste_area) + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*$sheets*/ 2 && t9_value !== (t9_value = parseInt(/*sheet*/ ctx[5].waste_ratio * 100) + "")) set_data_dev(t9, t9_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(27:0) {#each $sheets as sheet, index}",
    		ctx
    	});

    	return block;
    }

    // (37:4) {#if $fileInfo.errors.length}
    function create_if_block$2(ctx) {
    	let h5;
    	let t0;
    	let t1_value = (/*$fileInfo*/ ctx[0].errors.length > 1 ? "S" : "") + "";
    	let t1;
    	let t2;
    	let t3;
    	let each_1_anchor;
    	let each_value = /*$fileInfo*/ ctx[0].errors;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
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
    			add_location(h5, file$2, 37, 8, 856);
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
    			if (dirty & /*$fileInfo*/ 1 && t1_value !== (t1_value = (/*$fileInfo*/ ctx[0].errors.length > 1 ? "S" : "") + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*$fileInfo*/ 1) {
    				each_value = /*$fileInfo*/ ctx[0].errors;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
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
    			if (detaching) detach_dev(h5);
    			if (detaching) detach_dev(t3);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(37:4) {#if $fileInfo.errors.length}",
    		ctx
    	});

    	return block;
    }

    // (39:8) {#each $fileInfo.errors as error}
    function create_each_block$1(ctx) {
    	let p;
    	let t_value = /*error*/ ctx[2] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$2, 39, 12, 966);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$fileInfo*/ 1 && t_value !== (t_value = /*error*/ ctx[2] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(39:8) {#each $fileInfo.errors as error}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let if_block0 = /*$fileInfo*/ ctx[0].name && create_if_block_1$1(ctx);
    	let each_value_1 = /*$sheets*/ ctx[1];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let if_block1 = /*$fileInfo*/ ctx[0].errors.length && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			div1 = element("div");
    			if (if_block1) if_block1.c();
    			attr_dev(div0, "class", "svelte-sf2keo");
    			add_location(div0, file$2, 12, 0, 173);
    			attr_dev(div1, "class", "svelte-sf2keo");
    			add_location(div1, file$2, 35, 0, 808);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			if (if_block0) if_block0.m(div0, null);
    			insert_dev(target, t0, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			if (if_block1) if_block1.m(div1, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$fileInfo*/ ctx[0].name) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*parseInt, $sheets*/ 2) {
    				each_value_1 = /*$sheets*/ ctx[1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(t1.parentNode, t1);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (/*$fileInfo*/ ctx[0].errors.length) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (if_block0) if_block0.d();
    			if (detaching) detach_dev(t0);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			if (if_block1) if_block1.d();
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

    const func = (total, waste, i, array) => total + waste.waste_ratio * 100 / array.length;

    function instance$2($$self, $$props, $$invalidate) {
    	let $fileInfo;
    	let $sheets;
    	validate_store(fileInfo, "fileInfo");
    	component_subscribe($$self, fileInfo, $$value => $$invalidate(0, $fileInfo = $$value));
    	validate_store(sheets, "sheets");
    	component_subscribe($$self, sheets, $$value => $$invalidate(1, $sheets = $$value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Info> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Info", $$slots, []);
    	$$self.$capture_state = () => ({ sheets, fileInfo, $fileInfo, $sheets });
    	return [$fileInfo, $sheets];
    }

    class Info extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Info",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.24.1 */
    const file$3 = "src/App.svelte";

    // (37:2) {#if $sheets.length}
    function create_if_block$3(ctx) {
    	let viewer;
    	let t;
    	let div;
    	let info;
    	let current;
    	viewer = new Viewer({ $$inline: true });
    	info = new Info({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(viewer.$$.fragment);
    			t = space();
    			div = element("div");
    			create_component(info.$$.fragment);
    			attr_dev(div, "class", "info svelte-j2egch");
    			add_location(div, file$3, 42, 2, 804);
    		},
    		m: function mount(target, anchor) {
    			mount_component(viewer, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(info, div, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(viewer.$$.fragment, local);
    			transition_in(info.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(viewer.$$.fragment, local);
    			transition_out(info.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(viewer, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			destroy_component(info);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(37:2) {#if $sheets.length}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div1;
    	let div0;
    	let import_1;
    	let t;
    	let current;
    	import_1 = new Import({ $$inline: true });
    	let if_block = /*$sheets*/ ctx[0].length && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(import_1.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(div0, "class", "import svelte-j2egch");
    			add_location(div0, file$3, 27, 2, 570);
    			attr_dev(div1, "class", "container svelte-j2egch");
    			add_location(div1, file$3, 26, 0, 544);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(import_1, div0, null);
    			append_dev(div1, t);
    			if (if_block) if_block.m(div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$sheets*/ ctx[0].length) {
    				if (if_block) {
    					if (dirty & /*$sheets*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(import_1.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(import_1.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(import_1);
    			if (if_block) if_block.d();
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

    function instance$3($$self, $$props, $$invalidate) {
    	let $sheets;
    	validate_store(sheets, "sheets");
    	component_subscribe($$self, sheets, $$value => $$invalidate(0, $sheets = $$value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	$$self.$capture_state = () => ({ Import, Viewer, Info, sheets, $sheets });
    	return [$sheets];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    const app = new App({
      target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
