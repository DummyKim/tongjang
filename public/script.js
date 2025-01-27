document.addEventListener('DOMContentLoaded', () => {
    const addButtons = document.querySelectorAll('.add_button');

    // 초기화: '없음' 카테고리 구분선 생성 및 기본 항목 분류
    const sections = document.querySelectorAll('.section');
    sections.forEach((section) => {
        const table = section.querySelector('tbody');
        createCategoryIfNotExists(table, '없음');
        const rows = Array.from(table.querySelectorAll('tr:not(.category_row)'));

        rows.forEach((row) => {
            const category = row.dataset.category || '없음';
            row.setAttribute('data-category', category);
            const categoryRow = table.querySelector(`tr.category_row[data-category="${category}"]`);
            table.insertBefore(row, categoryRow.nextSibling);
        });
    });

    addButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const section = button.dataset.section;
            const table = document.getElementById(`table_${section}`).querySelector('tbody');
            const rowCount = table.querySelectorAll('tr').length + 1;

            // 새 항목 데이터
            const category = '없음'; // 기본 카테고리
            createCategoryIfNotExists(table, category);

            // 새 항목 추가
            const newRow = document.createElement('tr');
            newRow.setAttribute('data-category', category);
            newRow.innerHTML = `
                <td><input type="text" name="${section}_item_${rowCount}" placeholder="항목" class="item_input"></td>
                <td><input type="text" name="${section}_amount_${rowCount}" placeholder="금액" class="amount_input"></td>
                <td><button class="detail_button">상세</button></td>
                <td><button class="delete_button">x</button></td>
            `;
            const categoryRow = table.querySelector(`tr.category_row[data-category="${category}"]`);
            table.insertBefore(newRow, categoryRow.nextSibling);

            // 새로 추가된 금액 필드에 입력 이벤트 리스너 추가
            const amountInput = newRow.querySelector('.amount_input');
            addCommaHandlers(amountInput, section);
        });
    });

    // 삭제 버튼 이벤트 추가
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete_button')) {
            const row = event.target.closest('tr');
            const section = row.closest('.section').dataset.section;
            const table = document.getElementById(`table_${section}`).querySelector('tbody');
            const category = row.dataset.category;

            row.remove();

            // 카테고리에 남은 항목이 없으면 구분선 삭제
            const remainingItems = table.querySelectorAll(`tr[data-category="${category}"]:not(.category_row)`);
            if (remainingItems.length === 0 && category !== '없음') {
                const categoryRow = table.querySelector(`tr.category_row[data-category="${category}"]`);
                if (categoryRow) categoryRow.remove();
            }

            // 합계 업데이트
            updateTotal(section);
        }
    });

    // 모든 기본 금액 필드에 이벤트 리스너 추가 및 초기 처리
    const amountInputs = document.querySelectorAll('.amount_input');
    amountInputs.forEach((input) => {
        const section = input.closest('.section').dataset.section;

        // 이벤트 리스너 추가
        addCommaHandlers(input, section);
    });

    // 합계 계산 함수
    function updateTotal(section) {
        const table = document.getElementById(`table_${section}`);
        const amountInputs = table.querySelectorAll('.amount_input');
        let total = 0;

        amountInputs.forEach((input) => {
            const rawValue = input.value.replace(/,/g, ''); // 콤마 제거
            const value = parseFloat(rawValue) || 0;
            total += value;
        });

        document.getElementById(`total_${section}`).textContent = total.toLocaleString();
    }

    // 천 단위 콤마 처리 및 숫자만 입력 허용
    function addCommaHandlers(input, section) {
        input.addEventListener('input', () => {
            // 숫자 이외의 값 제거
            let rawValue = input.value.replace(/[^0-9]/g, ''); // 숫자만 남김
            input.value = rawValue;

            // 합계 업데이트
            updateTotal(section);
        });

        input.addEventListener('blur', () => {
            // 포커스 아웃 시 천 단위 콤마 추가
            const rawValue = input.value.replace(/,/g, '');
            if (!isNaN(rawValue) && rawValue !== '') {
                input.value = parseFloat(rawValue).toLocaleString();
            }
        });

        input.addEventListener('focus', () => {
            // 포커스 시 천 단위 콤마 제거
            input.value = input.value.replace(/,/g, '');
        });
    }

    const detailModal = document.getElementById('detail_modal');
    const detailModalFrame = detailModal.querySelector('.modal_frame');
    const detailCloseButton = detailModal.querySelector('.close_button');
    let currentRow = null; // 현재 선택된 행

    // 상세 버튼 클릭 이벤트
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('detail_button')) {
            detailModal.style.display = 'flex';
            console.log('상세 모달 열기');
            currentRow = event.target.closest('tr'); // 현재 선택된 행 저장

            // 현재 행의 데이터를 상세창으로 전송
            const section = currentRow.closest('.section').dataset.section;
            const category = currentRow.dataset.category || '';
            const memo = currentRow.dataset.memo || '';
            const item = currentRow.querySelector('.item_input').value || '';
            const amount = currentRow.querySelector('.amount_input').value || '';

            console.log('부모 페이지에서 상세창으로 전송하는 데이터:', {
                section,
                category,
                item,
                amount,
                memo
            });

            // 상세창으로 데이터 전송
            detailModalFrame.contentWindow.postMessage({
                section,
                category,
                item,
                amount,
                memo
            }, '*');
        }
    });

    // 상세 모달 닫기 버튼
    detailCloseButton.addEventListener('click', () => {
        detailModal.style.display = 'none';
        console.log('상세 모달 닫기');
    });

    // 상세 모달에서 데이터 수신
    window.addEventListener('message', (event) => {
        const { section, category, item, amount, memo } = event.data;

        console.log('부모 페이지에서 수신한 데이터:', event.data);

        if (currentRow) {
            const table = document.getElementById(`table_${section}`).querySelector('tbody');
            const oldCategory = currentRow.dataset.category;

            // 현재 행 업데이트
            currentRow.dataset.category = category || '';
            currentRow.dataset.memo = memo || '';
            currentRow.querySelector('.item_input').value = item || '';
            currentRow.querySelector('.amount_input').value = amount || '';

            // 카테고리 변경 시 항목 재배치
            if (oldCategory !== category) {
                createCategoryIfNotExists(table, category);
                const newCategoryRow = table.querySelector(`tr.category_row[data-category="${category}"]`);
                table.insertBefore(currentRow, newCategoryRow.nextSibling);

                // 이전 카테고리 정리
                const remainingItems = table.querySelectorAll(`tr[data-category="${oldCategory}"]:not(.category_row)`);
                if (remainingItems.length === 0 && oldCategory !== '없음') {
                    const oldCategoryRow = table.querySelector(`tr.category_row[data-category="${oldCategory}"]`);
                    if (oldCategoryRow) oldCategoryRow.remove();
                }
            }
        }

        detailModal.style.display = 'none';
    });

    // 카테고리 생성 함수
    function createCategoryIfNotExists(table, category) {
        let categoryRow = table.querySelector(`tr.category_row[data-category="${category}"]`);
        if (!categoryRow) {
            categoryRow = document.createElement('tr');
            categoryRow.classList.add('category_row');
            categoryRow.setAttribute('data-category', category);
            categoryRow.innerHTML = `<td colspan="4" class="category_label">${category !== '없음' ? category : ''}</td>`;
            table.appendChild(categoryRow);
        }
    }

    const infoButton = document.getElementById('info_button');
    const infoModal = document.getElementById('info_modal');
    const infoCloseButton = infoModal.querySelector('.close_button');

    // 인포 모달 열기
    infoButton.addEventListener('click', () => {
        infoModal.style.display = 'flex';
        console.log('인포 모달 열기');
    });

    // 인포 모달 닫기 버튼
    infoCloseButton.addEventListener('click', () => {
        infoModal.style.display = 'none';
        console.log('인포 모달 닫기');
    });

    const registerButton = document.getElementById('register_button');
    const registerModal = document.getElementById('register_modal');
    const registerCloseButton = registerModal.querySelector('.close_button');

    // 가입 모달 열기
    registerButton.addEventListener('click', () => {
        registerModal.style.display = 'flex';
        console.log('가입 모달 열기');
    });

    // 가입 모달 닫기
    registerCloseButton.addEventListener('click', () => {
        registerModal.style.display = 'none';
        console.log('가입 모달 닫기');
    });

    //모달 외부 클릭 시 모달 닫기
    window.addEventListener('click', (event) => {
        const modals = [detailModal, infoModal, registerModal];
        
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
                console.log(`${modal.id} 모달 닫기`);
            }
        });
    });
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
document.querySelector('.login_form').addEventListener('submit', async (event) => {
    event.preventDefault(); // 폼 기본 동작 중지

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
            showLoggedInUI(result.username); // 로그인 후 UI 전환
        } else {
            alert(result.message || '로그인 실패');
            showLoggedOutUI(); // 실패 시 로그인 전 UI 복구
        }
    } catch (error) {
        alert('서버와 연결할 수 없습니다.');
        console.error('로그인 오류:', error);
        showLoggedOutUI(); // 에러 발생 시 UI 복구
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
    document.getElementById('login_before').style.display = 'none'; // 로그인 전 UI 숨김
    document.getElementById('login_after').style.display = 'block'; // 로그인 후 UI 표시
    document.getElementById('user_name').textContent = `사용자명: `<br>`${username}`; // 사용자명 표시
}

// 로그인 전 UI 복구
function showLoggedOutUI() {
    document.getElementById('login_before').style.display = 'block'; // 로그인 전 UI 표시
    document.getElementById('login_after').style.display = 'none'; // 로그인 후 UI 숨김
}

// 로그아웃 처리
document.getElementById('logout_button').addEventListener('click', () => {
    localStorage.removeItem('token'); // JWT 삭제
    alert('로그아웃되었습니다.');
    showLoggedOutUI(); // 로그인 전 UI로 전환
});