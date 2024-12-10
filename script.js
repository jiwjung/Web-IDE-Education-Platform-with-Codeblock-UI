// 사이드바 접기
const sidebar = document.getElementById('sidebar');
const toggleButton = document.getElementById('toggleButton');
const toggleIcon = document.getElementById('toggleIcon');
const contentContainer = document.getElementById('content-container');

toggleButton.addEventListener('click', () => {
    const isCollapsed = sidebar.classList.toggle('collapsed');
    toggleIcon.innerHTML = isCollapsed 
    ? `<path d="M20.5956 3.90332L15.9994 8.49951L20.5956 13.0957L22.0098 11.6815L18.8278 8.49951L22.0098 5.31753L20.5956 3.90332ZM21 19.9995V17.9995H3V19.9995H21ZM12 12.9995V10.9995H3V12.9995H12ZM12 5.99951V3.99951H3V5.99951H12Z"></path>` 
    : `<path d="M4.40347 3.90332L2.98926 5.31753L6.17124 8.49951L2.98926 11.6815L4.40347 13.0957L8.99967 8.49951L4.40347 3.90332ZM20.9997 19.9995V17.9995H2.99967V19.9995H20.9997ZM20.9997 12.9995V10.9995H11.9997V12.9995H20.9997ZM20.9997 5.99951V3.99951H11.9997V5.99951H20.9997Z"></path>`;
    if (sidebar.classList.contains('collapsed')) {
        contentContainer.style.marginLeft = '80px'; // 사이드바 접혔을 때 마진
    } else {
        contentContainer.style.marginLeft = '300px'; // 사이드바 펼쳤을 때 마진
    }
});


// 코드블럭 드래그 앤 드롭 초기설정
document.querySelectorAll('.block').forEach(block => {
    block.addEventListener('dragstart', event => {
        event.dataTransfer.setData('text/plain', block.textContent);
    });
});

// jupyter-lite Iframe 요소 접근
const iframe = document.getElementById('jupyter-iframe');
let chekboxAutoExecution = document.getElementById("checkboxAutoExecution");
let chekboxAutoInsert = document.getElementById("checkboxAutoInsert");

// 코드블럭 드래그 앤 드롭시 로직처리
document.addEventListener('dragend', async event => {
    const code = event.target.textContent;
    if (iframe && code) {
        // Step 1: Insert code into JupyterLite
        await iframe.contentWindow.jupyterapp.commands.execute('notebook:replace-selection', {
            text: code
        });

        // Step 2: Run the newly created and populated cell
        if(chekboxAutoExecution.checked) {
            await iframe.contentWindow.jupyterapp.commands.execute('notebook:run-cell');
        }
        if(chekboxAutoInsert.checked) {
            await iframe.contentWindow.jupyterapp.commands.execute('notebook:insert-cell-below');
        }
    }
});

/* //HTML 요소 직접 접근 ver. ***문제*** 스크롤을 내려, 화면에서 사라진 셀의 내용이 정상적으로 출력되지 않음(null로 출력됨)
function jupyterToJson() {
    const iframeDocument = iframe.contentDocument;
    let jupyterTabs = iframeDocument.querySelector("#jp-main-dock-panel");
    let activeJupyterTab = jupyterTabs.querySelector('.lm-Widget.jp-MainAreaWidget.jp-NotebookPanel.jp-Document.jp-Activity.lm-DockPanel-widget');
    let jupyterCells = activeJupyterTab.querySelector('.jp-WindowedPanel-viewport');

    if (jupyterCells) {
        let cells = Array.from(jupyterCells.children);

        let cellsData = cells
            .filter(cell => {
                const ariaLabel = cell.getAttribute('aria-label');
                return ariaLabel === 'Code Cell Content' || ariaLabel === 'Code Cell Content with Output'; // 필터링 조건 수정
            })
            .map(cell => {
                // Extract input, output, and data-windowed-list-index attributes
                let inputArea = cell.querySelector('.jp-InputArea-editor .cm-content');
                let outputArea = cell.querySelector('.jp-OutputArea-output');
                let index = cell.getAttribute('data-windowed-list-index');

                return {
                    index: index ? parseInt(index, 10) : null, // Convert index to integer
                    code: inputArea ? inputArea.textContent.trim() : null,
                    result: outputArea ? outputArea.textContent.trim() : null
                };
            });

        // 현재 시간 가져오기
        let submissionTime = new Date().toISOString(); // ISO 8601 형식의 현재 시간

        // 최종 객체 생성
        let finalOutput = {
            submissionTime: submissionTime,
            submitter: "test", // 제출자 이름
            cells: cellsData
        };

        // JSON으로 변환
        let outputJSON = JSON.stringify(finalOutput, null, 2);
        console.log(outputJSON);
        alert("과제 제출이 완료되었습니다.");
    } else {
        console.error('No cells found in the provided container.');
        alert("주피터 노트북 셀을 찾을 수 없습니다.");
    }
}
*/

