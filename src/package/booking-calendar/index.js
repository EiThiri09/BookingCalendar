import date_utils from './date_utils';
import { $, createSVG } from './svg_utils';
import Bar from './bar';
import Arrow from './arrow';
import Popup from './popup';
import moment from 'moment';
import './gantt.scss';
import Plus from '../../assets/plus-color.svg';
const VIEW_MODE = {
    QUARTER_DAY: 'Quarter Day',
    HALF_DAY: 'Half Day',
    DAY: 'Day',
    WEEK: 'Week',
    MONTH: 'Month',
    YEAR: 'Year'
};

export default class Gantt {
    constructor(wrapper, tasks, options) {
        this.setup_wrapper(wrapper);
        this.setup_options(options);
        this.setup_properties(tasks);
        // initialize with default view mode
        this.change_view_mode();
        this.bind_events();

    }


    setup_wrapper(element) {

        let svg_element, wrapper_element;

        // CSS Selector is passed
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }

        // get the SVGElement
        if (element instanceof HTMLElement) {
            wrapper_element = element;
            svg_element = element.querySelector('svg');
        } else if (element instanceof SVGElement) {
            svg_element = element;
        } else {
            throw new TypeError(
                'Frappé Gantt only supports usage of a string CSS selector,' +
                " HTML DOM element or SVG DOM element for the 'element' parameter"
            );
        }

        // svg element
        if (!svg_element) {
            // create it
            this.$svg = createSVG('svg', {
                append_to: wrapper_element,
                class: 'gantt'
            });
        } else {
            this.$svg = svg_element;
            this.$svg.classList.add('gantt');
        }

        // wrapper element
        this.$container = document.createElement('div');
        this.$container.classList.add('gantt-container');

        const parent_element = this.$svg.parentElement;

        if (parent_element.classList.contains('gantt-container')) {
            parent_element.innerHTML = '';
        }
        parent_element.appendChild(this.$container);

        if (this.$container.classList.contains('gantt')) {
            this.$container.innerHTML = '';
        }
        this.$container.appendChild(this.$svg);

        // popup wrapper
        this.popup_wrapper = document.createElement('div');
        this.popup_wrapper.classList.add('popup-wrapper');

