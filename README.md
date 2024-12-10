# Web-IDE-Education-Platform-with-Codeblock-UI

## Pyodide : 웹에서의 Python 구동과 교육적 활용 가능성

코드블럭 사용자 인터페이스 기반 Web IDE(jupyter-lite) 교육 플랫폼 개발

- 컴퓨터시스템공학과 2-B 202345047 정지원 / 지도교수 : 이세훈

**URL** : http://jupyter.jwjung.org

---

## 1. 서론

코딩 교육에 대한 관심이 증가하면서, 다양한 학습 도구와 언어가 주목받고 있다. 그중에서도 Python은 직관적이고 간결한 문법 덕분에 초보자들이 프로그래밍을 배우기에 가장 적합한 언어로 평가받는다. 그러나 Python 학습 과정에서 필요한 개발 환경 설정은 초보자들에게 높은 진입 장벽과 심리적 부담으로 작용할 수 있다. 예를 들어, Jupyter 노트북이나 Conda와 같은 환경 관리 도구의 설치와 설정은 복잡하고, 학습자는 프로그래밍의 본질보다 환경 구축에 시간을 소비하게 된다.

이러한 문제를 해결하기 위해, 본 프로젝트는 웹 브라우저에서 Python을 직접 실행할 수 있는 통합 교육 플랫폼을 제안한다. Pyodide 기술을 통해 별도의 설치 없이 Python 환경을 제공하며, Jupyter-lite를 활용하여 학습자에게 친숙한 Jupyter 노트북 환경을 그대로 구현하였다. 또한, 초보자를 위한 코드 블록 드래그 앤 드롭 방식을 통해 쉽고 직관적으로 코드를 작성하고 오류 없이 실행할 수 있는 환경을 마련하였다. 이 플랫폼은 학습자가 환경 설정의 복잡성을 벗어나 Python 프로그래밍의 본질에 더욱 집중할 수 있도록 돕는다.

---

## 2. WASM(WebAssembly)의 개념

WASM은 웹 브라우저에서 고성능 애플리케이션을 실행할 수 있도록 설계된 웹 표준 바이트코드이다. 다양한 언어(C, C++, Rust 등)를 WASM으로 컴파일하여 웹 브라우저에서 실행할 수 있어 플랫폼 독립성과 효율성을 동시에 보장한다. 네이티브 코드 수준의 실행 속도를 제공하며, JavaScript와 상호작용이 가능하여 웹 개발에서의 확장성 또한 뛰어나다.

**WASM의 주요 특징**:

- **고성능 처리**: 네이티브 코드에 가까운 연산 속도.
- **언어 중립성**: 다양한 언어로 작성된 코드를 WASM으로 컴파일 가능.
- **설치 불필요**: .wasm 파일을 불러와 브라우저에서 바로 실행 가능.

본 프로젝트에서는 Pyodide를 통해 Python 코드를 웹 브라우저에서 실행한다. 이 Pyodide가 WASM 기반으로 동작한다.

---

## 3. Pyodide란?

Pyodide는 WASM 위에서 Python 인터프리터를 실행할 수 있도록 CPython 을WebAssembly/Emscripten으로 포팅한 것이다. 사용자는 브라우저에서 별도의 설치 없이 Python 코드를 실행할 수 있다. numpy, pandas, scipy, matplotlib 등 다양한 Python 라이브러리를 지원하며, micropip를 통해 사용자가 원하는 라이브러리를 추가 설치하여 사용할 수 있다.

### Pyodide의 주요 장점

1. **설치 불필요**: 웹 브라우저만으로 Python 실행 가능.
2. **광범위한 라이브러리 지원**: 순수 Python 패키지와 WASM으로 컴파일된 패키지 지원.
3. **JavaScript와의 통합**: Python과 JavaScript 간 데이터 상호작용 지원.
4. **오프라인 지원**: 설치 후 브라우저 캐시에 저장되어 인터넷 없이도 사용 가능.

### Pyodide 기초 : **pyodide.js 사용, 웹에서 python 코드 실행하기**

```html
<!doctype html>
<html>
  <head>
      <script src="https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js"></script>
  </head>
  <body>
    <script type="text/javascript">
      async function test(){
        let pyodide = await loadPyodide();
        console.log(pyodide.runPython("print('Hello Pyodide!')"));
      }
      test();
    </script>
  </body>
</html>
```

### Pyodide 활용 : 간단한 Python Web 에디터 만들기

