'use strict';
function dQuery(arg) {
    this.elements = [];
    this.domString = '';
    switch (typeof arg) {
        case 'function':
            domReady(arg);
            break;
        case 'string':
            if (arg.indexOf('>') !== -1) {
                this.domString = arg;
            } else {
                this.elements = getEle(arg);
            }
            break
        default:
            if (arg instanceof Array) {
                this.elements = arg;
            } else {
                this.elements.push(arg);
            }
            break;
    }
}

function $(arg) {
    return new dQuery(arg);
}

$.ajax = dQuery.ajax = function (json) {
    ajax(json);
}
$.getScript = dQuery.getScript = function (json) {
    json(json);
}

$.fn = dQuery.prototype;

$.fn.extend = dQuery.prototype.extend = function (json) {
    for (var name in json) {
        dQuery.prototype[name] = json[name];
    }
}

function domReady(fn) {
    if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', fn, false);
    } else {
        document.attachEvent('onreadystatechange', function () {
            if (document.readyState == 'complete' || document.readyState == 'loaded') {
                fn && fn();
            }
        });
    }
}

function addEvent(obj, sEv, fn) {
    if (obj.addEventListener) {
        obj.addEventListener(sEv, function (ev) {
            var oEvent = ev || event;
            if (fn.apply(obj, arguments) == false) {
                oEvent.preventDefault();
                oEvent.cancelBubble = true;
            }
        }, false);
    } else {
        obj.attachEvent('on' + sEv, function () {
            var oEvent = ev || event;
            if (fn.apply(obj, arguments) == false) {
                oEvent.cancelBubble = true;
                return false;
            }
        });
    }
}

function getEle(str, aParent) {
    var arr = str.replace(/^\s+|\s+$/g, '').split(/\s+/);
    var aParent = aParent || [document];
    var aChild = [];
    for (var i = 0; i < arr.length; i++) {
        aChild = getByStr(aParent, arr[i]);
        aParent = aChild;
    }
    return aChild;
}

function getStyle(obj, name) {
    return (obj.currentStyle || getComputedStyle(obj, false))[name];
}

function getByClass(oParent, sClass) {
    if (oParent.getElementByClassName) {
        return oParent.getElementByClassName(sClass);
    } else {
        var arr = [];
        var reg = new RegExp('\\b' + sClass + '\\b');
        var aEle = oParent.getElementsByTagName('*');
        for (var i = 0; i < aEle.length; i++) {
            if (reg.test(aEle[i].className)) {
                arr.push(aEle[i]);
            }
        }
        return arr;
    }
}

function getByStr(aParent, str) {
    var aChild = [];
    for (var i = 0; i < aParent.length; i++) {
        switch (str.charAt(0)) {
            case '#':
                var obj = aParent[i].getElementById(str.substring(1));
                aChild.push(obj);
                break;
            case '.':
                var aEle = getByClass(aParent[i].str.substring(1));
                for (var j = 0; j < aEle; j++) {
                    aChild.push(aEle[j]);
                }
                break;
            default:
                if (/\w+\.\w+/.test(str)) {  //li.red
                    var aStr = str.split('.');
                    var aEle = aParent[i].getElementsByTagName(aStr[0]);
                    var reg = new RegExp('\\b' + aStr[1] + '\\b');
                    for (var j = 0; j < aEle.length; j++) {
                        if (reg.test(aEle[j].className)) {
                            aChild.push(aEle[j]);
                        }
                    }
                } else if (/\w+\[\w+=\w+\]/.test(str)) { //input[type=button]
                    var aStr = str.split(/\[|=|\]/);
                    var aEle = aParent[i].getElementsByTagName(aStr[0]);
                    for (var j = 0; j < aEle.length; j++) {
                        if (aEle[j].getAttribute(aStr[1]) == aStr[2]) {
                            aChild.push(aEle[j]);
                        }
                    }
                } else if (/\w+:\w+(\(\d+\))?/.test(str)) {  //li:first li:eq(2)
                    var aStr = str.split(/:|\(|\)/);
                    var aEle = aParent[i].getElementsByTagName(aStr[0]);
                    switch (aStr[1]) {
                        case 'first':
                            aChild.push(aEle[0]);
                            break;
                        case 'last':
                            aChild.push(aEle[aEle.length - 1]);
                            break;
                        case 'eq':
                            aChild.push(aEle[aStr[2]]);
                            break;
                        case 'lt':
                            for (var j = 0; j < aStr[2]; j++) {
                                aChild.push(aEle[j]);
                            }
                            break;
                        case 'gt':
                            for (var j = parseInt(aStr[2]) + 1; j < aEle.length; j++) {
                                aChild.push(aEle[j]);
                            }
                            break;
                        case 'odd':
                            for (var j = 1; j < aEle.length; j += 2) {
                                aChild.push(aEle[j]);
                            }
                            break;
                        case 'even':
                            for (var j = 0; j < aEle.length; j += 2) {
                                aChild.push(aEle[j]);
                            }
                            break;
                    }
                } else {
                    var aEle = aParent[i].getElementsByTagName(str);
                    for (var j = 0; j < aEle.length; j++) {
                        aChild.push(aEle[j]);
                    }
                }
                break;
        }
    }
    return aChild;
}

