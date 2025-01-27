document.addEventListener('DOMContentLoaded', () => {
  const sectionSelect = document.querySelector('select[name="section"]');
  const categoryDropdown = document.getElementById('category_dropdown');
  const addCategoryButton = document.getElementById('add_category_button');
  const deleteCategoryButton = document.getElementById('delete_category_button');
  const categoryModal = document.getElementById('category_modal');
  const newCategoryInput = document.getElementById('new_category_input');
  const saveNewCategoryButton = document.getElementById('save_new_category_button');
  const closeCategoryModalButton = categoryModal.querySelector('.close_button');
  const saveButton = document.getElementById('save_button');
  const amountInput = document.getElementById('amount_input'); // 금액 입력 필드

  // 섹션별 기본 카테고리
  const defaultCategories = {
      income: ['없음', '월급', '부수입'],
      investment: ['없음', '저축', '적금', '주식', '펀드'],
      expense: ['없음', '대출', '고정 지출', '생활비', '교통비', '통신비', '경조사비']
  };

  // 사용자 정의 카테고리 관리
  const userCategories = {
      income: [],
      investment: [],
      expense: []
  };

  // 드롭다운 메뉴 업데이트
  function updateCategoryDropdown(section) {
      categoryDropdown.innerHTML = ''; // 기존 카테고리 삭제

      // 기본 카테고리 추가
      defaultCategories[section].forEach((category) => {
          const option = document.createElement('option');
          option.value = category;
          option.textContent = category;
          categoryDropdown.appendChild(option);
      });

      // 사용자 정의 카테고리 추가
      userCategories[section].forEach((category) => {
          const option = document.createElement('option');
          option.value = category;
          option.textContent = category;
          categoryDropdown.appendChild(option);
      });
  }

  // 섹션 변경 이벤트
  sectionSelect.addEventListener('change', (event) => {
      const selectedSection = event.target.value;
      updateCategoryDropdown(selectedSection);
  });

  // 초기 섹션 설정
  updateCategoryDropdown(sectionSelect.value);

  // 부모 페이지에서 데이터 수신
  window.addEventListener('message', (event) => {
      const { section, category, item, amount, memo } = event.data;

      console.log('상세창에서 수신한 데이터:', event.data);

      // 입력 필드에 데이터 반영
      sectionSelect.value = section || 'income';
      updateCategoryDropdown(section); // 드롭다운 업데이트
      categoryDropdown.value = category || '없음'; 
      document.getElementById('item_input').value = item || '';
      document.getElementById('amount_input').value = amount.replace(/,/g, '') || ''; // 콤마 제거
      document.getElementById('memo_input').value = memo || '';
  });

  // 금액 입력 필드에 천 단위 컴마와 숫자만 입력 허용
  addCommaHandlers(amountInput);

  // 천 단위 컴마 처리 및 숫자만 입력 허용
  function addCommaHandlers(input) {
      input.addEventListener('input', () => {
          // 숫자 이외의 값 제거
          let rawValue = input.value.replace(/[^0-9]/g, ''); // 숫자만 남김
          input.value = rawValue;
      });

      input.addEventListener('blur', () => {
          // 포커스 아웃 시 천 단위 컴마 추가
          const rawValue = input.value.replace(/,/g, '');
          if (!isNaN(rawValue) && rawValue !== '') {
              input.value = parseFloat(rawValue).toLocaleString();
          }
      });

      input.addEventListener('focus', () => {
          // 포커스 시 천 단위 컴마 제거
          input.value = input.value.replace(/,/g, '');
      });
  }

  // 카테고리 추가 모달 열기
  addCategoryButton.addEventListener('click', () => {
      categoryModal.style.display = 'flex';
  });

  // 카테고리 추가 모달 저장
  saveNewCategoryButton.addEventListener('click', () => {
      const newCategory = newCategoryInput.value.trim();
      const currentSection = sectionSelect.value;

      if (!newCategory) {
          alert('카테고리를 입력하세요.');
          return;
      }

      // 중복 확인 (기본 및 사용자 정의 카테고리)
      if (
          defaultCategories[currentSection].includes(newCategory) ||
          userCategories[currentSection].includes(newCategory)
      ) {
          alert('이미 존재하는 카테고리입니다.');
          return;
      }

      // 사용자 정의 카테고리에 추가
      userCategories[currentSection].push(newCategory);
      updateCategoryDropdown(currentSection);
      newCategoryInput.value = '';
      categoryModal.style.display = 'none';
      alert(`"${newCategory}" 카테고리가 추가되었습니다.`);
  });

  // 카테고리 추가 모달 닫기
  closeCategoryModalButton.addEventListener('click', () => {
      categoryModal.style.display = 'none';
  });

  // 카테고리 삭제
  deleteCategoryButton.addEventListener('click', () => {
      const selectedCategory = categoryDropdown.value;
      const currentSection = sectionSelect.value;

      // 기본 카테고리는 삭제 불가
      if (defaultCategories[currentSection].includes(selectedCategory)) {
          alert('기본 카테고리는 삭제할 수 없습니다.');
          return;
      }

      // 사용자 정의 카테고리에서 삭제
      userCategories[currentSection] = userCategories[currentSection].filter(
          (category) => category !== selectedCategory
      );

      updateCategoryDropdown(currentSection);
      alert(`"${selectedCategory}" 카테고리가 삭제되었습니다.`);
  });

    // 부모 페이지로 데이터 전송
    saveButton.addEventListener('click', () => {
        const section = sectionSelect.value.trim();
        const category = categoryDropdown.value.trim();
        const item = document.getElementById('item_input').value.trim();
        const amount = document.getElementById('amount_input').value.trim();
        const memo = document.getElementById('memo_input').value.trim();

        console.log('상세창에서 전송하는 데이터:', { section, category, item, amount, memo });

        window.parent.postMessage({
            section,
            category,
            item,
            amount,
            memo,
        }, '*');
    });
});