**URL** : http://pyodide.jwjung.org

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/20994035-b18b-485a-9874-5b773e7198be/bafc8cb6-ace7-43c0-9196-b4a5eec8e34f/image.png)

---

## 4. Jupter-lite

Juper-lite는 웹 브라우저에서 전적으로 실행되는 JupyterLab 배포판이다. 일부 특수 기능을 제외하면, 기존 주피터 랩과 완벽하게 호환된다. 하나의 웹페이지 형태로 실행되며, 빌드 후 웹서버에 올려 사용한다. 본 프로젝트에서는 Jupter-lite에 Pyodide 커널을 탑재하여 Python WEB IDE로 활용했다.

### Jupter-lite 로컬 빌드 과정

```bash
conda create -n jupyter python=3.12  # 아나콘다 가상환경 생성 (권장)
conda activate jupyter  # 가상환경 활성화

pip install jupyterlite-core  # Jupyter-lite
pip install jupyterlite-pyodide-kernel  # Pyodide Kernel
pip install jupyterlab-language-pack-ko-KR  # 한글 언어팩
pip install libarchive-c  # 의존성 설치

jupyter-lite init
```

생성된 _output 폴더의 **jupyter-lite.json**을 열고 **"exposeAppInBrowser": true 추가**

→ Jupyter-lite iframe에 대한 외부 조작을 허용하는 옵션

```json
{ 
	"jupyter-config-data": {
		...
		"exposeAppInBrowser": true
	}
}
```

_output 폴더를 빠져나와서 (**상위 폴더에서**)

```bash
jupyter-lite build
```

- 빌드 완료된 _output 폴더를 웹서버에 올리고, index.html에 접속하면 Jupyter-lite 사용 가능
- 웹서버에 올리지 않고 [localhost](http://localhost) 파일 형태로 접근시 CORS 오류로 인해 정상 사용 불가

### Nginx 설정 파일(예시)

```bash
server {
    listen 80;
    server_name jupyter.jwjung.org;

    # Root path
    root /var/www/jupyter;
    
    # Default index file
    index index.html;

    # Serve static files for JavaScript, CSS, and WebAssembly
    location ~* \.(js|css|wasm|woff|woff2|svg|png|ico|json|map)$ {
        try_files $uri =404;
    }
}
```

### Jupyter-lite 제어 명령어

- Jupter-lite를 Iframe을 통해 외부에서 제어하는 명령어
- **반드시, 메인 페이지와 iframe src 가 같은 경로(출처)여야 정상 동작**
    - 그렇지 않을경우, 브라우저 iframe 보안정책으로 인해 접근 불가

- 관련 자료를 찾을 수 없어 직접 정리한 문서
    
    [https://jiwjung.notion.site/Jupter-lite-Commands-1581082f876880b685d4f8407ce6446b?pvs=4](https://www.notion.so/Jupter-lite-Commands-1581082f876880b685d4f8407ce6446b?pvs=21)
    

**사용 방법**

```jsx
// Jupyter-lite Iframe 직접 접근, 명령어 전송
document.getElementById('jupyter-iframe').contentWindow.jupyterapp.commands.execute('');
```

---

## 4. 웹에서 Python 구동의 교육적 이점

1. **접근성과 편리성**: 별도의 소프트웨어 설치 없이 즉시 학습 가능해 입문자의 진입 장벽을 낮춰.
2. **환경 문제 해결**: 로컬 환경 파편화 문제를 해소하여, 불필요한 오류 가능성 차단.
3. **실시간 과제 수행**: 단일 화면에서 즉각적인 코드 실행과 결과 확인으로 학습 몰입도 높아져.
4. **디바이스 독립성**: 다양한 기기(학교 PC, 노트북, 태블릿 등)에서 동일한 학습 경험 제공.

LMS에서 코딩 과제를 제출하는 상황을 생각해보자. 교육자는 학생들에게 강의 영상과 함께 본 프로젝트에서 개발한 웹 IDE 솔루션을 통해 강의 자료(.ipynb)를 제공한다. 학생들은 화면 우측에서 강의 영상을 시청하면서 실시간으로 코딩 과제를 수행할 수 있다. 좌측의 코드 블록을 드래그 앤 드롭하여 조합하거나 일부 코드를 수정함으로써 목표를 신속하게 달성할 수 있다. 과제 결과물을 제출할 때는 같은 화면에서 ‘제출’ 버튼을 눌러 차시 이수를 완료한다. 강의 시청, 과제 수행, 결과 제출을 모두 단일 웹 화면에서 신속하게 해결할 수 있다.

---

## 5. 코드 블록 기반 Web IDE 교육 플랫폼

### 주요 특징

- **코드블럭** : Python 래퍼런스 코드블럭을 드래그 앤 드롭으로 가져오고, 이를 수정/응용하여 코딩.
- **Jupyter-Lite 통합**: 주피터 노트북 .ipynb 파일 기반 강의자료 제공 및 Python 코드 실행
- **LMS 연동:** 강의 영상 시청, 코드 작성, 과제 제출을 단일화면에서 모두 가능
    - #TODO
        1. 쿼리파라미터 형태로 강의 영상/강의자료.ipynb URL을 전달받아 동적 컨텐츠 제공
        2. 과제 결과물.ipynb JSON 형태로 LMS에 전송
            
            ※ LMS 서버와의 연결 부분을 제외하곤 이미 자체적으로 구현 완료됨.
            

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/20994035-b18b-485a-9874-5b773e7198be/c745801c-4275-43cf-8fd1-094ec5bdd6e8/image.png)

### Left Tab : Code blocks

- 드래그 앤 드롭 코드블럭
- Python 래퍼런스 코드
- 탭 접기 토글 버튼

### Center Tab : Jupyter-Lite

- Pyodide를 통한 웹 브라우저에서의 Python 코드 실행
- 강의 자료 Ipynb 파일 브라우징

### Right Tab : Utility

- 코드블럭 드래그 앤 드롭 동작 설정
- 강의 영상 시청
- 강의 과제물 작성파일 제출
    - Web browser Indexed DB 접근 → .ipynb 파일 선택 → JSON 형태로 LMS에 전송
        
        (현재는 콘솔 출력)
        

### System Structure Diagram

![그림2.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/20994035-b18b-485a-9874-5b773e7198be/1e3da52f-391d-4382-8425-0f8162560783/%EA%B7%B8%EB%A6%BC2.png)

### 사용 기술

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/20994035-b18b-485a-9874-5b773e7198be/50e17737-fb70-4b87-9cfe-d03cc2a3274b/2ac0a1d2-5ffb-4a2a-b834-c3df6c444bc6.png)

