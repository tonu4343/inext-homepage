/* I-NEXT — お問い合わせフォーム
   - Nothing is sent from this page: the button opens the visitor's own mail app
     (mailto:) with the inquiry pre-filled, and the visitor presses Send there.
   - Nothing is stored or logged. If no mail app opens, the address and the
     inquiry text can be copied instead. */
(function () {
  'use strict';

  var form = document.getElementById('cform');
  if (!form) return;

  var TO = 'akihiro19761002@gmail.com';
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var submit = form.querySelector('.cform-submit');
  var result = document.getElementById('cform-result');
  var summary = document.getElementById('cform-summary');
  var status = document.getElementById('cform-copy-status');

  function $(id) { return document.getElementById(id); }
  function val(id) { return $(id).value.trim(); }

  var fields = {
    'cf-name': function (v) {
      return v ? '' : 'お名前を入力してください。';
    },
    'cf-email': function (v) {
      if (!v) return 'メールアドレスを入力してください。';
      return EMAIL.test(v) ? '' : 'メールアドレスの形式が正しくありません（例：info@example.com）。';
    },
    'cf-email2': function (v) {
      if (!v) return '確認用のメールアドレスを入力してください。';
      return v === val('cf-email') ? '' : 'メールアドレスが一致しません。';
    },
    'cf-message': function (v) {
      return v ? '' : 'お問い合わせ内容を入力してください。';
    }
  };
  var ids = Object.keys(fields);

  function check(input) {
    var msg = fields[input.id](input.value.trim());
    $(input.id + '-err').textContent = msg;
    input.classList.toggle('is-invalid', !!msg);
    if (msg) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
    return !msg;
  }

  /* button becomes clickable once every required field is valid (no messages shown) */
  function updateButton() {
    submit.disabled = !ids.every(function (id) { return !fields[id](val(id)); });
  }

  ids.forEach(function (id) {
    var input = $(id);
    /* first check when the visitor leaves the field, then live while correcting */
    input.addEventListener('blur', function () {
      input.dataset.touched = '1';
      check(input);
    });
    input.addEventListener('input', function () {
      if (input.dataset.touched) check(input);
      if (id === 'cf-email' && $('cf-email2').dataset.touched) check($('cf-email2'));
      updateButton();
    });
  });

  function compose() {
    var type = $('cf-type');
    var category = type.value ? type.options[type.selectedIndex].text : '';
    var subject = '【ホームページからのお問い合わせ】' + (category || 'お問い合わせ');
    var body = [
      'お問い合わせ種類：' + (category || '（未選択）'),
      'お名前：' + val('cf-name'),
      'メールアドレス：' + val('cf-email'),
      '',
      '【お問い合わせ内容】',
      val('cf-message')
    ].join('\n');
    return { subject: subject, body: body };
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var first = null;
    ids.forEach(function (id) {
      var input = $(id);
      input.dataset.touched = '1';
      if (!check(input) && !first) first = input;
    });
    updateButton();
    if (first) { first.focus(); return; }

    var mail = compose();
    summary.value = '件名：' + mail.subject + '\n\n' + mail.body;
    status.textContent = '';
    result.hidden = false;
    result.focus({ preventScroll: true });
    result.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

    window.location.href = 'mailto:' + TO +
      '?subject=' + encodeURIComponent(mail.subject) +
      '&body=' + encodeURIComponent(mail.body.replace(/\n/g, '\r\n'));
  });

  /* copy fallback for visitors without a configured mail app */
  function copyText(text, done) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(legacyCopy(text)); });
    } else {
      done(legacyCopy(text));
    }
  }
  function legacyCopy(text) {
    var active = document.activeElement;
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    document.body.removeChild(ta);
    if (active && active.focus) active.focus({ preventScroll: true }); // keep keyboard position
    return ok;
  }

  /* キャンセル: close the panel and go back to the form; entered values stay as they are */
  function closeResult() {
    result.hidden = true;
    summary.value = '';
    status.textContent = '';
    $('cf-name').focus({ preventScroll: true });
    form.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  result.addEventListener('click', function (e) {
    if (e.target.closest('.cform-cancel')) { closeResult(); return; }
    var btn = e.target.closest('.cform-copy');
    if (!btn) return;
    var src = $(btn.dataset.copy);
    var text = 'value' in src ? src.value : src.textContent.trim();
    var what = btn.dataset.copy === 'cform-to' ? 'メールアドレス' : 'お問い合わせ内容';
    copyText(text, function (ok) {
      status.textContent = ok
        ? what + 'をコピーしました。'
        : 'コピーできませんでした。お手数ですが、テキストを選択してコピーしてください。';
    });
  });
})();