        if (this.$container.classList.contains('popup-wrapper')) {
            this.$container.innerHTML = "";
        }
        this.$container.appendChild(this.popup_wrapper);
    }

    setup_options(options) {
        const default_options = {
            header_height: 50,
            column_width: 30,
            step: 24,
            view_modes: [...Object.values(VIEW_MODE)],
            bar_height: 40,
            bar_corner_radius: 3,
            arrow_curve: 5,
            padding: 18,
            view_mode: 'Week',
            date_format: 'YYYY-MM-DD HH',
            popup_trigger: 'mouseover',
            custom_popup_html: null,
            language: 'en',
            start_date: null,
            end_date: null,
            actions_width: 200,
            show_label: true,
            bar_margin: 3,
            animations_active: false,
            init_scroll_position: null,
            default_booking_length_in_days: 3,
            custom_click_on_bar: function (task) { },
            add_new_data_entry: function (task) { }
        };

        this.options = Object.assign({}, default_options, options);
        this.setup_dates();
    }

    setup_properties(properties) {
        let tasks = [];
        this.properties = properties;
        properties.map((property, propertyIndex) => {
            tasks.push(
                ...this.setup_tasks(property['bookings'], propertyIndex)
            );
        });
        this.tasks = tasks;

        this.setup_dependencies();
    }

    setup_tasks(tasks, propertyIndex) {
        // prepare tasks
        return tasks.map((task, i) => {
            // convert to Date objects
            task._start = date_utils.parse(task.start);
            task._end = date_utils.parse(task.end);

            // make task invalid if duration too large
            if (date_utils.diff(task._end, task._start, 'year') > 10) {
                task.end = null;
            }

            // cache index
            task._index = propertyIndex;
            task.group_name = this.properties[propertyIndex]['name'];
            task.bg_color = this.properties[propertyIndex]['background_color'];

            // invalid dates
            if (!task.start && !task.end) {
                const today = date_utils.today();
                task._start = today;
                task._end = date_utils.add(today, 2, 'day');
            }

            if (!task.start && task.end) {
                task._start = date_utils.add(task._end, -2, 'day');
            }

            if (task.start && !task.end) {
                task._end = date_utils.add(task._start, 2, 'day');
            }

            // if hours is not set, assume the last day is full day
            // e.g: 2018-09-09 becomes 2018-09-09 23:59:59
            // const task_end_values = date_utils.get_date_values(task._end);
            // if (task_end_values.slice(3).every(d => d === 0)) {
            //     task._end = date_utils.add(task._end, 24, 'hour');
            // }

            // invalid flag
            if (!task.start || !task.end) {
                task.invalid = true;
            }

            // dependencies
            if (typeof task.dependencies === 'string' || !task.dependencies) {
                let deps = [];
                if (task.dependencies) {
                    deps = task.dependencies
                        .split(',')
                        .map(d => d.trim())
                        .filter(d => d);
                }
                task.dependencies = deps;
            }

            // uids
            if (!task.id) {
                task.id = generate_id(task);
            }


            return task;
        });
    }

    setup_dependencies() {
        this.dependency_map = {};
        for (let t of this.tasks) {
            for (let d of t.dependencies) {
                this.dependency_map[d] = this.dependency_map[d] || [];
                this.dependency_map[d].push(t.id);
            }
        }

    }

    refresh(properties) {
        this.setup_properties(properties);
        this.change_view_mode();
    }

    change_view_mode(mode = this.options.view_mode) {
        this.update_view_scale(mode);
        this.setup_dates();
        this.render();
        // fire viewmode_change event
        this.trigger_event('view_change', [mode]);
    }

    update_view_scale(view_mode) {
        this.options.view_mode = view_mode;

        if (view_mode === VIEW_MODE.DAY) {
            this.options.step = 24;
            this.options.column_width = 120;
        } else if (view_mode === VIEW_MODE.WEEK) {
            this.options.step = 7;
            this.options.column_width = 120;
        } else if (view_mode === VIEW_MODE.MONTH) {
            this.options.step = 31;
            this.options.column_width = 120;
        }
    }

    setup_dates() {
        this.setup_gantt_dates();
        this.setup_date_values();
    }

    setup_gantt_dates() {

        this.gantt_start = this.gantt_end = null;

        if (
            this.options.start_date !== null &&
            this.options.end_date !== null
        ) {
            this.gantt_start = date_utils.parse(this.options.start_date);
            this.gantt_end = date_utils.parse(this.options.end_date);
            return;
        }


        for (let task of this.tasks) {
            // set global start and end date
            // if (!this.gantt_start || task._start < this.gantt_start) {
            //     this.gantt_start = task._start;
            // }
            // if (!this.gantt_end || task._end > this.gantt_end) {
            //     this.gantt_end = task._end;
            // }
        }

        // this.gantt_start = date_utils.start_of(this.gantt_start, 'day');
        // this.gantt_end = date_utils.start_of(this.gantt_end, 'day');

        // add date padding on both sides
        // if (this.view_is([VIEW_MODE.QUARTER_DAY, VIEW_MODE.HALF_DAY])) {
        //     this.gantt_start = date_utils.add(this.gantt_start, -7, 'day');
        //     this.gantt_end = date_utils.add(this.gantt_end, 7, 'day');
        // } else if (this.view_is(VIEW_MODE.MONTH)) {
        //     this.gantt_start = date_utils.start_of(this.gantt_start, 'year');
        //     this.gantt_end = date_utils.add(this.gantt_end, 1, 'year');
        // } else if (this.view_is(VIEW_MODE.YEAR)) {
        //     this.gantt_start = date_utils.add(this.gantt_start, -2, 'year');
        //     this.gantt_end = date_utils.add(this.gantt_end, 2, 'year');
        // } else {
        //     this.gantt_start = date_utils.add(this.gantt_start, -7, 'month');
        //     this.gantt_end = date_utils.add(this.gantt_end, 7, 'month');
        // }


        // if (this.view_is(VIEW_MODE.MONTH)) {
        //     this.gantt_start = date_utils.start_of(this.gantt_start, 'year');
        //     this.gantt_end = date_utils.add(this.gantt_end, 1, 'year');
        // }
    }

    setup_date_values() {
        this.dates = [];
        let cur_date = null;


        if (this.view_is(VIEW_MODE.MONTH) || this.view_is(VIEW_MODE.WEEK)) {


            while (cur_date === null || moment(cur_date).format('L') < moment(this.gantt_end).format('L')) {

                if (cur_date === null) {
                    cur_date = date_utils.clone(this.gantt_start);
                } else {
                    if (this.view_is(VIEW_MODE.WEEK) || this.view_is(VIEW_MODE.MONTH)) {
                        cur_date = date_utils.add(cur_date, 1, 'day');
                    }
                }

                this.dates.push(cur_date);
            }
        }


        if (this.view_is(VIEW_MODE.DAY)) {

            while (cur_date === null || this.dates.length < this.options.step) {
                if (cur_date === null) {
                    cur_date = date_utils.clone(this.gantt_start);
                } else {
                    cur_date = date_utils.add(cur_date, 1, 'hour');
                }

                this.dates.push(cur_date);

            }

        }


    }

    bind_events() {
        this.bind_grid_click();
        this.bind_bar_events();
    }

    render() {
        this.clear();
        this.setup_layers();
        this.make_grid();
        this.make_dates();
        this.make_bars();
        //this.make_arrows();
        //this.map_arrows_on_bars();
        this.make_actions();
        this.set_width();
        this.set_scroll_position();

    }

    setup_layers() {
        this.topLayers = {};
        const topLayers = [
            'actions',
            'content'
        ];
        // make group layers
        for (let layer of topLayers) {
            this.topLayers[layer] = createSVG('svg', {
                class: layer,
                append_to: this.$svg
            });
        }

        createSVG('g', {
            class: 'content',
            append_to: this.$svg
        });

        this.layers = {};
        const layers = [
            'grid',
            'date',
            'arrow',
            'progress',
            'bar',
            'details',
            'gridRow',
            'cell'
        ];
        // make group layers
        for (let layer of layers) {
            this.layers[layer] = createSVG('svg', {
                x: this.options.actions_width,
                class: layer,
                append_to: this.topLayers.content
            });
        }
    }

    make_actions() {

        const rows_layer = createSVG('g', { append_to: this.topLayers.actions });
        const lines_layer = createSVG('g', { append_to: this.topLayers.actions });
        const grid_layer = createSVG('g', { append_to: this.layers.gridRow });
        const cell_layer = createSVG('g', { append_to: this.layers.cell });

        const row_width = this.dates.length * this.options.column_width;
        const row_height = this.options.bar_height + this.options.padding;

        let row_y = this.options.header_height + this.options.padding / 2;

        //this.properties.forEach((property, idx) => {
        for (let j = 0; j < this.properties.length; j++) {

            const property = this.properties[j];


            createSVG('rect', {
                x: 0,
                y: row_y,
                width: row_width,
                height: row_height,
                class: 'grid-row',
                append_to: rows_layer
            });

            createSVG('line', {
                x1: 0,
                y1: row_y + row_height,
                x2: row_width,
                y2: row_y + row_height,
                class: 'row-line',
                append_to: lines_layer
            });

            createSVG('text', {
                x: this.options.actions_width / 2,
                y: row_y + row_height / 2,
                innerHTML: property.name.replace(/(.{25})..+/, '$1…'),
                class: 'actions-label',
                append_to: lines_layer
            });

            // Create and append cells to the grid_layer
            for (let i = 0; i < this.dates.length; i++) {

                let isOccupiedCell = false;
                const cellx = (i * this.options.column_width);
                const cellend = cellx + (this.options.column_width - 10);
                const cellY = this.options.header_height +
                    this.options.padding +
                    i * (this.options.bar_height + this.options.padding);
                const cellHeight = cellY + this.options.bar_height;
                const dateInfo = this.dates[i];

                for (const bar of property.bookings) {
                    if (bar._start >= this.gantt_start) {
                        if (moment(bar._start).format('MM DD YYYY') === moment(dateInfo).format('MM DD YYYY') || (bar._start <= dateInfo && bar._end >= dateInfo)) {
                            isOccupiedCell = true;
                            //break;
                        }
                    }
                }
                // console.log("check cell info start and end", property)


                if (!isOccupiedCell) {

                    const emptyCell = createSVG('rect', {
                        x: cellx,
                        y: row_y,
                        width: this.options.column_width - 10,
                        height: row_height - 10,
                        class: 'cell',
                        append_to: grid_layer
                    });

                    const plusIcon = createSVG('image', {
                        x: cellx + 50, // Adjust the position based on the icon's width
                        y: row_y + 25, // Adjust the position based on the icon's height
                        width: 20, // Set the width of the icon
                        height: 20, // Set the height of the icon
                        href: Plus, // Replace with the actual path to your icon image
                        class: 'plus-icon', // Add any necessary CSS class
                        'data-id': j,
                        append_to: grid_layer
                    });
                    $.on(emptyCell, 'mouseover ', e => {
                        plusIcon.classList.add('active');

                    });
                    $.on(plusIcon, 'mouseover ', e => {
                        plusIcon.classList.add('active');

                    });
                    $.on(emptyCell, 'mouseout ', e => {
                        plusIcon.classList.remove('active');

                    });
                    $.on(plusIcon, 'mouseout ', e => {
                        plusIcon.classList.remove('active');

                    });
                    $.on(emptyCell, 'click ', e => {
                        const startD = dateInfo.toString();
                        const vehicleID = property.id;
                        this.options.add_new_data_entry(startD, vehicleID);

                    });
                    $.on(plusIcon, 'click ', e => {
                        const startD = dateInfo.toString();
                        const vehicleID = property.id;
                        this.options.add_new_data_entry(startD, vehicleID);

                    });

                }

            }

            row_y += this.options.bar_height + this.options.padding;
        };

    }

    make_grid() {
        this.make_grid_background();
        this.make_grid_rows();
        this.make_grid_header();
        this.make_grid_ticks();
        this.make_grid_highlights();
    }

    make_grid_background() {
        const grid_width = this.dates.length * this.options.column_width;
        this.gridWidth = this.dates.length * this.options.column_width;;
        const grid_height =
            this.options.header_height +
            this.options.padding +
            (this.options.bar_height + this.options.padding) *
            this.properties.length;

        createSVG('rect', {
            x: 0,
            y: 0,
            width: grid_width,
            height: grid_height,
            class: 'grid-background',
            append_to: this.layers.grid
        });

        $.attr(this.$svg, {
            height: grid_height + this.options.padding + 100,
            width: '100%'
        });
    }

    make_grid_rows() {
        const rows_layer = createSVG('g', { append_to: this.layers.grid });
        const lines_layer = createSVG('g', { append_to: this.layers.grid });

        const row_width = this.dates.length * this.options.column_width + 200;
        const row_height = this.options.bar_height + this.options.padding;

        let row_y = this.options.header_height + this.options.padding / 2;

        this.properties.forEach((property) => {
            createSVG('rect', {
                x: 0,
                y: row_y,
                width: row_width,
                height: row_height,
                class: 'grid-row',
                append_to: rows_layer
            });

            createSVG('line', {
                x1: 0,
                y1: row_y + row_height,
                x2: row_width,
                y2: row_y + row_height,
                class: 'row-line',
                append_to: lines_layer
            });

            row_y += this.options.bar_height + this.options.padding;
        });
    }

    make_grid_header() {
        const header_width = this.dates.length * this.options.column_width;
        this.header_height = this.options.header_height + 10;
        createSVG('rect', {
            x: 0,
            y: 0,
            width: header_width,
            height: this.header_height,
            class: 'grid-header',
            append_to: this.layers.grid
        });
    }

    make_grid_ticks() {
        let tick_x = 0;
        let tick_y = this.options.header_height + this.options.padding / 2;
        let tick_height =
            (this.options.bar_height + this.options.padding) *
            this.properties.length;

        for (let date of this.dates) {
            let tick_class = 'tick';
            // thick tick for monday
            if (this.view_is(VIEW_MODE.DAY) && date.getDate() === 1) {
                tick_class += ' thick';
            }
            // thick tick for first week
            if (
                this.view_is(VIEW_MODE.WEEK) &&
                date.getDate() >= 1 &&
                date.getDate() < 8
            ) {
                tick_class += ' thick';
            }
            // thick ticks for quarters
            if (
                this.view_is(VIEW_MODE.MONTH) &&
                (date.getMonth() + 1) % 3 === 0
            ) {
                tick_class += ' thick';
            }

            createSVG('path', {
                d: `M ${tick_x} ${tick_y} v ${tick_height}`,
                class: tick_class,
                append_to: this.layers.grid
            });

            // if (this.view_is(VIEW_MODE.MONTH)) {
            //     tick_x +=
            //         date_utils.get_days_in_month(date) *
            //         this.options.column_width /
            //         30;
            // } else {
            //     tick_x += this.options.column_width;
            // }
            tick_x += this.options.column_width;
        }
    }

    make_grid_highlights() {
        // highlight today's date
        let x = "";
        if (this.view_is(VIEW_MODE.MONTH) || this.view_is(VIEW_MODE.WEEK)) {
            x = date_utils.diff(date_utils.today(), this.gantt_start, 'day') * this.options.column_width;
            const y = 0;

            const width = this.options.column_width;
            const height =
                (this.options.bar_height + this.options.padding) *
                this.properties.length +
                this.options.header_height +
                this.options.padding / 2;

            createSVG('rect', {
                x,
                y,
                width,
                height,
                class: 'today-highlight',
                append_to: this.layers.grid
            });
        }


        // }
    }

    make_dates() {

        for (let date of this.get_dates_to_draw()) {
            createSVG('text', {
                x: date.lower_x + 60,
                y: date.lower_y,
                width: this.options.column_width,
                innerHTML: date.lower_text,
                class: 'lower-text',
                append_to: this.layers.date
            });

        }

        const getTextInfo = this.getUpperText();

        const $upper_text = createSVG('text', {
            x: this.gridWidth / 2,
            y: this.options.header_height - 25,
            width: this.gridWidth,
            innerHTML: getTextInfo.upper_text,
            class: 'upper-text',
            append_to: this.layers.grid
        });

        // remove out-of-bound dates
        if (
            $upper_text.getBBox().x2 > this.layers.grid.getBBox().width
        ) {
            $upper_text.remove();
        }

    }

    get_dates_to_draw() {
        let last_date = null;
        const dates = this.dates.map((date, i) => {
            const d = this.get_date_info(date, last_date, i);
            last_date = date;
            return d;
        });

        return dates;
    }

    getMonthColHeader(date) {
        let text = "";
        let dayDateNo = date_utils.format(date, 'DD', this.options.language);
        if (dayDateNo[0] === "0") {
            dayDateNo = dayDateNo[1];
        }
        let lastDateNo = dayDateNo[dayDateNo.length - 1];

        if (lastDateNo === "1") {
            text = dayDateNo + "st";
        } else if (lastDateNo === "2") {
            text = dayDateNo + "nd";
        } else if (lastDateNo === "3") {
            text = dayDateNo + "rd";
        } else {
            text = dayDateNo + "th";

        }
        return text;
    }

    get_date_info(date, last_date, i) {
        if (!last_date) {
            last_date = date_utils.add(date, 1, 'year');
        }
        const daysOfName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const monthColText = this.getMonthColHeader(date);

        const date_text = {

            Day_lower: moment(date).format('LT'),
            //date_utils.format(date, 'HH', this.options.language),

            Week_lower: moment(date).format('ddd DD'),
            // daysOfName[i] + " " + date_utils.format(date, 'DD', this.options.language),

            Month_lower: moment(date).format('Do'),

        };

        const base_pos = {
            x: (i) * this.options.column_width,
            lower_y: this.options.header_height,
            upper_y: this.options.header_height - 25
        };

        const x_pos = {
            'Quarter Day_lower': this.options.column_width * 4 / 2,
            'Quarter Day_upper': 0,
            'Half Day_lower': this.options.column_width * 2 / 2,
            'Half Day_upper': 0,
            Day_lower: this.options.column_width / 2,
            Day_upper: this.options.column_width * 30 / 2,
            Week_lower: 0,
            Week_upper: this.options.column_width * 4 / 2,
            Month_lower: this.options.column_width / 2,
            Month_upper: this.options.column_width * 12 / 2,
            Year_lower: this.options.column_width / 2,
            Year_upper: this.options.column_width * 30 / 2
        };

        this.headerColumnsInfo = {
            upper_text: date_text[`${this.options.view_mode}_upper`],
            lower_text: date_text[`${this.options.view_mode}_lower`],
            upper_x: base_pos.x + x_pos[`${this.options.view_mode}_upper`],
            upper_y: base_pos.upper_y,
            lower_x: base_pos.x + x_pos[`${this.options.view_mode}_lower`],
            lower_y: base_pos.lower_y,
            date: date
        }


        return {
            upper_text: date_text[`${this.options.view_mode}_upper`],
            lower_text: date_text[`${this.options.view_mode}_lower`],
            upper_x: base_pos.x + x_pos[`${this.options.view_mode}_upper`],
            upper_y: base_pos.upper_y,
            lower_x: base_pos.x + 10,
            lower_y: base_pos.lower_y,
            date: date
        };
    }


    getUpperText() {

        const date_text = {

            Day_upper:
                date_utils.format(this.gantt_start, 'MMMM DD ,YYYY', this.options.language),
            Week_upper:
                date_utils.format(this.gantt_start, 'MMMM DD ,YYYY', this.options.language) + " - " + date_utils.format(this.gantt_end, 'MMMM DD ,YYYY', this.options.language),
            Month_upper:
                date_utils.format(this.gantt_start, 'MMMM DD ,YYYY', this.options.language) + " - " + date_utils.format(this.gantt_end, 'MMMM DD ,YYYY', this.options.language),

        };

        return {
            upper_text: date_text[`${this.options.view_mode}_upper`],
        }
    }

    make_bars() {
        this.bars = [];
        this.tasks.map(task => {

            //console.log("check end and start date", task.name, task._start, this.gantt_start, task._end, this.gantt_end)
            if (task._start >= this.gantt_start) {
                const bar = new Bar(this, task, this.options.show_label);
                this.layers.bar.appendChild(bar.group);
                //return bar;
                this.bars.push(bar);
            }


        });

        this.dates.map((task, i) => {

            const row_y = this.options.header_height +
                this.options.padding +
                i * (this.bar_height + this.options.padding)
            const row_height = 10

            createSVG('rect', {
                x: (i * this.options.column_width) - 10,
                y: row_y,
                width: this.options.column_width - 10,
                height: row_height - 10,
                class: 'cell',
                append_to: this.layers.bar
            });

            // const bar = new Bar(this, task, this.options.show_label);
            // this.layers.bar.appendChild(bar.group);
            // return bar;
        });


    }

    make_arrows() {
        this.arrows = [];
        for (let task of this.tasks) {
            let arrows = [];
            arrows = task.dependencies
                .map(task_id => {
                    const dependency = this.get_task(task_id);
                    if (!dependency) return;
                    const arrow = new Arrow(
                        this,
                        this.bars[dependency._index], // from_task
                        this.bars[task._index] // to_task
                    );
                    this.layers.arrow.appendChild(arrow.element);
                    return arrow;
                })
                .filter(Boolean); // filter falsy values
            this.arrows = this.arrows.concat(arrows);
        }
    }

    map_arrows_on_bars() {
        for (let bar of this.bars) {
            bar.arrows = this.arrows.filter(arrow => {
                return (
                    arrow.from_task.task.id === bar.task.id ||
                    arrow.to_task.task.id === bar.task.id
                );
            });
        }
    }

    set_width() {
        const cur_width = this.$svg.getBoundingClientRect().width;
        const actual_width = this.$svg
            .querySelector('.grid .grid-row')
            .getAttribute('width');
        if (cur_width < actual_width) {
            this.$svg.setAttribute('width', actual_width);
        }
    }

    set_scroll_position() {

        const parent_element = this.$svg.parentElement;
        if (!parent_element) return;
        if (this.options.init_scroll_position) {
            parent_element.scrollLeft = this.options.init_scroll_position;
            return;
        }


        const hours_before_first_task = date_utils.diff(
            this.get_oldest_starting_date(),
            this.gantt_start,
            'hour'
        );

        const scroll_pos =
            hours_before_first_task /
            this.options.step *
            this.options.column_width -
            this.options.column_width;
        parent_element.scrollLeft = scroll_pos;
    }

    send_event_to_add_new_entry(e) {
        console.log(e);
        const rowHeight = this.options.bar_height + this.options.padding;
        const row = Math.floor((e.offsetY - this.header_height) / rowHeight)
        const column = Math.floor(((e.offsetX - 1) - this.options.actions_width) / this.options.column_width)
        const newStartDate = date_utils.add(this.gantt_start, column, 'day');
        const newEndDate = date_utils.add(newStartDate, this.options.default_booking_length_in_days, 'day');


        this.trigger_event('date_added', [
            newStartDate,
            newEndDate,
            this.properties[row],
            row,
            e.offsetX - e.layerX - 1,
            e.offsetY - e.layerY - 1
        ]);
    }

    bind_grid_click() {

        $.on(
            this.$svg,
            this.options.popup_trigger,
            '.grid-row, .grid-header',
            () => {

                this.unselect_all();
                this.hide_popup();
            }
        );
        console.log("check empty cell info", this.group)

        // $.on(
        //     this.$svg,
        //     'click',
        //     '.grid-row',
        //     (e) => {

        //         console.log("hover on gird row")
        //         this.send_event_to_add_new_entry(e)
        //     }
        // );
        // $.on(
        //     this.$svg,
        //     'focus',
        //     '.cell',
        //     (e) => {

        //         //console.log("hover on gird row")
        //         // this.send_event_to_add_new_entry(e);
        //         //this.group.classList.add('active');
        //     }
        // );


        // createSVG('text', {
        //     x: this.x + this.width / 2,
        //     y: this.y + this.height / 2,
        //     innerHTML: this.task.name,
        //     class: 'bar-label',
        //     append_to: this.bar_group
        // });
    }

    bind_bar_events() {
        let is_dragging = false;
        let x_on_start = 0;
        let y_on_start = 0;
        let is_resizing_left = false;
        let is_resizing_right = false;
        let parent_bar_id = null;
        let bars = []; // instanceof Bar
        this.bar_being_dragged = null;

        function action_in_progress() {
            return is_dragging || is_resizing_left || is_resizing_right;
        }

        $.on(this.$svg, 'mousedown', '.bar-wrapper, .handle', (e, element) => {
            const bar_wrapper = $.closest('.bar-wrapper', element);

            if (element.classList.contains('left')) {
                is_resizing_left = true;
            } else if (element.classList.contains('right')) {
                is_resizing_right = true;
            } else if (element.classList.contains('bar-wrapper')) {
                is_dragging = true;
            }

            bar_wrapper.classList.add('active');

            x_on_start = e.offsetX;
            y_on_start = e.offsetY;

            parent_bar_id = bar_wrapper.getAttribute('data-id');
            const ids = [
                parent_bar_id,
                ...this.get_all_dependent_tasks(parent_bar_id)
            ];
            bars = ids.map(id => this.get_bar(id));

            this.bar_being_dragged = parent_bar_id;

            bars.forEach(bar => {
                if (!bar) {
                    return;
                }
                const $bar = bar.$bar;
                $bar.ox = $bar.getX();
                $bar.oy = $bar.getY();
                $bar.owidth = $bar.getWidth();
                $bar.finaldx = 0;
            });
        });

        $.on(this.$svg, 'mousemove', e => {
            if (!action_in_progress()) return;
            const dx = e.offsetX - x_on_start;

            bars.forEach(bar => {
                if (!bar) {
                    return;
                }
                const $bar = bar.$bar;
                $bar.finaldx = this.get_snap_position(dx);

                if (is_resizing_left) {
                    if (parent_bar_id === bar.task.id) {
                        bar.update_bar_position({
                            x: $bar.ox + $bar.finaldx,
                            width: $bar.owidth - $bar.finaldx
                        });
                    } else {
                        bar.update_bar_position({
                            x: $bar.ox + $bar.finaldx
                        });
                    }
                } else if (is_resizing_right) {
                    if (parent_bar_id === bar.task.id) {
                        bar.update_bar_position({
                            width: $bar.owidth + $bar.finaldx
                        });
                    }
                } else if (is_dragging) {
                    bar.update_bar_position({ x: $bar.ox + $bar.finaldx });
                }
            });
        });

        document.addEventListener('mouseup', e => {
            if (is_dragging || is_resizing_left || is_resizing_right) {
                bars.forEach(bar => {
                    if (!bar) {
                        return;
                    }
                    bar.group.classList.remove('active')
                });
            }

            is_dragging = false;
            is_resizing_left = false;
            is_resizing_right = false;
        });

        $.on(this.$svg, 'mouseup', e => {
            this.bar_being_dragged = null;
            bars.forEach(bar => {
                if (!bar) {
                    return;
                }
                const $bar = bar.$bar;
                if (!$bar.finaldx) return;
                bar.date_changed(e);
                bar.set_action_completed();
            });
        });
    }

    get_all_dependent_tasks(task_id) {
        let out = [];
        let to_process = [task_id];
        while (to_process.length) {
            const deps = to_process.reduce((acc, curr) => {
                acc = acc.concat(this.dependency_map[curr]);
                return acc;
            }, []);

            out = out.concat(deps);
            to_process = deps.filter(d => !to_process.includes(d));
        }

        return out.filter(Boolean);
    }

    get_snap_position(dx) {
        let odx = dx,
            rem,
            position;

        if (this.view_is(VIEW_MODE.WEEK)) {
            rem = dx % (this.options.column_width);
            position =
                odx -
                rem +
                (rem < this.options.column_width
                    ? 0
                    : this.options.column_width);
        } else if (this.view_is(VIEW_MODE.MONTH)) {
            rem = dx % (this.options.column_width / 30);
            position =
                odx -
                rem +
                (rem < this.options.column_width / 60
                    ? 0
                    : this.options.column_width / 30);
        } else {
            rem = dx % this.options.column_width;
            position =
                odx -
                rem +
                (rem < this.options.column_width / 2
                    ? 0
                    : this.options.column_width);
        }

        return position;
    }

    unselect_all() {
        [...this.$svg.querySelectorAll('.bar-wrapper')].forEach(el => {
            el.classList.remove('active');
        });
    }

    view_is(modes) {
        if (typeof modes === 'string') {
            return this.options.view_mode === modes;
        }

        if (Array.isArray(modes)) {
            return modes.some(mode => this.options.view_mode === mode);
        }

        return false;
    }

    get_task(id) {
        return this.tasks.find(task => {
            return task.id === id;
        });
    }

    get_bar(id) {

        return this.bars.find(bar => {
            console.log("check bars info", bar)

            if (bar) {
                return bar.task.id === id;
            }

        });
    }

    show_popup(options) {
        if (!this.popup) {
            this.popup = new Popup(
                this.popup_wrapper,
                this.options.custom_popup_html,
                this.options.actions_width
            );
        }
        this.popup.show(options);
    }

    hide_popup() {
        this.popup && this.popup.hide();
    }

    trigger_event(event, args) {
        if (this.options['on_' + event]) {
            this.options['on_' + event].apply(null, args);
        }
    }

    /**
     * Gets the oldest starting date from the list of tasks
     *
     * @returns Date
     * @memberof Gantt
     */
    get_oldest_starting_date() {
        return this.tasks
            .map(task => task._start)
            .reduce(
                (prev_date, cur_date) =>
                    cur_date <= prev_date ? cur_date : prev_date
                , 0);
    }

    /**
     * Clear all elements from the parent svg element
     *
     * @memberof Gantt
     */
    clear() {
        this.$svg.innerHTML = '';
    }
}

Gantt.VIEW_MODE = VIEW_MODE;

function generate_id(task) {
    return (
        task.name +
        '_' +
        Math.random()
            .toString(36)
            .slice(2, 12)
    );
}
