// Plugin here...
;(function($, document, window, undefined){
    $.widget("custom.vscroll", {
        // default options
        options: {
            visible: 7,
            maxVisible: 13,
            min: 0,
            minValue: 0,
            max: 660,
            maxValue: 660,
            step: 5,
            defaultStep: 5,
            minStep: 1,
            maxStep: 10,
            selected: false,
            animate: false,
            delay: 25,
            focused: 'first',   // or 'last'
            testAlt: 343,
            autoOpen: false,
            // callbacks
            cbSelected: false,
            // autoOpen: true,
        },
        widgetName: "vscroll",
        version: "1.0.0",
        _handlers: {},
        // constructor
        _create: function() {
            // if anything DOM remained in the parent, clean up everything and recreate DOM structure
            let self = this;
            let root = self.element[0]; // root element
            $(root).empty();
            // create div.cfl_label and add text CFL to it
            let div0, div1, div2;
            div0 = document.createElement('div');
            div0.classList.add('cfl_label');
            $(div0).text('CFL');
            root.append(div0);
            // create static and vscroll DOM elements
            div0 = document.createElement('div');
            div0.classList.add('cfl_container');
            // div.cfl_static_value container with initial value: 000
            div1 = document.createElement('div');
            div1.classList.add('cfl_static_value');
            $(div1).text("000");
            div0.append(div1);  // added static value container and it's initial value
            // div.cfl_vscontainer
            div1 = document.createElement('div');
            div1.classList.add('cfl_vscontainer');
            div2 = document.createElement('div');
            div2.classList.add('cfl_vstrip');
            for (let v = self.options.max; v >= self.options.min; v -= self.options.step) {
                let _tmp = document.createElement('div');
                _tmp.classList.add('cfl_vsitem');
                if (self.options.selected !== false && v === self.options.selected) {
                    _tmp.classList.add('vs_selected');
                }
                $(_tmp).text(v);
                div2.append(_tmp);
            }
            div1.append(div2);
            div0.append(div1);
            $(div1).hide();
            root.append(div0);
            self._init();
            $(root).on('contextmenu', function(e) {
                self.close();
                // console.log(`context menu detected`);
                return false;
            });
            self._on({
                // click on static value event handler
                "click .cfl_static_value": function(ev) {
                    ev.preventDefault();
                    self.open();
                },
                // click on list item event handler
                "click .cfl_vsitem": function(ev) {
                    // console.log(self.element);
                    self.element.trigger("cfl.changed", self.options.selected);
                    // self._handlers.changeEventHandler = self._changeEventCB(ev, self.options.selected);
                    self._handlers.changeEventHandler = self.options.cbSelected ? self.options.cbSelected : self._changeEventCB(ev, self.options.selected);
                },
            });
            self.element.on("cfl.changed", this._handlers.changeEventHandler);
        },
        //
        _changeEventCB: function(ev, data) { return data; },
        //
        _init: function() {
            let self = this;
            let root = self.element[0]; // root element
            if (self.options.autoOpen) {
                self.open();
            } else {
                self.close();
            }
        },
        _destroy: function() {
            this.remove();
        },
        _roundInt: function(v, n) {
            try {
                console.log({v, n});
                let _v, _n, _low, _high;
                if (typeof v !== "undefined" && typeof n !== "undefined") {
                    if (Number.isFinite(v) && Number.isFinite(n)) {
                        if (Number.isInteger(v) && Number.isInteger(n)) {
                            _v = v, _n = n;
                        } else {
                            _v = v + .5 >> 0;
                            _n = n + .5 >> 0;
                        }
                        // calculate low and high values
                        _low = Math.floor(_v / _n) * _n;
                        _high = Math.ceil(_v / _n) * _n;
                        return Math.abs(_v - _low) < Math.abs(_v - _high) ? _low : _high;
                    } else {
                        throw new Error(`Either one argument is not Number/Integer...`);
                    }
                } else {
                    throw new Error(`Invalid or missing arguments for function: _roundInt( value: {Integer}, rounding: {Integer});`);
                }
            } catch (error) {
                console.error(error);
            }
        },
        _setOptions: function() {
            // console.log(`_setOptions called: `, arguments);
            this._superApply(arguments);
            this._refresh();
        },
        _setOption: function(key, value) {
            // Numeric options
            // console.log(`_setOption called: key = ${key} value = ${value}`);
            let self = this;
            try {
                if (/min|max|visible|step|selected|delay|testAlt|cbSelected/.test(key)) {
                    // Validate and adjust as needed
                    if (/min/.test(key)) {
                        if (Number.isFinite(value)) {
                            let _min = self._roundInt(value, self.options.step);
                            self.options.min = _min >= options.minValue && _min < options.maxValue ? _min : options.minValue;
                        } else {
                            throw new Error(`min value is not Number!`);
                        }
                    }
                    if (/max/.test(key)) {
                        if (Number.isFinite(value)) {
                            let _max = self._roundInt(value, self.options.step);
                            self.options.max = _max > self.options.minValue && _max <= self.options.maxValue ? _max : self.options.maxValue;
                        } else {
                            throw new Error(`max value is not Number!`);
                        }
                    }
                    if (/visible/.test(key)) {
                        if (Number.isFinite(value)) {
                            let _v = value + .5 >> 0;   // to be sure it is Integer
                            if ((_v / 2) % 2) {
                                if ((_v + 1) <= self.options.maxVisible) {
                                    _v += 1;    // make it odd
                                } else {
                                    _v = self.options.maxVisible;
                                }
                            }
                            self.options.visible = _v;
                        } else {
                            throw new Error(`visible value is not Number!`);
                        }
                    }
                    if (/step/.test(key)) {
                        if (Number.isFinite(value)) {
                            let _v = value + .5 >> 0;   // to be sure it is Integer
                            if (_v >= self.options.minStep && _v <= self.options.maxStep) {

                                let _low = Math.floor(_v / self.options.defaultStep) * self.options.defaultStep;
                                let _upp = Math.ceil(_v / self.options.defaultStep) * self.options.defaultStep;
                                _low = _low < 1 ? 1 : _low; // avoid divide by zero fault
                                self.options.step = Math.abs(_v - _low) < Math.abs(_v - _upp) ? _low : _upp;
                            } else {
                                self.options.step = self.options.maxStep;
                            }
                        } else {
                            throw new Error(`step value is not Number!`);
                        }
                    }
                    if (/testAlt/.test(key)) {
                        if (Number.isFinite(value)) {
                            let _v = self._roundInt(value, self.options.step);
                            self.options.testAlt = _v >= self.options.minValue && _v <= self.options.maxValue ? _v : self.options.minValue;
                        } else {
                            throw new Error(`testAlt value is not Number!`);
                        }
                    }
                    if (/selected/.test(key)) {
                        if (Number.isFinite(value)) {
                            let _v = self._roundInt(value, self.options.step);
                            self.options.selected = _v >= self.options.minValue && _v <= self.options.maxValue ? _v : self.options.minValue;
                        } else {
                            throw new Error(`testAlt value is not Number!`);
                        }
                    }
                    if (/cbSelected/.test(key)) {
                        try {
                            if (typeof value === "function") {
                                self.options.cbSelected = value;
                            }
                        } catch (error) {
                            throw new Error(`option argument is ${typeof value} and not "function"`);
                        }
                    }
                }
                // call this._refresh() method
                self._refresh();
            } catch (error) {
                console.error(error);
            }
        },
        _focus: function() {
            try {
                // assume that list is visible
                let self = this, divT;
                $vsContainer = $('.cfl_vscontainer');
                $cfl_vscontainer = $('.cfl_vscontainer');
                $stripList = $vsContainer.find('.cfl_vstrip');
                if (self.options.selected) {
                    // do using .vs_selected item
                    $scrollTo = $stripList.find('.vs_selected');
                    $selected = $('.cfl_vscontainer').find('.vs_selected').index();
                    if ($selected < 0) {
                        let _newValue = self._roundInt(self.options.selected, self.options.step);
                        self.options.selected = _newValue;
                        $elem = $stripList.find(`div:contains(${_newValue})`);
                        let index = $elem.index() + 1;
                        $scrollTo = $stripList.children(`:nth-child(${index})`);
                        $scrollTo.addClass('vs_selected');
                        divT = $stripList.find('.vs_selected');
                    }
                } else {
                    // do set initial focus according to the options
                    if (self.options.focused.match(/first/g)) {
                        // focus on top most
                        $scrollTo = $stripList.children().first();
                        divT = $stripList.children().first();
                    } else if (self.options.focused.match(/last/g)) {
                        $scrollTo = $stripList.children().last()
                        divT = $stripList.children().last();
                    }
                }
                //
                let centerPos = $cfl_vscontainer.height() / 2 - $stripList.children(1).height() / 2;
                var position = $scrollTo.offset().top - $cfl_vscontainer.offset().top + $cfl_vscontainer.scrollTop();
                if (self.options.animate) {
                    $vsContainer.animate({
                        scrollTop: position - centerPos
                    },500);
                } else {
                    $vsContainer.scrollTop(position - centerPos);
                }
                return 0;
            } catch (error) {
                console.log(error);
            }
        },
        _updateSelected: function() {
            let self = this;
            let root = self.element.find('.cfl_vstrip');
            let selVal = parseInt(self.options.selected);
            $(root).children().each((i, e) => {
                if (selVal && selVal === parseInt($(e).text())) {
                    if (!$(e).hasClass('vs_selected')) {
                        $(e).addClass('vs_selected');
                    }
                } else {
                    if ($(e).hasClass('vs_selected')) {
                        $(e).removeClass('vs_selected');
                    }
                }
            });
            self.close();
        },
        _refresh: function() {
            let self = this;
            let root = self.element.find('.cfl_container'); // root element is now div.cfl_container - we update static value and vscrolled list
            $(root).empty();
            let div0, div1, div2;
            div0 = document.createElement('div');
            div0.classList.add('cfl_static_value');
            $(div0).on('click', function(e) {
                self.open();
            });
            if (self.options.selected) {
                $(div0).text(self.options.selected.toString().padStart(3, "0"));    // update static field value first
            }
            root.append(div0);
            div1 = document.createElement('div');
            div1.classList.add('cfl_vscontainer');
            div2 = document.createElement('div');
            div2.classList.add('cfl_vstrip');
            // div.cfl_vscontainer
            div1 = document.createElement('div');
            div1.classList.add('cfl_vscontainer');
            div2 = document.createElement('div');
            div2.classList.add('cfl_vstrip');
            for (let v = self.options.max; v >= self.options.min; v -= self.options.step) {
                let _tmp = document.createElement('div');
                _tmp.classList.add('cfl_vsitem');
                if (self.options.selected !== false && v === self.options.selected) {
                    _tmp.classList.add('vs_selected');
                }
                $(_tmp).text(v);
                $(_tmp).on('click', function(ev) {
                    let _e = this;
                    let _t = $(_e).text();
                    self._trigger("change", ev, {value: _t});
                    self.options.selected = parseInt($(this).text());
                    self._updateSelected();
                });
                div2.append(_tmp);
            }
            div1.append(div2);
            root.append(div1);
            // apply mouse wheel event handler
            // Mouse wheel
            let mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
            // $stripList.bind(mousewheelevt, function(e) {
            $vsContainer = $('.cfl_vscontainer');
            let divT = $('.vs_selected');
            let min = self.options.min;
            let max = self.options.max;
            // $vsContainer.bind(mousewheelevt, function(e) {
            $('.cfl_vscontainer')[0].addEventListener(mousewheelevt, function(e) {
                // e.preventDefault;
                var evt = window.event || e;
                evt = evt.originalEvent ? evt.originalEvent : evt;
                var delta = evt.detail ? evt.detail * (30) : evt.wheelDelta;
                let level = $(divT).text();
                let centerPos = $vsContainer.height() / 2 - $stripList.children(1).height() / 2;
                if(delta<0){
                    if (level > min) {
                        divT = $(divT).next();
                        let scrollTo = $(divT);
                        var position = scrollTo.offset().top - $vsContainer.offset().top + $vsContainer.scrollTop();
                        if (self.options.animate) {
                            $vsContainer.animate({
                                scrollTop: position - centerPos
                            }, options.delay);
                        } else {
                            $vsContainer.scrollTop(position - centerPos);
                        }
                    }
                    // end new way
                } else if(delta>0){
                    if (level < max) {
                        divT = $(divT).prev();
                        let scrollTo = $(divT);
                        var position = scrollTo.offset().top - $vsContainer.offset().top + $vsContainer.scrollTop();
                        if (self.options.animate) {
                            $vsContainer.animate({
                                scrollTop: position - centerPos
                            }, options.delay);
                        } else {
                            $vsContainer.scrollTop(position - centerPos);
                        }
                    }
                }
                return false;
            }, {capture: true, passive: true});
            $(div1).hide();
        },
        open: function(v) {
            let self = this;
            let root = self.element[0]; // root element
            let staticValue = $('.cfl_static_value');
            let listContainer = $('.cfl_vscontainer');
            let _v;
            if (Number.isFinite(v)) {
                _v = v + .5 >> 0;   // to be sure
            } else {
                _v = self.options.selected;
            }
            if (_v >= self.options.min && _v <= self.options.max) {
                self.options.selected = self._roundInt(_v, self.options.step);
                $(staticValue).text(self.options.selected.toString().padStart(3, "0")); // set static value first
            }
            self._refresh();
            // hide static_value
            $('.cfl_static_value').hide();
            $('.cfl_vscontainer').show();
            self._focus();
        },
        close: function() {
            // console.log(`Hide called`);
            let self = this;
            let root = self.element[0]; // root element
            let staticValue = $(root).find('.cfl_static_value');
            let listContainer = $(root).find('.cfl_vscontainer');
            $(staticValue).text(self.options.selected.toString().padStart(3, "0")); // set static value first
            $('.cfl_vscontainer').hide();
            $('.cfl_static_value').show();
        }
    });
})(jQuery, document, window);