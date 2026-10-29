(() => {
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => setTimeout(() => preloader.classList.add('done'), 450));
  setTimeout(() => preloader.classList.add('done'), 2200);

  // Functional month calendar: region tabs, month navigation and selectable dates.
  const calendarDays = document.getElementById('calendarDays');
  if (calendarDays) {
    const monthLabel = document.getElementById('calendarMonth');
    const selectedTitle = document.getElementById('calendarSelectedTitle');
    const selectedText = document.getElementById('calendarSelectedText');
    const regionName = document.getElementById('regionName');
    const regionDescription = document.getElementById('regionDescription');
    const regions = {
      nagoya: { label: 'NAGOYA / 名古屋', description: '地域の仲間とつながるミートアップ。開催日程を調整中です。' },
      tokyo: { label: 'TOKYO / 東京', description: '多様な分野の人と出会うネットワーキング。開催日程を調整中です。' },
      okayama: { label: 'OKAYAMA / 岡山', description: '地域での挑戦や取り組みを共有する交流会。開催日程を調整中です。' }
    };
    let year = 2026, month = 9, region = 'nagoya', selectedDate = null;
    function renderCalendar() {
      monthLabel.textContent = `${year}年${month + 1}月`;
      calendarDays.replaceChildren();
      const offset = new Date(year, month, 1).getDay();
      const count = new Date(year, month + 1, 0).getDate();
      const prevCount = new Date(year, month, 0).getDate();
      for (let i = 0; i < 42; i++) {
        let y = year, m = month, d = i - offset + 1;
        const inMonth = d >= 1 && d <= count;
        if (d < 1) { d = prevCount + d; m--; if (m < 0) { m = 11; y--; } }
        else if (d > count) { d -= count; m++; if (m > 11) { m = 0; y++; } }
        const key = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'calendar-day'; btn.textContent = d;
        if (!inMonth) btn.classList.add('outside-month');
        if (key === selectedDate) btn.classList.add('selected');
        btn.setAttribute('aria-label', `${y}年${m+1}月${d}日`); btn.setAttribute('aria-pressed', String(key === selectedDate));
        btn.addEventListener('click', () => {
          selectedDate = key; renderCalendar();
          selectedTitle.textContent = `${y}年${m+1}月${d}日`;
          selectedText.textContent = `${regions[region].label.split(' / ')[1]}のイベント：現在、開催予定は登録されていません。`;
        });
        calendarDays.appendChild(btn);
      }
      regionName.textContent = regions[region].label;
      regionDescription.textContent = regions[region].description;
    }
    document.getElementById('calendarPrev')?.addEventListener('click', () => { month--; if(month<0){month=11;year--;} renderCalendar(); });
    document.getElementById('calendarNext')?.addEventListener('click', () => { month++; if(month>11){month=0;year++;} renderCalendar(); });
    document.querySelectorAll('.region-tab').forEach(tab => tab.addEventListener('click', () => {
      region = tab.dataset.region;
      document.querySelectorAll('.region-tab').forEach(t => { const active=t===tab; t.classList.toggle('active',active); t.setAttribute('aria-selected',String(active)); });
      selectedTitle.textContent = '開催日程を調整中'; selectedText.textContent = '日付を選択すると、その日の予定を確認できます。'; renderCalendar();
    }));
    renderCalendar();
  }


  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    mainNav.classList.toggle('open', open);
  });
  mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    mainNav.classList.remove('open');
  }));

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold: 0.12});
    revealItems.forEach(el => observer.observe(el));
  } else revealItems.forEach(el => el.classList.add('visible'));

  const counters = document.querySelectorAll('.counter');
  const countObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target, target = Number(el.dataset.count), start = performance.now(), duration = 1200;
      const tick = now => {
        const p = Math.min((now - start) / duration, 1);
        el.textContent = Math.floor(target * (1 - Math.pow(1 - p, 3))).toLocaleString('ja-JP');
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick); countObserver.unobserve(el);
    });
  }, {threshold: .6});
  counters.forEach(el => countObserver.observe(el));

  const typeButtons = document.querySelectorAll('.member-option');
  const typeRadios = document.querySelectorAll('input[name="memberType"]');
  function selectMember(type) {
    typeButtons.forEach(btn => btn.classList.toggle('selected', btn.dataset.member === type));
    typeRadios.forEach(radio => radio.checked = radio.value === type);
  }
  typeButtons.forEach(btn => btn.addEventListener('click', () => {
    selectMember(btn.dataset.member);
    document.getElementById('joinForm').scrollIntoView({behavior:'smooth', block:'start'});
  }));
  typeRadios.forEach(radio => radio.addEventListener('change', () => selectMember(radio.value)));

  const form = document.getElementById('applicationForm');
  const summary = document.getElementById('formErrorSummary');
  const modal = document.getElementById('confirmModal');
  const preview = document.getElementById('previewDetails');
  const toast = document.getElementById('toast');
  const closeModal = () => { modal.hidden = true; document.body.style.overflow = ''; };
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
  }
  function setError(input, message) {
    const field = input.closest('.field');
    if (field) {
      field.classList.toggle('invalid', Boolean(message));
      const error = field.querySelector('.field-error');
      if (error) error.textContent = message || '';
    }
  }
  function validateField(input) {
    const value = input.value.trim();
    let message = '';
    if (input.required && input.type !== 'checkbox' && !value) message = 'この項目は必須です。';
    else if (input.name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = 'メールアドレスの形式をご確認ください。';
    else if (input.name === 'phone' && value && !/^[0-9+\-()\s]{9,20}$/.test(value)) message = '電話番号を半角数字で入力してください。';
    else if (input.name === 'kana' && value && !/^[ァ-ヶー　\s]+$/.test(value)) message = 'フリガナはカタカナで入力してください。';
    setError(input, message);
    return !message;
  }
  form.querySelectorAll('input:not([type=radio]):not([type=checkbox]),select,textarea').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => { if (input.closest('.field')?.classList.contains('invalid')) validateField(input); });
    input.addEventListener('change', () => { if (input.closest('.field')?.classList.contains('invalid')) validateField(input); });
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    let valid = true;
    form.querySelectorAll('input[required]:not([type=checkbox]),select[required],textarea[required],input[name=fullName],input[name=kana],input[name=email],input[name=phone]').forEach(input => {
      if (!validateField(input)) valid = false;
    });
    const privacy = form.querySelector('input[name=privacy]');
    if (!privacy.checked) valid = false;
    summary.hidden = valid;
    if (!valid) {
      const firstInvalid = form.querySelector('.field.invalid input,.field.invalid select,.field.invalid textarea');
      if (firstInvalid) firstInvalid.focus();
      else privacy.focus();
      return;
    }
    const data = new FormData(form);
    const labels = [
      ['会員区分', data.get('memberType') === 'shipyard' ? 'SHIPYARD MEMBER（SA-SM-XXXX／識別コード例）' : 'CREW MEMBER（SA-CM-XXXX／識別コード例）'],
      ['お名前', data.get('fullName')], ['フリガナ', data.get('kana')], ['メールアドレス', data.get('email')],
      ['電話番号', data.get('phone')], ['都道府県', data.get('prefecture') || '未入力'], ['ご職業', data.get('occupation') || '未入力'],
      ['参加理由・興味', data.get('reason') || '未入力'], ['紹介者コード', data.get('referral') || '未入力']
    ];
    preview.replaceChildren();
    labels.forEach(([label, value]) => {
      const dt = document.createElement('dt'); dt.textContent = label;
      const dd = document.createElement('dd'); dd.textContent = value;
      preview.append(dt, dd);
    });
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    document.getElementById('modalClose').focus();
  });
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('editApplication').addEventListener('click', closeModal);
  document.getElementById('demoSubmit').addEventListener('click', () => {
    closeModal();
    form.reset(); selectMember('crew');
    form.querySelectorAll('.field').forEach(field => { field.classList.remove('invalid'); const error = field.querySelector('.field-error'); if (error) error.textContent = ''; });
    summary.hidden = true;
    showToast('デモ確認が完了しました。データは送信・保存されていません。');
    document.getElementById('joinForm').scrollIntoView({behavior:'smooth', block:'start'});
  });
  modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !modal.hidden) closeModal(); });
})();