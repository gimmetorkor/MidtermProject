const form = document.getElementById('form');
const username = document.getElementById('username');
const password = document.getElementById('pass');
const checkpassword = document.getElementById('re-pass');
const name = document.getElementById('name');
const email = document.getElementById('email');
const tel = document.getElementById('tel');
const day = document.getElementById('day');
const month = document.getElementById('month');
const year = document.getElementById('year');
const gender = document.getElementById('gender');

form.addEventListener('submit', function(e) {
  e.preventDefault();

  let isFormValid = true; // ใช้ตัวแปรนี้เพื่อเก็บสถานะฟอร์ม

  // ตรวจสอบ username
  if(username.value === '') {
    showError(username, 'กรุณากรอก username');
    isFormValid = false;
  } else {
    showSuccess(username);
  }

  // ตรวจสอบชื่อ
  if(name.value === '') {
    showError(name, 'กรุณากรอก username');
    isFormValid = false;
  } else {
    showSuccess(name);
  }

  // ตรวจสอบ email
  if(email.value === '') {
    showError(email, 'กรุณากรอกอีเมล');
    isFormValid = false;
  } else if (!isValidEmail(email.value)) {
    showError(email, 'อีเมลไม่ถูกต้อง');
    isFormValid = false;
  } else {
    showSuccess(email);
  }

  // ตรวจสอบรหัสผ่าน
  if(password.value === '') {
    showError(password, 'กรุณากรอกรหัสผ่าน');
    isFormValid = false;
  } else {
    showSuccess(password);
  }

  // ตรวจสอบการยืนยันรหัสผ่าน
  if(checkpassword.value === '') {
    showError(checkpassword, 'กรุณายืนยันรหัสผ่าน');
    isFormValid = false;
  } else if(checkpassword.value !== password.value) {
    showError(checkpassword, 'รหัสผ่านไม่ตรงกัน');
    isFormValid = false;
  } else {
    showSuccess(checkpassword);
  }

  // ตรวจสอบความยาวของรหัสผ่าน
  checkInputLength(password, 8, 20);

  // ตรวจสอบเบอร์โทร
  if (tel.value === '') {
    showError(tel, 'กรุณากรอกเบอร์มือถือของท่าน');
    isFormValid = false;
  } else if (!isValidPhoneNumber(tel.value)) {
    showError(tel, 'เบอร์มือถือไม่ถูกต้อง');
    isFormValid = false;
  } else {
    showSuccess(tel);
  }

  // ตรวจสอบวันเกิด
  if (day.value === '' || month.value === '' || year.value === '') {
    alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    isFormValid = false;
  } else if (!isValidDate(day.value, month.value, year.value)) {
    alert('กรุณากรอกวันเกิดที่ถูกต้อง');
    isFormValid = false;
  } else {
    showSuccess(day);
  }

  // ตรวจสอบเพศ
  if (gender.value === '') {
    showError(gender, 'กรุณาเลือกเพศ');
    isFormValid = false;
  } else {
    showSuccess(gender);
  }

  // หากฟอร์มถูกต้องทั้งหมด ส่งข้อมูลไปยังเซิร์ฟเวอร์
  if (isFormValid) {
    const formData = new FormData(form); // รวบรวมข้อมูลฟอร์ม

    fetch('/add', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('สมัครสมาชิกสำเร็จ');
        window.location.href = 'login.html';
      } else {
        alert('เกิดข้อผิดพลาด: ' + data.message);
      }
    })
    .catch(error => console.error('Error:', error));
  }
});

// ฟังก์ชันตรวจสอบความถูกต้องของเบอร์โทร
function isValidPhoneNumber(phoneNumber) {
  const re = /^[0-9]{10}$/; 
  return re.test(String(phoneNumber));
}

// ฟังก์ชันแสดงข้อผิดพลาด
function showError(input, message) {
  const formControl = input.parentElement;
  formControl.className = 'form-outline error';
  const small = formControl.querySelector('small');
  small.innerText = message;
}

// ฟังก์ชันแสดงสถานะสำเร็จ
function showSuccess(input) {
  const formControl = input.parentElement;
  formControl.className = 'form-outline success';
}

// ฟังก์ชันตรวจสอบอีเมล
function isValidEmail(email) {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
}

// ฟังก์ชันตรวจสอบความยาว input
function checkInputLength(input, min, max) {
  if (input.value.length < min) {
    showError(input, `ข้อมูลที่กรอกต้องยาวกว่า ${min} ตัวอักษร`)
  } else if (input.value.length > max) {
    showError(input, `ข้อมูลที่กรอกต้องไม่ยาวกว่า ${max} ตัวอักษร`)
  } else {
    showSuccess(input);
  }
}

// ฟังก์ชันตรวจสอบวันเกิด
function isValidDate(day, month, year) {
  const date = new Date(year, month - 1, day);
  return date.getFullYear() == year && date.getMonth() + 1 == month && date.getDate() == day;
}
