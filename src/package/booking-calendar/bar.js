import date_utils from './date_utils';
import { $, createSVG, animateSVG } from './svg_utils';
import moment from 'moment';


export default class Bar {
    constructor(gantt, task, showLabel = true) {
        this.set_defaults(gantt, task, showLabel);
        this.prepare();
        this.draw();
        this.bind();
    }

    set_defaults(gantt, task, showLabel) {
        this.action_completed = false;
        this.gantt = gantt;
        this.task = task;
        this.showLabel = showLabel;
    }

    prepare() {
        this.prepare_values();
        this.prepare_helpers();
    }

    prepare_values() {

        this.invalid = this.task.invalid;
        this.height = this.gantt.options.bar_height;
        this.x = this.compute_x();
        this.y = this.compute_y();
        this.corner_radius = this.gantt.options.bar_corner_radius;
        // this.duration =
        //     date_utils.diff(this.task._end, this.task._start, 'hour') /
        //     this.gantt.options.step;
        //console.log("duration", this, this.duration)
        this.width = this.compute_width();
        this.group = createSVG('g', {
            class: 'bar-wrapper ' + (this.task.custom_class || ''),
            'data-id': this.task.id
        });
        this.bar_group = createSVG('g', {
            class: 'bar-group',
            append_to: this.group
        });
        this.handle_group = createSVG('g', {
            class: 'handle-group',
            append_to: this.group
        });
    }

    prepare_helpers() {
        SVGElement.prototype.getX = function () {
            return +this.getAttribute('x');
        };
        SVGElement.prototype.getY = function () {
            return +this.getAttribute('y');
        };
        SVGElement.prototype.getWidth = function () {
            return +this.getAttribute('width');
        };
        SVGElement.prototype.getHeight = function () {
            return +this.getAttribute('height');
        };
        SVGElement.prototype.getEndX = function () {
            return this.getX() + this.getWidth();
        };
    }

    draw() {
        this.draw_bar();
        if (this.showLabel) {
            this.draw_label();
        }
        //this.draw_resize_handles();
    }

    draw_bar() {
        const barMargin = this.gantt.options.bar_margin;

        this.$bar = createSVG('rect', {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            rx: this.corner_radius,
            ry: this.corner_radius,
            class: 'bar',
            append_to: this.bar_group,
            fill: this.task.bg_color ? this.task.bg_color : this.stringToHslColor(this.task.group_name, 50, 70),
        });
        if (this.gantt.options.animations_active) {
            animateSVG(this.$bar, 'width', 0, this.width);
        }

        if (this.invalid) {
            this.$bar.classList.add('bar-invalid');
        }
    }


    draw_label() {
        createSVG('text', {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
            innerHTML: this.task.name,
            class: 'bar-label',
            append_to: this.bar_group
        });
        // labels get BBox in the next tick
        requestAnimationFrame(() => this.update_label_position());
    }

    draw_resize_handles() {
        if (this.invalid) return;

        const bar = this.$bar;
        const handle_width = 8;

        createSVG('rect', {
            x: bar.getX() + bar.getWidth() - 9,
            y: bar.getY() + 1,
            width: handle_width,
            height: this.height - 2,
            rx: this.corner_radius,
            ry: this.corner_radius,
            class: 'handle right',
            append_to: this.handle_group
        });

        createSVG('rect', {
            x: bar.getX() + 1,
            y: bar.getY() + 1,
            width: handle_width,
            height: this.height - 2,
            rx: this.corner_radius,
            ry: this.corner_radius,
            class: 'handle left',
            append_to: this.handle_group
        });


    }

    bind() {
        if (this.invalid) return;
        this.setup_click_event();
    }

    setup_click_event() {
        // if (this.gantt.options.popup_trigger !== 'click') {
        //     $.on(this.group, 'click', e => {
        //         if (this.action_completed) {
        //             // just finished a move action, wait for a few seconds
        //             return;
        //         }
        //         this.gantt.options.custom_click_on_bar(this.task);
        //     });
        // }
        $.on(this.group, 'focus ' + this.gantt.options.popup_trigger, e => {
            if (this.action_completed) {
                // just finished a move action, wait for a few seconds
                return;
            }

            this.show_popup();
            this.gantt.unselect_all();
            this.group.classList.add('active');
        });
        // $.on(this.group, 'mouseout ' + this.gantt.options.popup_trigger, e => {
        //     if (this.action_completed) {
        //         // just finished a move action, wait for a few seconds
        //         return;
        //     }

        //     this.group.classList.add('hide');
        // });
        $.on(this.group, 'click ', e => {

            console.log("click in db lci", this.task)
            const startD = this.task._start.toString();
            const endD = this.task._end.toString();
            this.gantt.options.custom_click_on_bar(startD, endD, this.task.id);

        });
    }

    show_popup() {
        if (this.gantt.bar_being_dragged) return;

        const start_date = moment(this.task._start).format('MMMM DD, h:mm A');
        const end_date = moment(this.task._end).format('MMMM DD, h:mm A');
        const subtitle = start_date + ' - ' + end_date;

        this.gantt.show_popup({
            target_element: this.$bar,
            title: this.task.name,
            subtitle: subtitle,
            task: this.task
        });
    }

