document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("detail_form");
    const sectionInput = form.querySelector("[name='section']");
    const categoryDropdown = document.getElementById("category_dropdown");
    const nameInput = document.getElementById("name_input");
    const amountInput = document.getElementById("amount_input");
    const memoInput = document.getElementById("memo_input");
    const saveButton = document.getElementById("save_button");

    let currentEntry = null; // 현재 수정 중인 항목 데이터

    // 섹션별 기본 카테고리
    const defaultCategories = {
        income: ["없음", "월급", "부수입"],
        investment: ["없음", "저축", "적금", "주식", "펀드"],
        expense: ["없음", "대출", "고정 지출", "생활비", "교통비", "통신비", "경조사비"]
    };

    // 메인 페이지에서 데이터 받기
    window.addEventListener("message", (event) => {
        currentEntry = event.data;

        // 기존 데이터 폼에 채우기
        sectionInput.value = currentEntry.section;
        nameInput.value = currentEntry.name;
        amountInput.value = currentEntry.amount;
        memoInput.value = currentEntry.memo;

        // 섹션에 맞는 카테고리 목록 표시
        updateCategoryDropdown(currentEntry.section, currentEntry.category);
    });

        // 금액 인풋 숫자 이외의 문자 제거 (소수점, 음수 부호 포함)
        amountInput.addEventListener("input", (event) => {
            event.target.value = event.target.value.replace(/[^0-9]/g, '');
        });

        // 금액 인풋 포커스 아웃 시 값이 없으면 0으로 변경
        amountInput.addEventListener("blur", (event) => {
            let rawAmount = event.target.value.replace(/,/g, '');
            if (rawAmount === '' || isNaN(rawAmount)) {
                event.target.value = '0';
            } else {
                event.target.value = parseInt(rawAmount).toLocaleString(); // 천 단위 콤마 추가
            }
        });


    // 저장 버튼 클릭 시 변경된 데이터 부모 창으로 전송
    saveButton.addEventListener("click", () => {
        if (!currentEntry) return;

        // 입력된 값으로 객체 업데이트
        currentEntry.section = sectionInput.value;
        currentEntry.category = categoryDropdown.value;
        currentEntry.name = nameInput.value.trim();
        currentEntry.amount = parseFloat(amountInput.value.replace(/,/g, "")) || 0;
        currentEntry.memo = memoInput.value.trim();

        console.log("수정된 데이터:", currentEntry);

        // 변경된 데이터 부모 창으로 전송
        window.parent.postMessage(currentEntry, "*");

        // 창 닫기
        window.parent.document.getElementById("detail_modal").style.display = "none";
    });

    // 카테고리 업데이트 함수 (섹션별 반영)
    function updateCategoryDropdown(section, selectedCategory) {
        categoryDropdown.innerHTML = "";

        // 기본 카테고리 목록 가져오기
        const categories = defaultCategories[section] || ["없음"];

        // 기본 카테고리 추가
        categories.forEach(category => {
            let option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categoryDropdown.appendChild(option);
        });

        // 기존 데이터에서 선택된 값이 있으면 적용
        if (selectedCategory) {
            categoryDropdown.value = selectedCategory;
        }
    }

    // 섹션 변경 시, 카테고리 목록도 변경
    sectionInput.addEventListener("change", () => {
        updateCategoryDropdown(sectionInput.value, "없음");
    });

    // 카테고리 추가 버튼
    document.getElementById("add_category_button").addEventListener("click", () => {
        document.getElementById("category_modal").style.display = "flex";
    });

    // 카테고리 저장
    document.getElementById("save_new_category_button").addEventListener("click", () => {
        let newCategory = document.getElementById("new_category_input").value.trim();
        if (newCategory === "" || categoryDropdown.querySelector(`option[value="${newCategory}"]`)) return;

        let option = document.createElement("option");
        option.value = newCategory;
        option.textContent = newCategory;
        categoryDropdown.appendChild(option);
        categoryDropdown.value = newCategory;

        console.log("새 카테고리 추가됨:", newCategory);

        // 모달 닫기
        document.getElementById("category_modal").style.display = "none";
        document.getElementById("new_category_input").value = "";
    });

    // 카테고리 삭제 버튼 (기본 카테고리는 삭제 불가)
    document.getElementById("delete_category_button").addEventListener("click", () => {
        let selectedCategory = categoryDropdown.value;
        if (!selectedCategory) return;

        // 기본 카테고리는 삭제 불가
        const section = sectionInput.value;
        if (defaultCategories[section].includes(selectedCategory)) {
            console.log("기본 카테고리는 삭제할 수 없습니다.");
            return;
        }

        let selectedOption = categoryDropdown.querySelector(`option[value="${selectedCategory}"]`);
        if (selectedOption) {
            selectedOption.remove();
            categoryDropdown.value = "없음"; // 기본값으로 변경
        }

        console.log("카테고리 삭제됨:", selectedCategory);
    });

    // 모달 닫기 버튼
    document.querySelector(".close_button").addEventListener("click", () => {
        document.getElementById("category_modal").style.display = "none";
    });
});
