let app = {
    util: {}
};

//工具模块
app.util = {
    $: (selector, node) => {
        return (node || document).querySelector(selector);
    },
    formatTime: (ms) => {
        const date = new Date(ms);
        return `${date.getFullYear()}-${(date.getMonth() +1).toString().padStart(2,'0')}-${(date.getDate()).toString().padStart(2,'0')} ${(date.getHours()).toString().padStart(2,'0')}:${(date.getMinutes()).toString().padStart(2,'0')}:${(date.getSeconds()).toString().padStart(2,'0')}`
    },
    ajax: function (method, url, data, callback) {
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                    callback(xhr.responseText);
                }else {
                    console.error('Request was unsuccessful:' + xhr.status);
                }
            }
        }
        if (method == 'get') {
            xhr.open(method, data ? `${url}?${data}` : url);
            xhr.send();
        } else {
            xhr.open(method, url);
            xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
            if (data) {
                xhr.send(typeof(data) == 'string'? data : this.serialize(data));
            } else {
                xhr.send()
            }
        }
    },
    serialize: function (data) {
        var arr = [];
        for(var i in data) {
            arr.push(encodeURIComponent(i) + "=" + encodeURIComponent(data[i]));
        }
        return arr.join("&");
    }
};

(function (util) {
    const $ = util.$;
    let maxZIndex = 0;
    let movedNote = null;
    let startX;
    let startY;
    let bgColor = ['#f18abe','#ed85dc','#84c9e9','#84e9ac','#e9e184','#e99284'];
    const noteTpl = `<i class="close"></i>
        <div class="editor" contenteditable="true"></div>
        <div class="time-box">
            <span>时间：</span>
            <spam class="time"></spam>
        </div>`;
    function Note (obj) {
        let note = document.createElement('div');
        note.className = 'm-note';
        note.innerHTML = noteTpl;
        note.id = obj.id || 'm-note-' + obj.createTime;
        note.style.top = obj.top + 'px';
        note.style.left = obj.left + 'px';
        note.style.zIndex = obj.zIndex;
        note.style.backgroundColor = obj.bgColor || '#f18abe';
        $('.editor', note).innerHTML = obj.content || '';
        document.body.appendChild(note);
        this.note = note;
        this.createTime(obj.createTime);
        this.addEvent();
    }
    //时间
    Note.prototype.createTime = function (ms) {
        const ts = $('.time', this.note);
        ms = ms || Date.now();
        ts.innerHTML = util.formatTime(ms);
        this.createTimeMs = ms;
    }
    Note.prototype.addEvent = function () {
        //关闭按钮事件
        const closeBtn = $('.close', this.note);
        let closeHandler =  function (e) {
            document.body.removeChild(this.note);
            util.ajax('post', '/deletenote', 'id='+this.note.id, function (res) {
                if (res) {
                    console.log('删除成功');
                }
            })
            closeBtn.removeEventListener('click', closeHandler);
            this.note.removeEventListener('mousedown', mouseDownHandler);
            $('.editor', this.note).removeEventListener('blur', editorHandler);
        }.bind(this);  
        closeBtn.addEventListener('click', closeHandler);

        //便签的mousedown事件
        let mouseDownHandler = function (e) {
            movedNote = this;
            startX = e.clientX - this.offsetLeft;
            startY = e.clientY - this.offsetTop;
            if (parseInt(this.style.zIndex) !== maxZIndex-1) {
                this.style.zIndex = maxZIndex++;
                let notedata = {
                    id: this.id,
                    zIndex: parseInt(this.style.zIndex)
                };
                util.ajax('post', '/changenote', notedata, function (res) {
                    if (res) {
                        console.log('修改成功');
                    }
                })
            }
        }
        this.note.addEventListener('mousedown', mouseDownHandler);

        // 便签的输入事件
        const editor = $('.editor', this.note);
        let beforeContent = "";
        let editorHandler = function (e) {
            let content = editor.innerHTML;
            if (content == beforeContent) return;
            this.createTime(Date.now());
            let notedata = {
                id: this.note.id,
                content: content,
                createTime: Date.now()
            }
            console.log(notedata);
            
            util.ajax('post', '/changenote', notedata, function (res) {
                if (res) {
                    console.log('修改成功');
                } else {
                    console.log('err');
                    
                }
            })
        }.bind(this);
        editor.addEventListener('blur', editorHandler);
        editor.addEventListener('focus', function(e){
            beforeContent = editor.innerHTML;
        });
    }
    Note.prototype.save = function () {
        let notedata = {
            id: 'm-note-' + this.createTimeMs,
            left: this.note.offsetLeft,
            top: this.note.offsetTop,
            zIndex: parseInt(this.note.style.zIndex),
            content: $('.editor', this.note).innerHTML,
            bgColor: this.note.style.backgroundColor,
            createTime: this.createTimeMs
        }
        util.ajax('post', '/addnote', notedata, function (res) {
            if (res) {
                console.log('添加成功');
            }
        })
    }
    document.addEventListener('DOMContentLoaded', (e) => {
        //初始化数据
        util.ajax('get', '/notes', '', function (res) {
            console.log(JSON.parse(res));
            JSON.parse(res).forEach((item) => {
                if (maxZIndex < item.zIndex) {
                    maxZIndex = item.zIndex;
                }
                new Note(item);
            });
            maxZIndex += 1;
        })
        //清空
        $('#del').addEventListener('click', (e) => {
            let notes = document.querySelectorAll('.m-note');
            let arrId= [];            
            notes.forEach((item) => {
                arrId.push(item.id);
                // document.body.removeChild(item)
                item.remove();
                item = null; //该dom对象的引用数变为0，gc会适时回收该dom对象上的所有event listener
            })
            util.ajax('post', '/deleteallnotes', 'id='+JSON.stringify(arrId), function (res) {
                if (res) {
                    console.log('清空');
                }
            })
            maxZIndex = 0;
        })
        //新建便签
        $('#create').addEventListener('click', (e) => {
            new Note({
                left: Math.round(Math.random() * (window.innerWidth - 220)),
                top: Math.round(Math.random() * (window.innerHeight - 320)),
                zIndex: maxZIndex++,
                bgColor: bgColor[parseInt(Math.random()*(bgColor.length - 1))],
                createTime: Date.now()
            }).save();
        })
        //移动监听事件
        let mousemoveHandler = (e) => {
            if (!movedNote) {
                return;
            }
            let left = e.clientX - startX;
            let top = e.clientY - startY;
            left = left < 0 ? left = 0 : left > (window.innerWidth - 220) ? left = (window.innerWidth - 220) : left;
            top = top < 0 ? top = 0 : top > (window.innerHeight - 320) ? top = (window.innerHeight - 320) : top;
            movedNote.style.left = left + 'px';
            movedNote.style.top = top + 'px';
        }
        let mouseupHandler = (e) => {
            if (!movedNote) {
                return;
            }
            let notedata = {
                id: movedNote.id,
                left: parseInt(movedNote.style.left),
                top: parseInt(movedNote.style.top)
            };
            util.ajax('post', '/changenote', notedata, function (res) {
                if (res) {
                    console.log('修改成功');
                }
            })
            movedNote = null;
        }
        document.addEventListener('mousemove', mousemoveHandler);
        document.addEventListener('mouseup', mouseupHandler);
    })
})(app.util)