function move(obj, json, options) {
    options = options || {};
    options.duration = options.duration || 500;
    options.easing = options.easing || 'ease-out';
    var count = Math.round(options.duration / 30);
    var start = {};
    var dis = {};
    for (var name in json) {
        start[name] = parseFloat(getStyle(obj, name));
        if (isNaN(start[name])) {
            switch (name) {
                case 'left':
                    start[name] = obj.offsetLeft;
                    break;
                case 'top':
                    start[name] = obj.offsetTop;
                    break;
                case 'width':
                    start[name] = obj.offsetWidth;
                    break;
                case 'height':
                    start[name] = obj.offsetHeight;
                    break;
                case 'opacity':
                    start[name] = 1;
                    break;
                case 'marginLeft':
                    start[name] = obj.offsetLeft;
                    break;
                case 'fontSize':
                    start[name] = 12;
                    break;
                //其他样式
            }
        }
        dis[name] = json[name] - start[name];
    }
    var n = 0;
    clearInterval(obj.timer);
    obj.timer = setInterval(function () {
        n++
        for (var name in json) {
            switch (options.easing) {
                case 'linear':
                    var a = n / count;
                    var cur = start[name] + dis[name] * a;
                    break;
                case 'ease-in':
                    var a = n / count;
                    var cur = start[name] + dis[name] * (1 - Math.pow(a, 3));
                    break;
                case 'ease-out':
                    var a = 1 - n / count;
                    var cur = start[name] + dis[name] * (1 - Math.pow(a, 3));
                    break;
            }
            if (name == 'opacity') {
                obj.style.opacity = cur;
                obj.style.filter = 'alpha(opacity:' + cur * 100 + ')';
            } else {
                obj.style[name] = cur + 'px';
            }
            if (n === count) {
                clearInterval(obj.timer);
                options.complete && options.complete.call(obj);
            }
        }
    }, 30);
}

function json2url(json) {
    var arr = [];
    for (var name in json) {
        arr.push(name + '=' + json[name]);
    }
    return arr.join('&');
}

function jsonp() {
    json = json || {};
    json.data = json.data || {};
    json.cbName = json.cbName || 'cb';
    var fnName = 'jsonp_' + Math.random();
    fnName = fnName.replace('.', '');
    window[fnName] = function (data) {
        json.succcess && json.succcess(data);
        oHead.removeChild(oS);
    }
    json.data[json.cbName] = fnName;
    var oS = document.createElement('script');
    oS.src = json.url + '?' + json2url(json.data);
    var oHead = document.getElementsByTagName('head')[0];
    oHead.appendChild(oS);
}

function ajax(json) {
    var timer = null;
    json = json || {};
    if (!json.url) return;
    json.type = json.type || 'get';
    json.timeout = json.timeout || 3000;
    json.data = json.data || {};
    json.dataType = json.dataType || 'json';
    if (window.XMLHttpRequest) {
        var oAjax = new XMLHttpRequest();
    } else {
        var oAjax = new ActiveXObject('Microsoft.XMLHTTP');
    }
    switch (json.type.toLowerCase()) {
        case 'get':
            oAjax.open('GET', json.url + '?' + json2url(json.data), true);
            oAjax.send();
            break;
        case 'post':
            oAjax.open('POST', json.url.true);
            oAjax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            oAjax.send(json2url(json.data));
            break;
    }
    oAjax.onreadystatechange = function () {
        if (oAjax.readyState == 4) {
            clearTimeout(timer);
            if (oAjax.status >= 200 && oAjax.status < 300 || oAjax.status == 304) {
                if (json.dataType.toLowerCase() == 'xml') {
                    json.succcess && json.succcess(oAjax.responseXML);
                } else {
                    json.succcess && json.succcess(oAjax.responseText);
                }
            } else {
                json.error && json.error(oAjax.status);
            }
        }
    }
    timer = setTimeout(function () {
        json.error && json.error('超时了');
        oAjax.onreadystatechange = null;
    }, json.timeout);
}


dQuery.prototype.css = function (name, value) {
    if (arguments.length === 2) {
        for (var i = 0; i < this.elements.length; i++) {
            this.elements[i].style[name] = value;
        }
    } else {
        if (typeof name === 'string') {
            return getStyle(this.elements[0], name);
        } else {
            var json = name;
            for (var i = 0; i < this.elements.length; i++) {
                for (var name in json) {
                    this.elements[i].style[name] = json[name];
                }
            }
        }
    }
}

