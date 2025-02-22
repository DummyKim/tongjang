// 객체 배열 및 ID 카운터 초기화
let data = [];
let entryIdCounter = 1; // 자동 증가 ID

// Entry 객체 정의
function Entry(entryId, section, category, name, amount, memo) {
    this.entryId = entryId;
    this.section = section;
    this.category = category;
    this.name = name;
    this.amount = amount;
    this.memo = memo;
}

// 새 항목 추가 기능
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".add_button").forEach(button => {
        button.addEventListener("click", () => {
            const section = button.dataset.section;
            const newEntry = new Entry(entryIdCounter++, section, "없음", "새 항목", 0, "");

            data.push(newEntry);
            console.log(`새로운 항목 추가됨:`, newEntry);
            renderTable(); // UI 업데이트
        });
    });
});

// 테이블을 렌더링하는 함수 (카테고리별 정렬 + 합계 계산)
function renderTable() {
    document.querySelectorAll('.section tbody').forEach(tbody => tbody.innerHTML = ""); // 기존 테이블 초기화

    // 섹션별 데이터 그룹화
    const sectionGroups = {
        income: {},
        investment: {},
        expense: {}
    };

    data.forEach(entry => {
        if (!sectionGroups[entry.section][entry.category]) {
            sectionGroups[entry.section][entry.category] = [];
        }
        sectionGroups[entry.section][entry.category].push(entry);
    });

    // 각 섹션별 정렬하여 렌더링
    Object.keys(sectionGroups).forEach(section => {
        const tableBody = document.querySelector(`#table_${section} tbody`);
        if (!tableBody) return;

        // "없음" 카테고리는 맨 위에 추가
        if (sectionGroups[section]["없음"]) {
            sectionGroups[section]["없음"].forEach(entry => appendEntryRow(tableBody, entry));
        }

        // 그 외 카테고리는 그룹별로 구분선 추가
        Object.keys(sectionGroups[section]).forEach(category => {
            if (category === "없음") return;

            // 카테고리 구분선 추가
            let categoryRow = document.createElement("tr");
            categoryRow.classList.add("category_row");
            categoryRow.setAttribute("data-category", category);
            categoryRow.innerHTML = `<td colspan="4" class="category_label">${category}</td>`;
            tableBody.appendChild(categoryRow);

            // 해당 카테고리의 항목 추가
            sectionGroups[section][category].forEach(entry => appendEntryRow(tableBody, entry));
        });
    });

    updateTotals(); // 합계 업데이트
    attachEventListeners(); // 수정/삭제 버튼 이벤트 연결
}

// 개별 엔트리 행 추가 함수
function appendEntryRow(tableBody, entry) {
    let row = document.createElement("tr");
    row.setAttribute("data-id", entry.entryId);
    row.setAttribute("data-category", entry.category);
    row.innerHTML = `
        <td style="width: 40%;"><input type="text" class="name_input" data-id="${entry.entryId}" value="${entry.name}"></td>
        <td style="width: 40%;"><input type="text" class="amount_input" data-id="${entry.entryId}" value="${entry.amount.toLocaleString()}"></td>
        <td style="width: 15%;"><button class="detail_button" data-id="${entry.entryId}">상세</button></td>
        <td style="width: 5%;"><button class="delete_button" data-id="${entry.entryId}">x</button></td>
    `;
    tableBody.appendChild(row);
}

// 합계 금액 계산 함수
function updateTotals() {
    const sectionSums = {
        income: 0,
        investment: 0,
        expense: 0
    };

    // 각 섹션별 합계 계산
    data.forEach(entry => {
        sectionSums[entry.section] += entry.amount;
    });

    // 합계를 UI에 반영
    document.getElementById("total_income").textContent = sectionSums.income.toLocaleString();
    document.getElementById("total_investment").textContent = sectionSums.investment.toLocaleString();
    document.getElementById("total_expense").textContent = sectionSums.expense.toLocaleString();
}

