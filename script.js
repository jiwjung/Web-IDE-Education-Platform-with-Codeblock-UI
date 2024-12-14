// ** Jupyter-Lite 관련 초기화 ** 
const iframe = document.getElementById('jupyter-iframe');
const checkboxAutoExecution = document.getElementById("checkboxAutoExecution");
const checkboxAutoInsert = document.getElementById("checkboxAutoInsert");

document.addEventListener('DOMContentLoaded', () => {
    let courseInfo = {};
    const urlParams = new URLSearchParams(window.location.search);
    const courseInfoUrl = urlParams.has('course') 
        ? `http://jupyter.jwjung.org/${urlParams.get('course')}/info.json`
        : `/default_course/info.json`;

    fetch(courseInfoUrl)
        .then(response => response.json())
        .then(data => {
            courseInfo = data;
            const sidebar = document.getElementById('sidebar');
            courseInfo.codes.forEach(code => {
                const block = document.createElement('div');
                block.className = 'block';
                block.draggable = true;
                block.textContent = code;
                sidebar.appendChild(block);
            })
            videoLoad(courseInfo['videoUrl']);
        })
        .catch(err => console.error('강좌 정보 불러오기 실패:', err));

    // Jupyter-lite WASM 로딩 후
    setTimeout(() => {
        // .ipynb 파일 열기
        iframe.contentWindow.jupyterapp.commands.execute('filebrowser:open-url', { url: courseInfo['ipynbUrl'] });

        // 코드블럭에 드래그 앤 드롭 설정
        document.querySelectorAll('.block').forEach(block => {
            block.addEventListener('dragstart', event => {
                event.dataTransfer.setData('text/plain', block.textContent);
            });
        });
    }, 1500);
});


// ** 사이드바 토글 기능 **
const sidebar = document.getElementById('sidebar');
const toggleButton = document.getElementById('toggleButton');
const toggleIcon = document.getElementById('toggleIcon');
const contentContainer = document.getElementById('content-container');

toggleButton.addEventListener('click', () => {
    const isCollapsed = sidebar.classList.toggle('collapsed');
    toggleIcon.innerHTML = isCollapsed 
        ? `<path d="M20.5956 3.90332L15.9994 8.49951L20.5956 13.0957L22.0098 11.6815L18.8278 8.49951L22.0098 5.31753L20.5956 3.90332ZM21 19.9995V17.9995H3V19.9995H21ZM12 12.9995V10.9995H3V12.9995H12ZM12 5.99951V3.99951H3V5.99951H12Z"></path>` 
        : `<path d="M4.40347 3.90332L2.98926 5.31753L6.17124 8.49951L2.98926 11.6815L4.40347 13.0957L8.99967 8.49951L4.40347 3.90332ZM20.9997 19.9995V17.9995H2.99967V19.9995H20.9997ZM20.9997 12.9995V10.9995H11.9997V12.9995H20.9997ZM20.9997 5.99951V3.99951H11.9997V5.99951H20.9997Z"></path>`;
    
    contentContainer.style.marginLeft = isCollapsed ? '80px' : '300px';
});



// ** 코드블록 드래그 앤 드롭 기능 **
document.addEventListener('dragend', async event => {
    const code = event.target.textContent;
    if (iframe && code) {
        await iframe.contentWindow.jupyterapp.commands.execute('notebook:replace-selection', { text: code });
        if (checkboxAutoExecution.checked) {
            await iframe.contentWindow.jupyterapp.commands.execute('notebook:run-cell');
        }
        if (checkboxAutoInsert.checked) {
            await iframe.contentWindow.jupyterapp.commands.execute('notebook:insert-cell-below');
        }
    }
});