[]()

---

## 6. 정리 및 결론

Python 코드는 일반적으로 직관적이고 이해하기 쉬운 언어에 속하지만, 프로그래밍을 처음 배우는 초심자에게는 여전히 어려운 부분이 많다. 특히, 개발 환경을 구축하는 과정은 초보자에게 불필요한 심리적 장벽과 체감 난이도 상승을 만든다. 코드 작성을 위한 영어 타자에 익숙하지 않은 이들에게는 또 다른 도전이 된다.

이를 해결하기 위해, 웹 브라우저에서 Python 코드를 실행할 수 있는 환경을 구축했다. 덕분에 사용자는 별도의 소프트웨어 설치나 복잡한 설정 없이도 코딩을 시작할 수 있다. 좌측 사이드바에는 Python 코드 예제가 포함된 코드 블록이 제공되어, 사용자가 직접 코드를 입력하는 과정을 최소화했다. 이를 통해 오타 가능성을 줄이고, 코딩 소요 시간을 단축시켜 원하는 실행 결과를 빠르게 확인할 수 있다.

앞으로 대부분의 IT 서비스가 웹 브라우저에서 이루어질 것으로 예상된다. 사용자들은 별도의 소프트웨어 설치와 설정의 번거로움 없이 편리하게 서비스를 이용할 수 있다. 본 프로젝트도 교육적 측면의 그 일환이라 볼 수 있다. 본 프로젝트에서 개발한 코드 블록 인터페이스 기반의 웹 IDE 플랫폼이 널리 사용되어, 코딩 학습의 진입 장벽을 낮추고 프로그래밍 입문자와 학습자들에게 더 큰 편리함을 제공할 수 있기를 기대한다.

---

## 7. 느낀점

- Jupter-lite 를 제어하는 방법에 관한 자료나 공식문서가 존재하지 않아 어려움이 있었다.
- Chat GPT와 같은 LLM에서도 학습되어있지 않은 내용을 다루어보는 흥미로운 경험이었다.
- 웹 브라우저 개발자모드를 통해 직접 HTML 요소 하나, JS 객체 하나하나 찾아가며 개발을 진행해야했기에 개발자로서 기초체력을 기를 수 있는 시간이었다.

- 마지막으로, 좋은 기회 주신 이세훈 교수님께 감사드립니다.