// 수정 및 삭제 이벤트 리스너
function attachEventListeners() {
    document.querySelectorAll(".name_input, .amount_input").forEach(input => {
        input.addEventListener("input", (event) => {
            if (event.target.classList.contains("amount_input")) {
                // 숫자 이외의 문자 제거 (소수점, 음수 부호 포함)
                event.target.value = event.target.value.replace(/[^0-9]/g, '');
            }
        });

        input.addEventListener("change", (event) => {
            const entryId = parseInt(event.target.dataset.id);
            const entry = data.find(e => e.entryId === entryId);
            if (!entry) return;

            if (event.target.classList.contains("name_input")) {
                entry.name = event.target.value.trim();
            } else if (event.target.classList.contains("amount_input")) {
                let rawAmount = event.target.value.replace(/,/g, '');
                entry.amount = rawAmount === '' || isNaN(rawAmount) ? 0 : parseInt(rawAmount);
                event.target.value = entry.amount.toLocaleString(); // 천 단위 콤마 추가
            }

            updateTotals(); // 합계 업데이트
        });

        input.addEventListener("blur", (event) => {
            if (event.target.classList.contains("amount_input")) {
                const value = event.target.value.replace(/,/g, '');
                if (value === '' || isNaN(value)) {
                    event.target.value = '0';
                    const entryId = parseInt(event.target.dataset.id);
                    const entry = data.find(e => e.entryId === entryId);
                    if (entry) entry.amount = 0;
                    updateTotals(); // 합계 업데이트
                }
            }
        });
    });

    // 삭제 버튼 이벤트 추가
    document.querySelectorAll('.delete_button').forEach(button => {
        button.addEventListener("click", event => {
            const entryId = parseInt(event.target.dataset.id);
            data = data.filter(entry => entry.entryId !== entryId);
            renderTable(); // UI 갱신
            console.log("삭제할 entryId:", entryId);
            console.log("삭제 후 남은 데이터:", data);
        });
    });

    // 상세 버튼 이벤트 추가 (모달 열기)
    document.querySelectorAll(".detail_button").forEach(button => {
        button.addEventListener("click", (event) => {
            const entryId = parseInt(event.target.dataset.id);
            const entry = data.find(e => e.entryId === entryId);
            if (!entry) return;

            const detailModal = document.getElementById("detail_modal");
            const detailFrame = detailModal.querySelector(".modal_frame");

            detailModal.style.display = "flex";
            detailFrame.contentWindow.postMessage(entry, "*");
        });
    });
}

// 상세 모달에서 데이터 수정 반영
window.addEventListener("message", (event) => {
    const { entryId, section, category, name, amount, memo } = event.data;
    const entry = data.find(e => e.entryId === entryId);
    if (!entry) return;

    entry.section = section;
    entry.category = category;
    entry.name = name;
    entry.amount = amount;
    entry.memo = memo;

    console.log(`모달에서 수정됨:`, entry);
    renderTable(); // UI 업데이트
});


//처리중 모달

function showLoading() {
    document.getElementById("loading_modal").style.display = "flex"; // 로딩 모달 표시
}

function hideLoading() {
    document.getElementById("loading_modal").style.display = "none"; // 로딩 모달 숨김
}


// 모달 닫기 버튼
document.querySelectorAll(".close_button").forEach(button => {
    button.addEventListener("click", () => {
        document.getElementById("detail_modal").style.display = "none";
    });
});

// 모달 닫기 기능
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = "none"; // 모달 숨기기
}

document.addEventListener("DOMContentLoaded", () => {
    // 모달 열기 기능
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = "flex"; // 모달 표시
    }

    // 모달 닫기 기능
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = "none"; // 모달 숨기기
    }

    // 버튼 클릭 시 모달 열기
    document.getElementById("info_button").addEventListener("click", () => openModal("info_modal"));
    document.getElementById("login_before").addEventListener("click", () => openModal("login_modal"));
    document.getElementById("register_button").addEventListener("click", () => openModal("register_modal"));
    document.getElementById("saveload").addEventListener("click", () => openModal("saveload_modal"));

    // 닫기 버튼 클릭 시 모달 닫기
    document.querySelectorAll(".close_button").forEach(button => {
        button.addEventListener("click", () => {
            const modal = button.closest(".modal");
            if (modal) modal.style.display = "none";
        });
    });

    // 모달 바깥 영역 클릭 시 닫기
    window.addEventListener("click", (event) => {
        document.querySelectorAll(".modal").forEach(modal => {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });
    });
});

//로그인 기능//

//회원가입
document.getElementById('reg-btn').addEventListener('click', async () => {
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();
    const errorElement = document.getElementById('reg-error');

    errorElement.style.display = 'none';

    showLoading();

    if (!username || !email || !password || !confirmPassword) {
        errorElement.textContent = '모든 필드를 입력하세요.';
        errorElement.style.display = 'block';
        hideLoading();
        return;
    }

    if (password !== confirmPassword) {
        errorElement.textContent = '비밀번호가 일치하지 않습니다.';
        errorElement.style.display = 'block';
        hideLoading();
        return;
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        });

        const result = await response.json();

        if (response.ok) {
            alert('회원가입이 완료되었습니다! 이제 로그인하세요.');
            window.parent.postMessage({ action: 'closeRegisterModal' }, '*');
        } else {
            errorElement.textContent = result.message || '회원가입에 실패했습니다.';
            errorElement.style.display = 'block';
        }
    } catch (error) {
        errorElement.textContent = '서버와 연결할 수 없습니다.';
        errorElement.style.display = 'block';
    } finally {
        hideLoading();
    }
});


//회원가입 완료 후 모달창 닫기
window.addEventListener('message', (event) => {
    console.log('수신된 메시지:', event.data); // 디버깅용 로그 추가

    if (event.data.action === 'closeRegisterModal') {
        const registerModal = document.getElementById('register_modal');
        if (registerModal) {
            registerModal.style.display = 'none'; // 모달 닫기
        }
    }
});