// ** 로컬 IndexedDB 파일 목록 업데이트 **
async function updateFileList() {
    const dbName = 'JupyterLite Storage';
    const storeName = 'files';
    const fileSelect = document.getElementById('fileSelect');

    try {
        const db = await new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName);
            request.onsuccess = event => resolve(event.target.result);
            request.onerror = event => reject(event.target.error);
        });

        const transaction = db.transaction([storeName]);
        const objectStore = transaction.objectStore(storeName);
        const cursorRequest = objectStore.openCursor();

        fileSelect.innerHTML = ''; // 기존 옵션 제거

        cursorRequest.onsuccess = event => {
            const cursor = event.target.result;
            if (cursor) {
                const option = document.createElement('option');
                option.value = cursor.value.name;
                option.textContent = cursor.value.name;
                fileSelect.appendChild(option);
                cursor.continue();
            }
        };
    } catch (error) {
        console.error('데이터베이스 열기 실패:', error);
    }
}

document.getElementById('fileSelect').addEventListener('focus', updateFileList);


// ** .ipynb 파일 제출 기능 **
async function submitIpynb() {
    await iframe.contentWindow.jupyterapp.commands.execute('docmanager:save');

    const dbName = 'JupyterLite Storage';
    const storeName = 'files';
    const selectedFileName = document.getElementById('fileSelect').value;

    try {
        const db = await new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName);
            request.onsuccess = event => resolve(event.target.result);
            request.onerror = event => reject(event.target.error);
        });

        const transaction = db.transaction([storeName]);
        const objectStore = transaction.objectStore(storeName);
        const fileData = await new Promise((resolve, reject) => {
            const getRequest = objectStore.get(selectedFileName);
            getRequest.onsuccess = event => resolve(event.target.result);
            getRequest.onerror = event => reject(event.target.error);
        });

        if (fileData) {
            console.log(JSON.stringify(fileData, null, 2));  // 디버깅) .ipynb data 콘솔 출력
            await fetch(courseInfo['submitUrl'], {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fileData)
            })
            .then(res => res.ok ? res.json() : Promise.reject(`HTTP error! status: ${res.status}`))
            .then(() => alert('제출이 완료되었습니다.'))
            .catch(err => alert('LMS 서버와 연결할 수 없습니다.', err));
        } else {
            alert('파일을 찾을 수 없습니다.');
        }
    } catch (error) {
        alert('파일 제출 중 오류 발생:', error);
    }
}

document.getElementById("jupyterSubmitButton").addEventListener("click", submitIpynb);


// ** Iframe-Video 화면 크기 조정 기능 **
const divider = document.getElementById('divider');
const iframeContainer = document.querySelector('.iframe-container');
const videoContainer = document.querySelector('.video-container');

let isResizing = false;
let startX = 0;
let startIframeWidth = 0;

const resizeIframeAndVideo = e => {
    if (!isResizing) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const delta = clientX - startX;
    const totalWidth = contentContainer.offsetWidth;
    const newWidth = startIframeWidth + delta;

    const minIframeWidth = 150;
    const minVideoWidth = 150;
    const maxIframeWidth = totalWidth - minVideoWidth;

    if (newWidth >= minIframeWidth && newWidth <= maxIframeWidth) {
        const newRatio = newWidth / totalWidth;
        iframeContainer.style.flexBasis = `${newRatio * 100}%`;
        videoContainer.style.flexBasis = `${(1 - newRatio) * 100}%`;
    }
};

divider.addEventListener('mousedown', e => {
    isResizing = true;
    startX = e.clientX;
    startIframeWidth = iframeContainer.offsetWidth;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
});

divider.addEventListener('touchstart', e => {
    e.preventDefault();
    isResizing = true;
    startX = e.touches[0].clientX;
    startIframeWidth = iframeContainer.offsetWidth;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
});

window.addEventListener('mousemove', resizeIframeAndVideo);
window.addEventListener('touchmove', resizeIframeAndVideo);

window.addEventListener('mouseup', () => {
    if (isResizing) {
        isResizing = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = '';
    }
});

window.addEventListener('touchend', () => {
    if (isResizing) {
        isResizing = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = '';
    }
});


// ** 비디오 URL 로드 기능 **
function videoLoad(videoUrl) {
    const video = document.getElementById('video-player');
    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
        video.addEventListener('loadedmetadata', () => video.play());
    }
}