// 로컬 indexedDB 파일 목록을 드롭다운에 추가
function updateFileList() {
    const dbName = 'JupyterLite Storage';
    const storeName = 'files';

    const fileSelect = document.getElementById('fileSelect');
    

    const request = indexedDB.open(dbName);
    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction([storeName]);
        const objectStore = transaction.objectStore(storeName);
        const cursorRequest = objectStore.openCursor();
        fileSelect.innerHTML = ''; // 기존 옵션 제거

        cursorRequest.onsuccess = function(event) {
            const cursor = event.target.result;
            if (cursor) {
                const option = document.createElement('option');
                option.value = cursor.value.name;
                option.textContent = cursor.value.name;
                fileSelect.appendChild(option);
                cursor.continue();
            }
        };
    };

    request.onerror = function(event) {
        console.error('데이터베이스 열기 실패:', event.target.error);
    };
}

// .ipynb 파일 선택 드롭다운 메뉴 이벤트리스너
document.getElementById('fileSelect').addEventListener('focus', updateFileList);

// 제출 버튼 클릭시
async function submitIpynb() {
    await iframe.contentWindow.jupyterapp.commands.execute('docmanager:save'); // 현재 jupyter 노트북 저장

    const dbName = 'JupyterLite Storage';
    const storeName = 'files';
    const selectedFileName = document.getElementById('fileSelect').value;

    const request = indexedDB.open(dbName);
    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction([storeName]);
        const objectStore = transaction.objectStore(storeName);
        const getRequest = objectStore.get(selectedFileName);

        getRequest.onsuccess = function(event) {
            const fileData = event.target.result;
            if (fileData) {
                console.log(JSON.stringify(fileData, null, 2)); // 파일 내용 출력
                alert('제출이 완료되었습니다.');
            } else {
                alert('파일을 찾을 수 없습니다.');
            }
        };

        getRequest.onerror = function(event) {
            alert('파일 조회 실패:', event.target.error);
        };
    };

    request.onerror = function(event) {
        alert('데이터베이스 열기 실패:', event.target.error);
    };
}

// 과제 제출 버튼 이벤트 리스너
document.getElementById("jupyterSubmitButton").addEventListener("click", submitIpynb);


// iframe--video 화면 크기조정 divider
const divider = document.getElementById('divider');
const iframeContainer = document.querySelector('.iframe-container');
const videoContainer = document.querySelector('.video-container');
//const contentContainer = document.getElementById('content-container'); // 주석 제거

let isResizing = false;
let startX = 0;
let startIframeWidth = 0;

const resizeIframeAndVideo = (e) => {
    if (!isResizing) return;

    // 터치 이벤트와 마우스 이벤트 모두 처리
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const delta = clientX - startX;
    const totalWidth = contentContainer.offsetWidth; // content-container의 너비 가져오기
    const newWidth = startIframeWidth + delta;

    const minIframeWidth = 150;
    const minVideoWidth = 150;
    const maxIframeWidth = totalWidth - minVideoWidth; // 사이드바를 제외한 최대 너비

    if (newWidth >= minIframeWidth && newWidth <= maxIframeWidth) {
        // 새로운 비율 계산
        const newRatio = newWidth / totalWidth;

        // iframe과 video의 비율에 따라 크기 조정
        iframeContainer.style.flexBasis = `${newRatio * 100}%`;
        videoContainer.style.flexBasis = `${(1 - newRatio) * 100}%`;
    }
};

// 마우스 다운 이벤트
divider.addEventListener('mousedown', (e) => {
    isResizing = true;
    startX = e.clientX;
    startIframeWidth = iframeContainer.offsetWidth;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none'; // Prevent text selection during resizing
});

// 터치 시작 이벤트
divider.addEventListener('touchstart', (e) => {
    e.preventDefault(); // 기본 터치 동작 방지
    isResizing = true;
    startX = e.touches[0].clientX;
    startIframeWidth = iframeContainer.offsetWidth;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none'; // Prevent text selection during resizing
});

// 마우스 이동 이벤트
window.addEventListener('mousemove', resizeIframeAndVideo);

// 터치 이동 이벤트
window.addEventListener('touchmove', resizeIframeAndVideo);

// 마우스 업 이벤트
window.addEventListener('mouseup', () => {
    if (isResizing) {
        isResizing = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = ''; // Restore text selection
    }
});

// 터치 업 이벤트
window.addEventListener('touchend', () => {
    if (isResizing) {
        isResizing = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = ''; // Restore text selection
    }
});



// m3u8 url로 부터 영상 재생
const video = document.getElementById('video-player');
const videoSrc = "https://dyckms5inbsqq.cloudfront.net/AP4B/C1/L4/sc-AP4B-C1-L4-master.m3u8";

if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(videoSrc);
    hls.attachMedia(video);

} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = videoSrc;
    video.addEventListener('loadedmetadata', function () {
        video.play();
    });
}