//로그인
document.getElementById('login_form').addEventListener('submit', async (event) => {
    event.preventDefault(); // 폼 기본 동작 중지
    showLoading();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (response.ok) {
            alert('로그인 성공!');
            localStorage.setItem('token', result.token); // 토큰 저장
            closeModal("login_modal"); // 로그인 후 모달 닫기
            showLoggedInUI(result.username); // 로그인 후 UI 전환
        } else {
            alert(result.message || '로그인 실패');
            showLoggedOutUI(); // 실패 시 로그인 전 UI 복구
        }
    } catch (error) {
        alert('서버와 연결할 수 없습니다.');
        console.error('로그인 오류:', error);
        showLoggedOutUI(); // 에러 발생 시 UI 복구
    } finally {
        hideLoading(); // 처리 완료 후 모달 숨김
    }
});


//로그인 JWT 검증 // 인증된 API 요청 예제
async function fetchProtectedData() {
    const token = localStorage.getItem('token'); // 로그인 시 저장된 토큰

    try {
        const response = await fetch('/api/protected', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // Authorization 헤더에 토큰 추가
            },
        });

        const result = await response.json();
        if (response.ok) {
            console.log('보호된 데이터:', result);
            alert(`인증된 사용자: ${result.user.email}`);
        } else {
            alert(result.message || '인증 실패');
        }
    } catch (error) {
        alert('서버와 연결할 수 없습니다.');
        console.error('인증 요청 오류:', error);
    }
}

// 로그인 후 UI 전환
function showLoggedInUI(username) {
    console.log('showLoggedInUI 함수 호출됨', {username});
    document.getElementById('login_before').style.display = 'none'; // 로그인 전 UI 숨김
    document.getElementById('login_after').style.display = 'block'; // 로그인 후 UI 표시
    document.getElementById('user_name').innerHTML = `사용자명: ${username}`; // 사용자명 표시
}

// 로그인 전 UI 복구
function showLoggedOutUI() {
    console.log('showLoggedOutUI 함수 호출됨');
    console.trace('showLoggedOutUI 호출 스택:'); // 호출 스택 추적
    document.getElementById('login_before').style.display = 'block'; // 로그인 전 UI 표시
    document.getElementById('login_after').style.display = 'none'; // 로그인 후 UI 숨김
}

// 로그아웃 기능
document.getElementById('login_after').addEventListener('click', () => {
    event.preventDefault();

    console.log('로그아웃 버튼 클릭됨');
    
    const isConfirmed = confirm("로그아웃 하시겠습니까?");
    
    if (isConfirmed) {
        localStorage.removeItem('token');
        alert('로그아웃되었습니다.');
        showLoggedOutUI();
        console.log('로그아웃 처리 완료');
    } else {
        console.log('로그아웃 취소됨');
    }
});

// 로그인 여부 확인 함수
function isLoggedIn() {
    const token = localStorage.getItem('token');
    return !!token;
}

// 데이터 저장 (POST 요청)
document.getElementById("save_button").addEventListener("click", async () => {
    console.log({ data });
    showLoading();

    if (!isLoggedIn()) {
        alert("로그인 후 이용 가능합니다.");
        hideLoading();
        return;
    }

    if (data.length === 0) {
        alert("저장할 항목이 없습니다. 먼저 항목을 추가하세요.");
        return;
    }

    let validationError = false;

    data.forEach(entry => {
        if (!entry.name.trim()) {
            validationError = true;
        }
    });

    if (validationError) {
        alert("항목 이름을 모두 입력하세요!");
        return;
    }

    try {
        const response = await fetch('/api/saveData', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({ data })
        });

        if (response.ok) {
            alert("데이터가 저장되었습니다.");
        } else {
            const result = await response.json();
            alert(result.message || "저장에 실패했습니다.");
        }
    } catch (error) {
        console.error("저장 오류:", error);
        alert("서버와 연결할 수 없습니다.");
    } finally {
        hideLoading(); // 처리 완료 후 모달 숨김
    }
});

// 데이터 불러오기 (GET 요청)
document.getElementById("load_button").addEventListener("click", async () => {
    showLoading();

    if (!isLoggedIn()) {
        alert("로그인 후 이용 가능합니다.");
        hideLoading();
        return;
    }

    try {
        const response = await fetch('/api/loadData', {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (response.ok) {
            const result = await response.json();

            if (Array.isArray(result.data)) {
                data = result.data;  // 기존 데이터 덮어쓰기

                // 가장 큰 entryId 찾기
                const maxEntryId = data.length > 0 ? Math.max(...data.map(entry => entry.entryId)) : 0;
                entryIdCounter = maxEntryId + 1; // 새로운 항목 추가 시 중복되지 않도록 설정

                renderTable();   // 테이블 갱신
                alert("데이터가 불러와졌습니다.");
                closeModal("saveload_modal"); // 로그인 후 모달 닫기
                console.log("불러온 데이터의 최대 entryId:", maxEntryId);
                console.log("entryIdCounter 업데이트:", entryIdCounter);
            } else {
                alert("서버에서 잘못된 응답을 받았습니다.");
            }
        } else {
            const result = await response.json();
            alert(result.message || "불러오기에 실패했습니다.");
        }
    } catch (error) {
        console.error("불러오기 오류:", error);
        alert("서버와 연결할 수 없습니다.");
    } finally {
        hideLoading();
    }
});