    update_bar_position({ x = null, width = null }) {
        const bar = this.$bar;
        if (x) {
            // get all x values of parent task
            const xs = this.task.dependencies.map(dep => {
                return this.gantt.get_bar(dep).$bar.getX();
            });
            // child task must not go before parent
            const valid_x = xs.reduce((prev, curr) => {
                return x >= curr;
            }, x);
            if (!valid_x) {
                width = null;
                return;
            }
            this.update_attr(bar, 'x', x);
        }
        if (width && width > 0) {
            this.update_attr(bar, 'width', width);
        }
        this.update_label_position();
        this.update_handle_position();
        this.update_arrow_position();
    }

    date_changed(e) {
        let changed = false;
        const { new_start_date, new_end_date } = this.compute_start_end_date();

        if (Number(this.task._start) !== Number(new_start_date)) {
            changed = true;
            this.task._start = new_start_date;
        }

        if (Number(this.task._end) !== Number(new_end_date)) {
            changed = true;
            this.task._end = new_end_date;
        }

        if (!changed) return;

        this.gantt.trigger_event('date_change', [
            this.task,
            new_start_date,
            date_utils.add(new_end_date, -1, 'second'),
            e.offsetX - e.layerX - 1
        ]);
    }

    set_action_completed() {
        this.action_completed = true;
        setTimeout(() => (this.action_completed = false), 1000);
    }

    compute_start_end_date() {
        const bar = this.$bar;
        const x_in_units = bar.getX() / this.gantt.options.column_width;
        const new_start_date = date_utils.add(
            this.gantt.gantt_start,
            x_in_units * this.gantt.options.step,
            'hour'
        );
        const width_in_units = bar.getWidth() / this.gantt.options.column_width;
        const new_end_date = date_utils.add(
            new_start_date,
            width_in_units * this.gantt.options.step,
            'hour'
        );

        return { new_start_date, new_end_date };
    }


    compute_x() {
        const { step, column_width } = this.gantt.options;
        const task_start = this.task._start;
        const gantt_start = this.gantt.gantt_start;

        let x = 0;
        if (this.gantt.view_is('Day')) {
            const diff = date_utils.diff(task_start, gantt_start, 'hour');
            x = diff * column_width;

        } else {
            const diff = date_utils.diff(task_start, gantt_start, 'day');
            const extraTime = task_start.getHours();
            x = (diff * column_width) + ((column_width / 24) * extraTime);

        }

        if (x < 0) {
            x = 0;
        }

        return x;
    }

    compute_width() {
        const { step, column_width, dates } = this.gantt.options;
        let task_end = this.task._end;
        let task_start = this.task._start;
        const gantt_start = this.gantt.gantt_start;
        const gantt_end = this.gantt.gantt_end;

        let barWidth = 0;
        const grid_width = this.gantt.dates?.length * column_width;

        if (task_start < gantt_start) {
            task_start = gantt_start;
        }


        if (task_end > gantt_end) {
            task_end = gantt_end;
        }

        if (this.gantt.view_is('Day')) {
            const diff = date_utils.diff(task_end, task_start, 'hour');
            barWidth = (diff * column_width) + column_width;

        } else {
            const diff = date_utils.diff(task_end, task_start, 'hour');
            barWidth = (diff * (column_width / 24));

        }

        // if ((this.x + barWidth) > grid_width) {
        //     barWidth = barWidth - ((this.x + barWidth) - grid_width);
        // }

        return barWidth;
    }

    compute_y() {
        return (
            this.gantt.options.header_height +
            this.gantt.options.padding +
            this.task._index * (this.height + this.gantt.options.padding)
        );
    }

    get_snap_position(dx) {
        let odx = dx,
            rem,
            position;

        if (this.gantt.view_is('Week')) {
            rem = dx % (this.gantt.options.column_width / 7);
            position =
                odx -
                rem +
                (rem < this.gantt.options.column_width / 14
                    ? 0
                    : this.gantt.options.column_width / 7);
        } else if (this.gantt.view_is('Month')) {
            rem = dx % (this.gantt.options.column_width / 30);
            position =
                odx -
                rem +
                (rem < this.gantt.options.column_width / 60
                    ? 0
                    : this.gantt.options.column_width / 30);
        } else {
            rem = dx % this.gantt.options.column_width;
            position =
                odx -
                rem +
                (rem < this.gantt.options.column_width / 2
                    ? 0
                    : this.gantt.options.column_width);
        }

        return position;
    }

    update_attr(element, attr, value) {
        value = +value;
        if (!isNaN(value)) {
            element.setAttribute(attr, value);
        }
        return element;
    }

    update_label_position() {
        if (!this.showLabel) {
            return;
        }
        const bar = this.$bar,
            label = this.group.querySelector('.bar-label');

        if (label.getBBox().width > bar.getWidth()) {
            label.classList.add('big');
            label.setAttribute('x', bar.getX() + bar.getWidth() + 5);
        } else {
            label.classList.remove('big');
            label.setAttribute('x', bar.getX() + bar.getWidth() / 2);
        }
    }

    update_handle_position() {
        const bar = this.$bar;
        this.handle_group
            .querySelector('.handle.left')
            .setAttribute('x', bar.getX() + 1);
        this.handle_group
            .querySelector('.handle.right')
            .setAttribute('x', bar.getEndX() - 9);

    }

    update_arrow_position() {
        this.arrows = this.arrows || [];
        for (let arrow of this.arrows) {
            arrow.update();
        }
    }

    stringToHslColor(str, s, l) {
        var hash = 0;
        str = str + str + str;
        for (var i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }

        var h = hash % 360;
        return 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
    }
}

function isFunction(functionToCheck) {
    var getType = {};
    return (
        functionToCheck &&
        getType.toString.call(functionToCheck) === '[object Function]'
    );
}
