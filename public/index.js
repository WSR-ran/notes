let app = {
    util: {},
    store: {}
};

//工具模块
app.util = {
    $: (selector, node) => {
        return (node || document).querySelector(selector);
    },
    formatTime: (ms) => {
        const date = new Date(ms);
        return `${date.getFullYear()}-${(date.getMonth() +1).toString().padStart(2,'0')}-${(date.getDate()).toString().padStart(2,'0')} ${(date.getHours()).toString().padStart(2,'0')}:${(date.getMinutes()).toString().padStart(2,'0')}:${(date.getSeconds()).toString().padStart(2,'0')}`
    }
}

//存储模块
app.store = {
    store_key: 'note',
    get: function (id) {
        let notes = this.getNotes();
        return notes[id] || {}
    },
    set: function (id, content) {
        let notes = this.getNotes();
        if (notes[id]) {
            Object.assign(notes[id], content);
        } else {
            notes[id] = content;
        }
        localStorage[this.store_key] = JSON.stringify(notes);
    },
    remove: function (id) {
        let notes = this.getNotes();
        delete notes[id];
        localStorage[this.store_key] = JSON.stringify(notes);
    },
    removeAll: function (){
        localStorage.removeItem(this.store_key);
    },
    getNotes: function () {
        return JSON.parse( localStorage[this.store_key] || '{}');
    }
};

(function (util, store) {
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
        note.id = obj.id || 'm-note-' + Date.now();
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
            store.remove(this.note.id);
            closeBtn.removeEventListener('click', closeHandler);
            this.note.removeEventListener('mousedown', mouseDownHandler);
        }.bind(this);  
        closeBtn.addEventListener('click', closeHandler);

        //便签的mousedown事件
        let mouseDownHandler = function (e) {
            movedNote = this;
            startX = e.clientX - this.offsetLeft;
            startY = e.clientY - this.offsetTop;
            if (parseInt(this.style.zIndex) !== maxZIndex-1) {
                this.style.zIndex = maxZIndex++;
                store.set(this.id,{
                    zIndex: parseInt(this.style.zIndex)
                })
            }
        }
        this.note.addEventListener('mousedown', mouseDownHandler);

        // 便签的输入事件
        const editor = $('.editor', this.note);
        let inputTimer;
        let editorHandler = function (e) {
            let content = editor.innerHTML;
            clearTimeout(inputTimer);
            inputTimer = setTimeout(function(){
                let time = Date.now();
                store.set(this.note.id, {
                    content: content,
                    createTime: time
                });
                this.createTime(time);
            }.bind(this),2000)
        }.bind(this);
        editor.addEventListener('input', editorHandler);
    }
    Note.prototype.save = function () {
        store.set(this.note.id, {
            left: this.note.offsetLeft,
            top: this.note.offsetTop,
            zIndex: parseInt(this.note.style.zIndex),
            content: $('.editor', this.note).innerHTML,
            createTime: this.createTimeMs,
            bgColor: this.note.style.backgroundColor
        })
    }


    document.addEventListener('DOMContentLoaded', (e) => {
        //删除
        $('#del').addEventListener('click', (e) => {
            store.removeAll();
            let notes = document.querySelectorAll('.m-note');
            notes.forEach((item) => {
                document.body.removeChild(item)
            })
            maxZIndex = 0;
        })
        //新建便签
        $('#create').addEventListener('click', (e) => {
            new Note({
                left: Math.round(Math.random() * (window.innerWidth - 220)),
                top: Math.round(Math.random() * (window.innerHeight - 320)),
                zIndex: maxZIndex++,
                bgColor: bgColor[parseInt(Math.random()*(bgColor.length - 1))]
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
            store.set(movedNote.id, {
                left: left,
                top: top
            })
        }
        let mouseupHandler = (e) => {
            if (!movedNote) {
                return;
            }
            movedNote = null;
        }
        document.addEventListener('mousemove', mousemoveHandler);
        document.addEventListener('mouseup', mouseupHandler);

        //初始化（从缓存获取）
        let notes = store.getNotes();
        Object.keys(notes).forEach((noteId) => {
            const obj = notes[noteId];
            if (maxZIndex < obj.zIndex) {
                maxZIndex = obj.zIndex;
            }
            new Note(Object.assign(obj, {
                id: noteId
            }));
        });
        maxZIndex += 1;
    })
})(app.util, app.store)