dQuery.prototype.attr = function (name, value) {
    if (arguments.length === 2) {
        for (var i = 0; i < this.elements.length; i++) {
            this.elements[i].setAttribute(name, value);
        }
    } else {
        if (typeof name === 'string') {
            return this.elements[0].getAttribute(name);
        } else {
            var json = name;
            for (var i = 0; i < this.elements.length; i++) {
                for (var name in json) {
                    this.elements[i].setAttribute(name, json[name]);
                }
            }
        }
    }
}

dQuery.prototype.html = function (str) {
    if (str || str === '') {
        for (var i = 0; i < this.elements.length; i++) {
            this.elements[i].innerHTML = str;
        }
    } else {
        return this.elements[0].innerHTML;
    }
}

dQuery.prototype.val = function (str) {
    if (str || str === '') {
        for (var i = 0; i < this.elements.length; i++) {
            this.elements[i].value = str;
        }
    } else {
        return this.elements[0].value;
    }
}

dQuery.prototype.addClass = function (sClass) {
    if (sClass || sClass === '') {
        var reg = new RegExp('\\b' + sClass + '\\b');
        for (var i = 0; i < this.elements.length; i++) {
            if (this.elements[i].className) {
                if (!reg.test(this.elements[i].className)) {
                    this.elements[i].className += ' ' + sClass;
                }
            } else {
                this.elements[i].className = sClass;
            }
        }
    }
}

dQuery.prototype.removeClass = function (sClass) {
    if (sClass || sClass === '') {
        var reg = new RegExp('\\b' + sClass + '\\b');
        for (var i = 0; i < this.elements.length; i++) {
            this.elements[i].className = this.elements[i].className.replace(reg, '').replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
        }
    }
}

;'click mouseover mouseout mousedown moumove mouseup keydown keyup blur focus load resize scroll contextmenu'.replace(/\w+/g, function (sEv) {
    dQuery.prototype[sEv] = function (fn) {
        for (var i = 0; i < this.elements.length; i++) {
            addEvent(this.elements[i], sEv, fn);
        }
    }
});

dQuery.prototype.mouseover = function (fn) {
    for (var i = 0; i < this.elements.length; i++) {
        addEvent(this.elements[i], 'mouseover', function (ev) {
            var from = ev.fromElement || ev.relatedTarget;
            if (this.contains(from)) return;
            fn && fn.apply(this.arguments);
        });
    }
}
dQuery.prototype.mouseout = function (fn) {
    for (var i = 0; i < this.elements.length; i++) {
        addEvent(this.elements[i], 'mouseout', function (ev) {
            var to = ev.toElement || ev.relatedTarget;
            if (this.contains(to)) return;
            fn && fn.apply(this.arguments);
        });
    }
}
dQuery.prototype.hover = function (fnOver, fnOut) {
    this.mouseover(fnOver);
    this.mouseout(fnOut);
}
dQuery.prototype.toggle = function () {
    var arg = arguments;
    var _this = this;
    for (var i = 0; i < this.elements.length; i++) {
        (function (count) {
            addEvent(_this.elements[i], 'click', function () {
                var fn = arg[count % arg.length];
                fn && fn.apply(this, arguments);
            });
        })(0);
        this.elements[i];
    }
}
dQuery.prototype.appendTo = function (str) {
    var aParent = getEle(str);
    for (var i = 0; i < aParent.length; i++) {
        aParent[i].insertAdjacentHTML('beforeEnd', this.domString);
    }
}
dQuery.prototype.prePendTo = function (str) {
    var aParent = getEle(str);
    for (var i = 0; i < aParent.length; i++) {
        aParent[i].insertAdjacentHTML('afterBegin', this.domString);
    }
}
dQuery.prototype.insertBefore = function (str) {
    var aParent = getEle(str);
    for (var i = 0; i < aParent.length; i++) {
        aParent[i].insertAdjacentHTML('beforeBegin', this.domString);
    }
}
dQuery.prototype.insertAfter = function (str) {
    var aParent = getEle(str);
    for (var i = 0; i < aParent.length; i++) {
        aParent[i].insertAdjacentHTML('afterEnd', this.domString);
    }
}
dQuery.prototype.remove = function () {
    for (var i = 0; i < this.elements.length; i++) {
        this.elements[i].parentNode.removeChild(this.elements[i]);
    }
}
dQuery.prototype.animate = function (json, options) {
    for (var i = 0; i < this.elements.length; i++) {
        move(this.elements[i], json, options);
    }
}

dQuery.prototype.index = function () {
    var obj = this.elements[this.elements.length - 1];
    var aSibling = obj.parentNode.children;
    for (var i = 0; i < aSibling.length; i++) {
        if (obj == aSibling[i]) return i;
    }
}

dQuery.prototype.eq = function (n) {
    return $(this.elements[n]);
}
dQuery.prototype.get = function (n) {
    return this.elements[n];
}

dQuery.prototype.find = function (str) {
    var aEle = getEle(str, this.elements);
    return $(aEle);
}

dQuery.prototype.each = function (fn) {
    for (var i = 0; i < this.elements.length; i++) {
        fn.call(this.elements[i], i, this.elements[i]);
    }
}
